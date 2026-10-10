// campus-web/src/lib/api.ts

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Proxied base URL: Relative /api for Vercel Next.js rewrites, or direct Render URL
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://workspace-campus-api.onrender.com/api';
const API_URL = RAW_API_URL.replace(/\/+$/, '');

function resolveUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (API_URL.endsWith('/api') && cleanPath.startsWith('/api/')) {
    return `${API_URL}${cleanPath.slice(4)}`;
  }
  return `${API_URL}${cleanPath}`;
}

/**
 * Enterprise Production API Client:
 * - ZERO localStorage dependency (immune to client-side token theft)
 * - Pure HttpOnly Cookie forwarding via credentials: 'include'
 * - Graceful handling of Render cold boots & gateway 502/504 errors
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = resolveUrl(path);

  let res: Response;
  try {
    res = await fetch(url, {
      credentials: 'include', // Automatically passes and receives httpOnly cookies
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(
      0,
      'Backend unreachable. If using Render Free Tier, the instance may be waking up.'
    );
  }

  // 401 Unauthorized: Session is expired or invalid
  if (res.status === 401 && typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    const isPublic =
      currentPath === '/' ||
      currentPath.startsWith('/login') ||
      currentPath.startsWith('/register') ||
      currentPath.startsWith('/setup');

    // Immediate browser redirect preserving return path
    if (!isPublic) {
      const loginUrl = new URL('/login', window.location.origin);
      loginUrl.searchParams.set('redirect', currentPath + window.location.search);
      window.location.replace(loginUrl.toString());
    }
  }

  // Safely parse JSON or return null if HTML error page was returned
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    let errorMessage = `Error ${res.status}: Request failed`;

    if (data && typeof data === 'object') {
      const payload = data as { message?: unknown; error?: string };
      if (Array.isArray(payload.message)) {
        errorMessage = payload.message.join(', ');
      } else if (typeof payload.message === 'string') {
        errorMessage = payload.message;
      } else if (payload.error) {
        errorMessage = payload.error;
      }
    }

    throw new ApiError(res.status, errorMessage, data);
  }

  return data as T;
}

export const apiClient = apiFetch;
export const api = apiFetch;
export default apiFetch;