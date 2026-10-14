'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthSession } from '../hooks/useAuthSession';
import { useDomainResolver } from '../hooks/useDomainResolver';
import {
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  ArrowLeft,
  Mail,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { GoogleOAuthButton } from './GoogleOAuthButton';

interface ModernAuthCardProps {
  initialMode?: 'signin' | 'signup';
}

type Step = 'input' | 'verify-otp' | 'set-password' | 'forgot-password';

function sanitizeRedirect(target: string | null): string {
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

export function ModernAuthCard({ initialMode = 'signin' }: ModernAuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = sanitizeRedirect(searchParams.get('redirect'));

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [step, setStep] = useState<Step>('input');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalizedEmail = email.trim().toLowerCase();
  const { resolution, isResolving } = useDomainResolver(normalizedEmail);
  const { login, refreshSession } = useAuthSession();

  const isGmail = Boolean(resolution?.isGmail);
  const isUniversityEmail = Boolean(
    resolution?.isRegistered && resolution?.universityName,
  );
  const isInvalidDomain = Boolean(
    resolution &&
      !resolution.isGmail &&
      !resolution.isRegistered &&
      normalizedEmail.includes('@'),
  );

  // UI-only cookies (auth token stays httpOnly from API)
  const setUiCookies = (role: string, universityName?: string | null) => {
    const isSecure =
      typeof window !== 'undefined' && window.location.protocol === 'https:';
    const flags = `path=/; max-age=604800; SameSite=Lax; ${isSecure ? 'Secure;' : ''}`;
    document.cookie = `user_role=${encodeURIComponent(role)}; ${flags}`;
    document.cookie = `account_type=${
      universityName ? 'INSTITUTIONAL' : 'INDIVIDUAL'
    }; ${flags}`;
  };

  const resetMessages = () => {
    setError(null);
    setMessage(null);
  };

  // 1. Request OTP or password login
  const handleSubmitEmailOrPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (isInvalidDomain) {
      setError(
        resolution?.errorMessage ||
          'Only @gmail.com or admin-registered campus domains are allowed.',
      );
      return;
    }

    if (!normalizedEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      if (authMethod === 'otp') {
        if (mode === 'signup' && !name.trim()) {
          throw new Error('Please enter your full name.');
        }

        await apiFetch('/auth/otp/request', {
          method: 'POST',
          body: JSON.stringify({
            email: normalizedEmail,
            purpose: mode === 'signup' ? 'REGISTER' : 'LOGIN',
          }),
        });

        setStep('verify-otp');
        setOtp('');
        setMessage(`Verification code sent to ${normalizedEmail}.`);
      } else {
        // Password sign-in
        if (!password) {
          throw new Error('Please enter your password.');
        }

        await login({ email: normalizedEmail, password });
        await refreshSession();
        router.replace(redirectUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to process authentication request.';

      // Friendlier hint when password was never set
      if (
        authMethod === 'password' &&
        /invalid credentials|no password/i.test(msg)
      ) {
        setError(
          'No password set yet (or wrong password). Use OTP once to verify, then create your password.',
        );
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    try {
      const res = await apiFetch<{
        message?: string;
        requiresPasswordSetup?: boolean;
        user: {
          id: string;
          email: string;
          fullName: string;
          role: string;
          universityName?: string | null;
        };
      }>('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: normalizedEmail,
          otp: otp.trim(),
          fullName: mode === 'signup' ? name.trim() || undefined : undefined,
        }),
      });

      if (!res?.user) {
        throw new Error('Authentication response was invalid.');
      }

      // First-time user → must create password before full session
      if (res.requiresPasswordSetup) {
        setPassword('');
        setConfirmPassword('');
        setStep('set-password');
        setMessage('Email verified. Create a password to finish signup.');
        return;
      }

      // Returning user (already has password) → full login via httpOnly cookie
      setUiCookies(res.user.role, res.user.universityName);
      await refreshSession();
      router.replace(redirectUrl);
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid or expired verification code.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Create password after OTP (first signup)
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    try {
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters.');
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      const res = await apiFetch<{
        message?: string;
        user: {
          id: string;
          email: string;
          fullName: string;
          role: string;
          universityName?: string | null;
        };
      }>('/auth/password/set', {
        method: 'POST',
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          fullName: name.trim() || undefined,
        }),
      });

      if (res?.user) {
        setUiCookies(res.user.role, res.user.universityName);
      }

      await refreshSession();
      router.replace(redirectUrl);
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to save password.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Trigger Forgot Password OTP
  const handleForgotPasswordTrigger = async () => {
    resetMessages();
    if (isInvalidDomain || !normalizedEmail) {
      setError('Please enter your registered email address first.');
      return;
    }
    setIsLoading(true);
    try {
      await apiFetch('/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({
          email: normalizedEmail,
          purpose: 'RESET_PASSWORD',
        }),
      });
      setStep('forgot-password');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const title =
    step === 'verify-otp'
      ? 'Verify your code'
      : step === 'set-password'
        ? 'Create your password'
        : step === 'forgot-password'
          ? 'Reset your password'
          : mode === 'signin'
            ? 'Sign in to Northstar'
            : 'Create your account';

  const subtitle =
    step === 'verify-otp'
      ? `Enter the 6-digit code sent to ${normalizedEmail}`
      : step === 'set-password'
        ? 'Secure your account to finish signup'
        : step === 'forgot-password'
          ? 'Verify your identity with OTP to set a new password'
          : isUniversityEmail
            ? `Authenticating via ${resolution?.universityName}`
            : isGmail
              ? 'Personal Google account'
              : 'Enter your university or @gmail.com email to continue';

  return (
    <div className="min-h-screen bg-linear-to-tr from-indigo-100 via-purple-50 to-blue-100 flex items-center justify-center p-4 sm:p-6 font-['Google_Sans',sans-serif] select-none">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-145">
        {/* Left: Branding */}
        <div className="md:col-span-5 bg-linear-to-br from-[#1E1B4B] via-[#312E81] to-[#4338CA] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-cyan-400 to-indigo-400 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                ✦
              </div>
              <span className="font-semibold text-lg tracking-tight">
                Northstar Workspace
              </span>
            </Link>

            <div className="pt-8">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full text-cyan-300">
                Single Sign-On
              </span>
              <h2 className="text-2xl font-semibold mt-3 leading-snug">
                One verified account for all university apps.
              </h2>
              <p className="text-xs text-indigo-200 mt-2 leading-relaxed">
                Direct OTP access to Campus Academics, Circle Chat Rooms, and
                Workflow Escrow.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-indigo-200 pt-8 relative z-10 border-t border-indigo-500/30">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Verified @gmail.com & campus domains only</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>OTP verify → create password on first signup</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Then sign in with password or OTP anytime</span>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div className="space-y-5">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            </div>

            {/* University badge */}
            {isUniversityEmail && step === 'input' && (
              <div className="p-3 rounded-2xl bg-[#E8F0FE] border border-[#D2E3FC] text-xs text-[#0B57D0] flex items-center justify-between shadow-2xs">
                <span className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#1A73E8]" />
                  <span>🎓 {resolution?.universityName}</span>
                </span>
                <span className="text-[10px] font-bold bg-[#1A73E8] text-white px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
            )}

            {/* Gmail badge */}
            {isGmail && step === 'input' && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                <span className="font-medium">✉️ Personal Google Account</span>
                <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                  Individual
                </span>
              </div>
            )}

            {/* Invalid domain warning */}
            {isInvalidDomain && step === 'input' && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Unregistered domain</span>
                  <span className="text-[11px] text-amber-700">
                    {resolution?.errorMessage ||
                      'Only @gmail.com or admin-registered campus domains are allowed.'}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div
                className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl"
                role="alert"
              >
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl">
                {message}
              </div>
            )}

            {/* STEP 1: Email / Password */}
            {step === 'input' && (
              <form onSubmit={handleSubmitEmailOrPassword} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alan Soul"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@univ.edu.in or you@gmail.com"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                        isInvalidDomain
                          ? 'border-amber-400 focus:ring-amber-400'
                          : 'border-slate-300 focus:ring-[#1A73E8]'
                      }`}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {authMethod === 'password' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'signin' && (
                  <div className="flex items-center justify-between pt-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        setAuthMethod(authMethod === 'otp' ? 'password' : 'otp')
                      }
                      className="text-[#1A73E8] hover:underline font-medium cursor-pointer flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>
                        {authMethod === 'otp'
                          ? 'Sign in with Password instead'
                          : 'Sign in with OTP code'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleForgotPasswordTrigger}
                      className="text-slate-500 hover:text-[#0B57D0] hover:underline font-medium cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || isResolving || isInvalidDomain}
                  className="w-full py-3 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-sm transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    'Processing...'
                  ) : authMethod === 'otp' ? (
                    <>
                      <span>Send OTP Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>

                <div className="relative my-3 flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider">
                    or
                  </span>
                  <div className="border-t border-slate-200 w-full" />
                </div>

                <GoogleOAuthButton disabled={isLoading} />
              </form>
            )}

            {/* STEP 2: OTP */}
            {step === 'verify-otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-center tracking-[0.4em] font-mono text-xl focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                  <span>Didn&apos;t receive code?</span>
                  <button
                    type="button"
                    onClick={handleSubmitEmailOrPassword}
                    className="text-[#1A73E8] hover:underline font-semibold cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full py-3 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-sm transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Verifying...' : 'Verify code'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('input');
                    setOtp('');
                    resetMessages();
                  }}
                  className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change email address</span>
                </button>
              </form>
            )}

            {/* STEP 3: Create password (first signup only) */}
            {step === 'set-password' && (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="p-3 rounded-2xl bg-[#E8F0FE] border border-[#D2E3FC] text-xs text-[#0B57D0] flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>
                    Verified <strong>{normalizedEmail}</strong>. Set a password
                    to finish creating your account.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Create password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Confirm password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Next time you can use “Sign in with Password” or OTP.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    password.length < 8 ||
                    password !== confirmPassword
                  }
                  className="w-full py-3 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-sm transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading
                    ? 'Saving...'
                    : 'Create password & enter workspace'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('verify-otp');
                    resetMessages();
                  }}
                  className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to OTP</span>
                </button>
              </form>
            )}

            {/* STEP 4: Forgot Password Reset (Modular Component) */}
            {step === 'forgot-password' && (
              <ForgotPasswordForm
                email={normalizedEmail}
                redirectUrl={redirectUrl}
                onCancel={() => {
                  resetMessages();
                  setStep('input');
                }}
                onError={(msg) => setError(msg || null)}
                onSuccessCookie={setUiCookies}
                refreshSession={refreshSession}
              />
            )}
          </div>

          {step === 'input' && (
            <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
              {mode === 'signin' ? (
                <p>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setAuthMethod('otp');
                      setStep('input');
                      resetMessages();
                    }}
                    className="font-semibold text-[#1A73E8] hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setStep('input');
                      resetMessages();
                    }}
                    className="font-semibold text-[#1A73E8] hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModernAuthCard;