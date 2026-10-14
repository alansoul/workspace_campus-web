// campus-web/src/app/auth/callback/page.tsx
'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshSession } = useAuthSession();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role') || 'STUDENT';
    const accountType = searchParams.get('accountType') || 'INDIVIDUAL';
    const destination = searchParams.get('redirect') || '/dashboard';

    if (token) {
      // 1. Set first-party cookies directly on workspace-campus-web.vercel.app
      const isSecure = window.location.protocol === 'https:';
      const flags = `path=/; max-age=604800; SameSite=Lax; ${isSecure ? 'Secure;' : ''}`;

      document.cookie = `token=${encodeURIComponent(token)}; ${flags}`;
      document.cookie = `user_role=${encodeURIComponent(role)}; ${flags}`;
      document.cookie = `account_type=${encodeURIComponent(accountType)}; ${flags}`;

      // 2. Refresh React session context and navigate directly to dashboard
      refreshSession().then(() => {
        router.replace(destination);
      });
    } else {
      router.replace('/login?error=oauth_missing_token');
    }
  }, [searchParams, router, refreshSession]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      <div className="h-9 w-9 animate-spin rounded-full border-3 border-blue-500 border-t-transparent mb-4" />
      <p className="text-sm font-medium text-slate-300">Completing Google authentication...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm">
          Loading...
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}