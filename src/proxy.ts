import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname, search } = request.nextUrl;

  const PUBLIC_ROUTES = ['/', '/login', '/register', '/university/register'];
  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/university/register/');

  // If already authenticated and visiting public routes, redirect to dashboard
  if (isPublicRoute) {
    if ((pathname === '/login' || pathname === '/register') && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected workspace routes
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/academics') ||
    pathname.startsWith('/freelance') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/admin');

  // Deep-Link Interception: Preserve destination when redirecting to login
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/academics/:path*',
    '/freelance/:path*',
    '/chat/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/university/register',
  ],
};