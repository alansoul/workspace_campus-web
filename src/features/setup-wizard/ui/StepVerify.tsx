// src/features/setup-wizard/ui/StepVerify.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { SetupFormData } from '../types/setup.types';
import { Eye, EyeOff } from 'lucide-react';
import { setupService } from '../services/setup.service';

interface StepVerifyProps {
  formData: SetupFormData;
  updateFields: (fields: Partial<SetupFormData>) => void;
  onSubmit: (overrides?: Partial<SetupFormData>) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
  error: string | null;
}

function cleanDomainString(raw: string): string {
  return raw
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '')
    .trim()
    .toLowerCase();
}

export function StepVerify({
  formData,
  updateFields,
  onSubmit,
  onBack,
  isSubmitting,
  error,
}: StepVerifyProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState(formData.adminPassword || '');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const cleanDomain = cleanDomainString(formData.universityDomain) || 'stanford.edu';
  const constructedEmail = `${username.trim().toLowerCase()}@${cleanDomain}`;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const isUsernameValid = username.trim().length > 0;
  const isPasswordValid = password.length >= 8;
  const isConfirmValid = password === confirmPassword && confirmPassword.length > 0;
  const isOtpValid = otp.trim().length === 6;

  const canSubmit =
    isUsernameValid && isPasswordValid && isConfirmValid && isOtpValid && !isSubmitting;

  const handleRequestOtp = async () => {
    if (cooldown > 0) return;
    setOtpLoading(true);
    setOtpNotice(null);
    try {
      await setupService.requestVerificationOtp(constructedEmail, cleanDomain);
      setCooldown(60);
      setOtpNotice(`Verification code sent to ${constructedEmail} (and your verified Gmail inbox).`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setOtpNotice(err.message);
      } else {
        setOtpNotice('Failed to request verification code.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // Generate short code directly from current domain/org to avoid collision
    const dynamicShortCode =
      cleanDomain.split('.')[0]?.toUpperCase().slice(0, 4) || 'CAMP';

    const payloadOverrides: Partial<SetupFormData> = {
      universityDomain: cleanDomain,
      adminPassword: password,
      currentEmail: constructedEmail,
      otpCode: otp.trim(),
      shortCode: dynamicShortCode,
    };

    updateFields(payloadOverrides);
    // Pass overrides directly so submission never uses stale state
    await onSubmit(payloadOverrides);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-normal text-[#1F1F1F] tracking-tight">
          Create a username
        </h1>
        <p className="text-xs text-[#5F6368] leading-relaxed">
          You&apos;ll use your username to sign in to your Northstar Workspace account and create your business email address.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {otpNotice && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-xs text-blue-800 rounded-lg">
          {otpNotice}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        <div className="space-y-1">
          <div className="flex items-center border border-[#747775] focus-within:ring-2 focus-within:ring-[#0B57D0] focus-within:border-transparent rounded-lg px-3 py-2.5 transition bg-white">
            <input
              type="text"
              required
              autoFocus
              maxLength={64}
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9._-]/g, ''))}
              placeholder="Username"
              className="flex-1 text-sm text-[#1F1F1F] placeholder-[#5F6368] focus:outline-none bg-transparent"
            />
            <span className="text-xs sm:text-sm text-[#5F6368] font-mono select-none pl-1 truncate max-w-45">
              @{cleanDomain}
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px] px-1 text-[#5F6368]">
            <span>Admin username</span>
            <span>{username.length}/64</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center border border-[#747775] focus-within:ring-2 focus-within:ring-[#0B57D0] focus-within:border-transparent rounded-lg px-3 py-2.5 transition bg-white">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              maxLength={100}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="flex-1 text-sm text-[#1F1F1F] placeholder-[#5F6368] focus:outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#5F6368] hover:text-[#1F1F1F] p-1 transition cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex justify-between items-center text-[11px] px-1 text-[#5F6368]">
            <span>Password (at least 8 characters)</span>
            <span>{password.length}/100</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center border border-[#747775] focus-within:ring-2 focus-within:ring-[#0B57D0] focus-within:border-transparent rounded-lg px-3 py-2.5 transition bg-white">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              maxLength={100}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="flex-1 text-sm text-[#1F1F1F] placeholder-[#5F6368] focus:outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-[#5F6368] hover:text-[#1F1F1F] p-1 transition cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex justify-between items-center text-[11px] px-1 text-[#5F6368]">
            <span>{password && confirmPassword && password !== confirmPassword ? 'Passwords do not match' : ''}</span>
            <span>{confirmPassword.length}/100</span>
          </div>
        </div>

        <div className="space-y-1 pt-1">
          <div className="flex gap-2">
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="6-digit verification code"
              className="flex-1 px-3 py-2.5 rounded-lg border border-[#747775] text-sm text-[#1F1F1F] placeholder-[#5F6368] focus:outline-none focus:ring-2 focus:ring-[#0B57D0] font-mono tracking-widest text-center"
            />
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={otpLoading || cooldown > 0}
              className="px-4 py-2.5 rounded-lg border border-[#0B57D0] text-[#0B57D0] hover:bg-[#F8FAFD] text-xs font-semibold whitespace-nowrap transition cursor-pointer disabled:opacity-50"
            >
              {otpLoading ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Get code'}
            </button>
          </div>
          <p className="text-[11px] text-[#5F6368] px-1">
            Click &quot;Get code&quot; to receive the code via email (or check terminal logs).
          </p>
        </div>

        <p className="text-[11px] text-[#5F6368] leading-relaxed pt-2">
          By clicking <strong className="text-[#1F1F1F]">Agree and continue</strong>, you agree to the{' '}
          <span className="text-[#0B57D0] hover:underline cursor-pointer">Northstar Workspace Agreement</span> and{' '}
          <span className="text-[#0B57D0] hover:underline cursor-pointer">Supplemental Terms and Conditions</span>.
        </p>

        <div className="flex items-center gap-4 pt-3">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition cursor-pointer"
          >
            ←
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-8 py-2.5 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-sm transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? 'Provisioning...' : 'Agree and continue'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StepVerify;