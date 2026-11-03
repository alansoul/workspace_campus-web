import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const role = request.nextUrl.searchParams.get('role');
  const accountType = request.nextUrl.searchParams.get('accountType');

  // Prepare clean redirect to dashboard without tokens in the address bar
  const targetUrl = new URL('/dashboard', request.nextUrl.origin);
  const response = NextResponse.redirect(targetUrl);

  if (token) {
    const isProd = process.env.NODE_ENV === 'production';

    // 1. Set the secure, HttpOnly authentication token on vercel.app
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // 2. Set UI hint cookies
    if (role) {
      response.cookies.set('user_role', role, {
        httpOnly: false,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    if (accountType) {
      response.cookies.set('account_type', accountType, {
        httpOnly: false,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }
  }

  return response;
}