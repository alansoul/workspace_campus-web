import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname, search } = request.nextUrl;

  // 1. Explicitly allow public registration pages (including University Dean claim)
  const PUBLIC_ROUTES = ['/', '/login', '/register', '/university/register'];
  if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/university/register/')) {
    // If user is already logged in and tries to hit /login or /register, push them to dashboard
    if ((pathname === '/login' || pathname === '/register') && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 2. Define the protected internal Google-style App Suite
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/academics') ||
    pathname.startsWith('/freelance') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/admin');

  // 3. Deep-Link Interception: If not logged in, redirect to login WITH the intended destination
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the exact path they were trying to hit (e.g. /chat?room=123)
    loginUrl.searchParams.set('redirect', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Ensure the middleware runs on all core module paths
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