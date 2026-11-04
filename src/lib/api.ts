// campus-web/src/lib/api.ts
import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Proxied base URL: Relative /api for Next.js rewrites, or direct Render URL
const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://workspace-campus-api.onrender.com/api';
const API_URL = RAW_API_URL.replace(/\/+$/, '');

// Create pre-configured Axios instance
export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Always include HttpOnly session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Extend Axios config type for internal retry tracking
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
  _isRetry?: boolean;
}

// Concurrency queue to prevent duplicate simultaneous refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

// ---------------------------------------------------------------------------
// Response Interceptor: 502 Cold Boot Retries & 401 Protected Route Redirects
// ---------------------------------------------------------------------------
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as CustomAxiosRequestConfig | undefined;

    // ⚡ 1. Render Free Tier 502 Cold Boot Auto-Retry (Max 1 retry after 2.5s)
    if (
      error.response?.status === 502 &&
      config &&
      (!config._retryCount || config._retryCount < 1)
    ) {
      config._retryCount = (config._retryCount || 0) + 1;
      await new Promise((resolve) => setTimeout(resolve, 2500));
      return axiosInstance(config);
    }

    // 🔒 2. 401 Unauthorized: Attempt Silent Token Refresh
    if (error.response?.status === 401 && config && typeof window !== 'undefined') {
      const requestUrl = config.url || '';
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/refresh') ||
        requestUrl.includes('/auth/otp');

      // If the 401 is already a retry or occurred during an auth endpoint, redirect to login
      if (isAuthEndpoint || config._isRetry) {
        const currentPath = window.location.pathname;
        const isPublic =
          currentPath === '/' ||
          currentPath === '/academics' ||
          currentPath === '/chat' ||
          currentPath === '/freelance' ||
          currentPath.startsWith('/login') ||
          currentPath.startsWith('/register') ||
          currentPath.startsWith('/setup');

        if (!isPublic) {
          const loginUrl = new URL('/login', window.location.origin);
          loginUrl.searchParams.set(
            'redirect',
            currentPath + window.location.search,
          );
          window.location.replace(loginUrl.toString());
        }

        return Promise.reject(error);
      }

      // If a refresh call is currently active, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(config))
          .catch((err) => Promise.reject(err));
      }

      config._isRetry = true;
      isRefreshing = true;

      try {
        // Silently request a refreshed session cookie
        await axiosInstance.post('/auth/refresh');
        processQueue(null);
        return axiosInstance(config);
      } catch (refreshError) {
        processQueue(refreshError);

        const currentPath = window.location.pathname;
        const isPublic =
          currentPath === '/' ||
          currentPath === '/academics' ||
          currentPath === '/chat' ||
          currentPath === '/freelance' ||
          currentPath.startsWith('/login') ||
          currentPath.startsWith('/register') ||
          currentPath.startsWith('/setup');

        if (!isPublic) {
          const loginUrl = new URL('/login', window.location.origin);
          loginUrl.searchParams.set(
            'redirect',
            currentPath + window.location.search,
          );
          window.location.replace(loginUrl.toString());
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 🚨 3. Standardize API Error output format
    const status = error.response?.status || 0;
    let errorMessage = error.message || 'Network request failed';
    const errorData = error.response?.data;

    if (errorData && typeof errorData === 'object') {
      const payload = errorData as { message?: unknown; error?: string };
      if (Array.isArray(payload.message)) {
        errorMessage = payload.message.join(', ');
      } else if (typeof payload.message === 'string') {
        errorMessage = payload.message;
      } else if (payload.error) {
        errorMessage = payload.error;
      }
    }

    return Promise.reject(new ApiError(status, errorMessage, errorData));
  },
);

// ---------------------------------------------------------------------------
// Backward-Compatible Wrapper for Existing Components
// ---------------------------------------------------------------------------
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const url = path.startsWith('/api/') ? path.replace(/^\/api/, '') : path;

  let requestData: unknown = undefined;
  if (options.body) {
    try {
      requestData =
        typeof options.body === 'string'
          ? (JSON.parse(options.body) as unknown)
          : options.body;
    } catch {
      requestData = options.body;
    }
  }

  const axiosConfig: AxiosRequestConfig = {
    url,
    method,
    data: requestData,
    headers: options.headers as AxiosRequestConfig['headers'],
  };

  const response = await axiosInstance.request<T>(axiosConfig);
  return response.data;
}

export const apiClient = apiFetch;
export const api = apiFetch;
export default apiFetch;