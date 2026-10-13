import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getSafeRedirectUrl(target: string | null): string {
  if (!target) return '/dashboard';
  // Relative paths only — block open redirects
  if (
    target.startsWith('/') &&
    !target.startsWith('//') &&
    !target.startsWith('/\\')
  ) {
    return target;
  }
  return '/dashboard';
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const accountType = request.cookies.get('account_type')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  const { pathname, search } = request.nextUrl;

  // 1. Authenticated users visiting auth routes are redirected to their dashboard
  if ((pathname === '/login' || pathname === '/register') && token) {
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    return NextResponse.redirect(
      new URL(getSafeRedirectUrl(redirectParam), request.url),
    );
  }

  // 2. Private routes gate
  const isStrictlyPrivate =
    pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  if (isStrictlyPrivate && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // 3. 🔒 STRICT ACADEMICS GATE: Personal accounts (INDIVIDUAL) cannot access /academics OR /academics/*
  if (
    token &&
    accountType === 'INDIVIDUAL' &&
    (pathname === '/academics' || pathname.startsWith('/academics/'))
  ) {
    return NextResponse.redirect(
      new URL('/dashboard?modal=link-campus&from=academics', request.url),
    );
  }

  // 4. Admin role gate
  if (pathname.startsWith('/admin') && token) {
    const allowedRoles = ['ADMIN', 'CAMPUS_ADMIN', 'SUPER_ADMIN'];
    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.redirect(
        new URL('/dashboard?error=unauthorized', request.url),
      );
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/academics',
    '/academics/:path*',
    '/freelance/:path*',
    '/chat/:path*',
    '/login',
    '/register',
    '/setup/:path*',
  ],
};