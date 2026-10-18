// campus-web/src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getSafeRedirectUrl(target: string | null): string {
  if (!target) return '/dashboard';
  if (
    target.startsWith('/') &&
    !target.startsWith('//') &&
    !target.startsWith('/\\')
  ) {
    return target;
  }
  return '/dashboard';
}

// Helper to inspect the real-time token payload at the edge
function parseJwtPayload(token?: string): { universityId?: string; role?: string } | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const cookieAccountType = request.cookies.get('account_type')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  const { pathname, search } = request.nextUrl;

  const payload = parseJwtPayload(token);
  const isInstitutional =
    Boolean(payload?.universityId && payload.universityId.trim() !== '') ||
    cookieAccountType === 'INSTITUTIONAL';

  // 1. Authenticated users visiting login/register are redirected to dashboard
  if ((pathname === '/login' || pathname === '/register') && token) {
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    const safeTarget = getSafeRedirectUrl(redirectParam);

    if (safeTarget === '/academics' || safeTarget === '/chat' || safeTarget === '/freelance') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.redirect(new URL(safeTarget, request.url));
  }

  // 2. Private routes: ONLY /dashboard and /admin strictly require a token
  const isStrictlyPrivate =
    pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  if (isStrictlyPrivate && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // 3. STRICT ACADEMICS GATE:
  // Personal accounts (INDIVIDUAL) CANNOT enter /academics.
  const isAcademicsRoute =
    pathname === '/academics' || pathname.startsWith('/academics/');

  if (token && isAcademicsRoute && !isInstitutional) {
    return NextResponse.redirect(
      new URL('/dashboard?modal=link-campus&from=academics', request.url),
    );
  }

  // 4. Admin role gate: Only ADMIN / CAMPUS_ADMIN / SUPER_ADMIN can enter /admin
  if (pathname.startsWith('/admin') && token) {
    const allowedRoles = ['ADMIN', 'CAMPUS_ADMIN', 'SUPER_ADMIN'];
    const effectiveRole = payload?.role || userRole;
    if (!effectiveRole || !allowedRoles.includes(effectiveRole)) {
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
    '/freelance',
    '/freelance/:path*',
    '/chat',
    '/chat/:path*',
    '/login',
    '/register',
    '/setup/:path*',
  ],
};