// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const accountType = request.cookies.get('account_type')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  const { pathname, search } = request.nextUrl;

  const PUBLIC_ROUTES = ['/', '/login', '/register', '/setup'];
  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/setup');

  // If already authenticated and visiting auth screens, send to dashboard
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

  // Domain Rule 1: Academics is only for Institutional university emails
  if (pathname.startsWith('/academics') && accountType === 'INDIVIDUAL') {
    return NextResponse.redirect(
      new URL('/dashboard?modal=join-university', request.url)
    );
  }

  // Domain Rule 2: Admin console is only for CAMPUS_ADMIN
  if (pathname.startsWith('/admin') && userRole !== 'CAMPUS_ADMIN' && userRole !== 'SUPER_ADMIN') {
    return NextResponse.redirect(
      new URL('/dashboard?error=unauthorized', request.url)
    );
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
    '/setup/:path*',
  ],
};