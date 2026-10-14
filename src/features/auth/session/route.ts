// campus-web/src/app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get('token');
  const role = searchParams.get('role') || 'STUDENT';
  const accountType = searchParams.get('accountType') || 'INDIVIDUAL';
  const destination = searchParams.get('redirect') || '/dashboard';

  // If token is missing, send back to login with error
  if (!token) {
    return NextResponse.redirect(
      new URL('/login?error=oauth_token_missing', request.url)
    );
  }

  const isProd = process.env.NODE_ENV === 'production';
  const response = NextResponse.redirect(new URL(destination, request.url));

  // Set the FIRST-PARTY HttpOnly cookie directly on workspace-campus-web.vercel.app
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  response.cookies.set('user_role', role, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  response.cookies.set('account_type', accountType, {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return response;
}