'use client';

import React, { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, X, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface LinkCampusModalProps {
  open: boolean;
  onClose: () => void;
}

export function LinkCampusModal({ open, onClose }: LinkCampusModalProps) {
  const { refreshSession } = useAuthSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromRoute = searchParams.get('from') || 'dashboard';

  const [institutionalEmail, setInstitutionalEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [isLoading, setIsLoading] = useState(false);

  if (!open) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await apiFetch<{ message: string; universityName?: string }>(
        '/auth/campus/link/request',
        {
          method: 'POST',
          body: JSON.stringify({
            institutionalEmail: institutionalEmail.trim().toLowerCase(),
          }),
        },
      );

      toast.success(res.message || 'Verification code sent to your email!');
      setStep('otp');
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to send verification code.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiFetch('/auth/campus/link/verify', {
        method: 'POST',
        body: JSON.stringify({
          institutionalEmail: institutionalEmail.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      // 1. Toast Notification
      toast.success('Campus email linked successfully! Access granted.');

      // 2. Smooth Auto-Close
      onClose();
      setIsLoading(false);

      // 3. Clear URL params so modal doesn't re-open on reload
      const newUrl = window.location.pathname;
      router.replace(fromRoute === 'academics' ? '/academics' : newUrl);

      // 4. Refresh auth session & route
      await refreshSession();
      router.refresh();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Invalid or expired verification code.',
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 select-none font-['Google_Sans',sans-serif] animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 p-6 sm:p-8 relative animate-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-[#0B57D0] mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#1A73E8]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Unlock Campus Features
          </h2>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed mb-5">
          Link your official university email (e.g.{' '}
          <code>student@univ.edu.in</code>) to unlock Academics, course PYQs, and campus channels.
        </p>

        {step === 'input' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Official University Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={institutionalEmail}
                  onChange={(e) => setInstitutionalEmail(e.target.value)}
                  placeholder="student@iiitnr.ac.in"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !institutionalEmail}
              className="w-full py-3 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-sm transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center tracking-[0.4em] font-mono text-xl focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length < 6}
              className="w-full py-3 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-sm transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Linking Campus...' : 'Verify Code & Link Campus'}
            </button>

            <button
              type="button"
              onClick={() => setStep('input')}
              className="w-full py-1 text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer text-center"
            >
              Change email address
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LinkCampusModal;