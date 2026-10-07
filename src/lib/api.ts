import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = Cookies.get('token');

  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && typeof window !== 'undefined') {
    Cookies.remove('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));

    if (
      !window.location.pathname.startsWith('/login') &&
      !window.location.pathname.startsWith('/register')
    ) {
      const loginUrl = new URL('/login', window.location.origin);
      loginUrl.searchParams.set(
        'redirect',
        window.location.pathname + window.location.search,
      );
      window.location.href = loginUrl.toString();
    }
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || `Error: ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}