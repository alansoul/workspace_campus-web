// campus-web/src/app/(workspace)/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import {
  Settings,
  ShieldCheck,
  Unlink,
  Users,
  ArrowLeft,
  Mail,
  Building2,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, refreshSession, isLoading } = useAuthSession();
  const router = useRouter();
  const [isUnlinking, setIsUnlinking] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?redirect=/settings');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-slate-400 font-['Google_Sans',sans-serif]">
        Loading settings...
      </div>
    );
  }

  const isInstitutional = Boolean(
    user.universityId || user.accountType === 'INSTITUTIONAL',
  );
  const isAdmin =
    user.role === 'ADMIN' ||
    user.role === 'CAMPUS_ADMIN' ||
    user.role === 'SUPER_ADMIN';

  // Safe fallback to prevent TypeScript error if institutionalEmail is optional
  const institutionalEmail = (user as { institutionalEmail?: string | null })
    .institutionalEmail;

  const handleUnlink = async () => {
    const ok = window.confirm(
      'Unlink university email? You will lose Academics access until you link again.',
    );
    if (!ok) return;

    setIsUnlinking(true);
    try {
      const res = await apiFetch<{ accessToken?: string; message?: string }>(
        '/auth/campus/unlink',
        { method: 'POST' },
      );

      // 1. Immediately downgrade cookies on workspace-campus-web.vercel.app
      const isSecure = window.location.protocol === 'https:';
      const flags = `path=/; max-age=604800; SameSite=Lax; ${isSecure ? 'Secure;' : ''}`;

      document.cookie = `account_type=INDIVIDUAL; ${flags}`;
      if (res?.accessToken) {

      }

      toast.success('University email unlinked. Account is Individual again.');

      // 2. Refresh session context
      await refreshSession();

      // 3. 🚨 HARD RELOAD: Instantly locks Academics and resets all workspace menus
      window.location.reload();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to unlink university email.',
      );
      setIsUnlinking(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFD] p-6 md:p-10 font-['Google_Sans',sans-serif]">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-full hover:bg-white border border-transparent hover:border-slate-200 text-slate-500 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-700" />
            <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
          </div>
        </div>

        {/* Account card */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" /> Account
          </h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Login email</span>
              <span className="font-mono text-slate-900 text-right break-all">
                {user.email}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Name</span>
              <span className="text-slate-900">{user.name || '—'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Role</span>
              <span className="text-slate-900 font-medium">{user.role}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Account type</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                {user.accountType || (isInstitutional ? 'INSTITUTIONAL' : 'INDIVIDUAL')}
              </span>
            </div>
          </div>
        </section>

        {/* Campus card */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" /> Campus link
          </h2>

          {isInstitutional ? (
            <>
              <p className="text-sm text-slate-800 font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                {user.universityName || 'Verified campus'}
              </p>
              {institutionalEmail && (
                <p className="text-xs font-mono text-slate-500">
                  Linked: {institutionalEmail}
                </p>
              )}
              <button
                type="button"
                onClick={handleUnlink}
                disabled={isUnlinking}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition"
              >
                <Unlink className="w-4 h-4" />
                {isUnlinking ? 'Unlinking...' : 'Unlink University Email'}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                No campus email linked. Link one to unlock Academics.
              </p>
              <Link
                href="/dashboard?modal=link-campus&from=settings"
                className="inline-flex px-4 py-2.5 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white text-sm font-semibold transition"
              >
                Link campus email
              </Link>
            </>
          )}
        </section>

        {/* Admin / management */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" /> Campus management
          </h2>
          {isAdmin ? (
            <>
              <p className="text-xs text-slate-500">
                Manage students, domains, and university settings in Admin Console.
              </p>
              <Link
                href="/admin"
                className="inline-flex px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition"
              >
                Open Admin Console
              </Link>
            </>
          ) : (
            <p className="text-xs text-slate-500">
              Student management is available only to campus admins. Ask your
              university administrator if you need access.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}