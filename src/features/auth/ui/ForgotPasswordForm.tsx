// campus-web/src/features/auth/ui/ForgotPasswordForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '@/lib/api';

interface ForgotPasswordFormProps {
  email: string;
  redirectUrl: string;
  onCancel: () => void;
  onError: (msg: string) => void;
  onSuccessCookie: (role: string, universityName?: string | null) => void;
  refreshSession: () => Promise<void>;
}

export function ForgotPasswordForm({
  email,
  redirectUrl,
  onCancel,
  onError,
  onSuccessCookie,
  refreshSession,
}: ForgotPasswordFormProps) {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError('');
    setIsLoading(true);

    try {
      if (otp.length < 6) throw new Error('Enter the 6-digit verification code.');
      if (password.length < 8) throw new Error('Password must be at least 8 characters.');
      if (password !== confirmPassword) throw new Error('Passwords do not match.');

      const { data: res } = await axiosInstance.post<{
        user?: { role: string; universityName?: string | null };
      }>('/auth/password/reset', {
        email: email.toLowerCase().trim(),
        otp,
        newPassword: password,
      });

      if (res?.user) {
        onSuccessCookie(res.user.role, res.user.universityName);
      }

      await refreshSession();
      router.replace(redirectUrl);
      router.refresh();
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700">
        Enter the 6-digit security code sent to{' '}
        <span className="font-semibold text-slate-900">{email}</span> and choose
        your new password.
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          6-Digit Reset Code
        </label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          placeholder="123456"
          className="w-full px-4 py-2 rounded-xl border border-slate-300 text-center tracking-[0.4em] font-mono text-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          New Password
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Confirm New Password
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
        />
      </div>

      <button
        type="submit"
        disabled={
          isLoading ||
          otp.length < 6 ||
          password.length < 8 ||
          password !== confirmPassword
        }
        className="w-full py-3 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-sm transition shadow-xs cursor-pointer disabled:opacity-50"
      >
        {isLoading ? 'Resetting...' : 'Reset Password & Sign In'}
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="w-full py-1 text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer text-center"
      >
        Back to Sign In
      </button>
    </form>
  );
}