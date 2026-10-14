// campus-web/src/app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get('token');
  const role = searchParams.get('role') || 'STUDENT';
  const accountType = searchParams.get('accountType') || 'INDIVIDUAL';
  const destination = searchParams.get('redirect') || '/dashboard';

  if (!token) {
    return NextResponse.redirect(
      new URL('/login?error=oauth_failed', request.url)
    );
  }

  const isProd = process.env.NODE_ENV === 'production';
  const response = NextResponse.redirect(new URL(destination, request.url));

  const cookieOptions = {
    secure: isProd,
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  };

  // Set first-party cookies directly on workspace-campus-web.vercel.app
  response.cookies.set('token', token, {
    ...cookieOptions,
    httpOnly: true,
  });

  response.cookies.set('user_role', role, {
    ...cookieOptions,
    httpOnly: false,
  });

  response.cookies.set('account_type', accountType, {
    ...cookieOptions,
    httpOnly: false,
  });

  return response;
}