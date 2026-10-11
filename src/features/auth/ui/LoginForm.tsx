// src/features/auth/ui/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDomainResolver } from '../hooks/useDomainResolver';
import { useAuthSession } from '../hooks/useAuthSession';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [useOtp, setUseOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const { resolution, isResolving } = useDomainResolver(email);
  const { login } = useAuthSession();

  const isPersonalEmail =
    email.includes('@gmail.com') ||
    email.includes('@yahoo.com') ||
    email.includes('@outlook.com');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({
        email,
        password: useOtp ? undefined : password,
        otp: useOtp ? otp : undefined,
      });
      // Redirect handled inside useAuthSession or via window
      window.location.href = redirectPath;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid credentials. Please verify your email and password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white border border-slate-200 rounded-3xl shadow-xl">
      {/* Brand Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center mx-auto text-lg shadow-sm">
          N
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
        <p className="text-xs text-slate-500">to continue to Northstar Campus Workspace</p>
      </div>

      {/* Dynamic University Domain Detection Badge */}
      {isResolving && (
        <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          Detecting institutional domain...
        </div>
      )}

      {resolution?.isRegistered && resolution.universityName && (
        <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>🎓</span>
            <span className="font-semibold">{resolution.universityName}</span>
          </div>
          <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">Verified Campus</span>
        </div>
      )}

      {isPersonalEmail && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-snug">
          ⚠️ <strong>Individual Account:</strong> Logging in with personal email grants access to Freelance and Chat. Academic Drive requires an official university domain.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Email address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@university.edu or name@gmail.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
          />
        </div>

        {!useOtp ? (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => setUseOtp(true)}
                className="text-[11px] font-medium text-blue-600 hover:underline"
              >
                Sign in with OTP instead
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">One-Time Password (OTP)</label>
              <button
                type="button"
                onClick={() => setUseOtp(false)}
                className="text-[11px] font-medium text-blue-600 hover:underline"
              >
                Use Password
              </button>
            </div>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 tracking-widest text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Signing in...' : 'Continue'}
        </button>
      </form>

      {/* Footer / Setup CTA */}
      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
        Is your campus not registered?{' '}
        <Link href="/setup" className="text-blue-600 font-semibold hover:underline">
          Claim University Workspace
        </Link>
      </div>
    </div>
  );
}