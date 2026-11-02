'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthSession } from '../hooks/useAuthSession';
import { useDomainResolver } from '../hooks/useDomainResolver';
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Mail,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { GoogleOAuthButton } from './GoogleOAuthButton';
import { AuthBackground } from './AuthBackground';

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
  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('password');
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

  // 🌐 PLACED HERE: Capture Google OAuth token from URL, set cookies, and redirect
  // Capture Google OAuth token from URL, re-hydrate session, and redirect
  useEffect(() => {
    const oauthToken = searchParams.get('token');

    if (oauthToken) {
      // Re-hydrate session and immediately forward to dashboard
      refreshSession().then(() => {
        router.replace(redirectUrl);
      });
    }
  }, [searchParams, redirectUrl, refreshSession, router]);

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

  // Session details (role and accountType) are derived securely from the signed JWT payload
  const setUiCookies = (role?: string, universityName?: string | null) => {
    void role;
    void universityName;
  };

  const resetMessages = () => {
    setError(null);
    setMessage(null);
  };

  // If redirecting from Google OAuth token, show subtle spinner to avoid form flicker
  if (searchParams.get('token')) {
    return (
      <div className="min-h-screen bg-linear-to-tr from-indigo-100 via-purple-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-3 border-[#0B57D0] border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-slate-700">Completing Google sign in...</p>
        </div>
      </div>
    );
  }

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

        const res = (await login({
          email: normalizedEmail,
          password,
        })) as unknown as {
          user?: { role: string; universityName?: string | null };
        } | null;

        if (res?.user) {
          setUiCookies(res.user.role, res.user.universityName);
        }

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

      // Returning user (already has password) → full login via cookie
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

  const handleResendOtp = async () => {
    resetMessages();
    setIsLoading(true);

    try {
      await apiFetch('/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({
          email: normalizedEmail,
          purpose: mode === 'signup' ? 'REGISTER' : 'LOGIN',
        }),
      });
      setMessage(`A new verification code was sent to ${normalizedEmail}.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification code.');
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
    <AuthBackground>
      <div className="w-full max-w-120 overflow-hidden rounded-[26px] border border-white/80 bg-white/72 shadow-[0_20px_60px_rgba(71,102,190,0.16)] backdrop-blur-2xl">
        <div className="flex flex-col gap-4 bg-white/35 p-5 sm:gap-5 sm:p-7">
          <div className="space-y-4">
            <div className="space-y-2 text-center">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-[14px] bg-linear-to-br from-sky-400 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-[23px] font-bold tracking-tight text-slate-900 sm:text-2xl">
                {step === 'input' && mode === 'signin' ? 'Welcome back' : title}
              </h3>
              <p className="mx-auto max-w-sm text-[13px] leading-relaxed text-slate-500">
                {subtitle}
              </p>
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
              <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/45 px-3 py-2 text-[11px] text-slate-600">
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
              <form onSubmit={handleSubmitEmailOrPassword} className="space-y-3">
                {mode === 'signup' && (
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alan Soul"
                      className="w-full rounded-xl border border-indigo-100 bg-white/85 px-4 py-2.5 text-[13px] text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                )}

                {mode === 'signin' && (
                  <div
                    className="grid grid-cols-2 rounded-full border border-indigo-100 bg-indigo-50/80 p-1"
                    role="group"
                    aria-label="Authentication method"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('password');
                        resetMessages();
                      }}
                      aria-pressed={authMethod === 'password'}
                      className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                        authMethod === 'password'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('otp');
                        resetMessages();
                      }}
                      aria-pressed={authMethod === 'otp'}
                      className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                        authMethod === 'otp'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      OTP Code
                    </button>
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-700">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@univ.edu.in or you@gmail.com"
                      className={`w-full rounded-xl border bg-white/85 py-2.5 pl-11 pr-4 text-[13px] text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                        isInvalidDomain
                          ? 'border-amber-400 focus:border-amber-400 focus:ring-amber-100'
                          : 'border-indigo-100 focus:border-blue-400 focus:ring-blue-100'
                      }`}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {authMethod === 'password' && (
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-700">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-indigo-100 bg-white/85 px-4 py-2.5 text-[13px] text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
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

                {mode === 'signin' && authMethod === 'password' && (
                  <div className="flex justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={handleForgotPasswordTrigger}
                      className="text-sm font-medium text-blue-600 transition hover:text-blue-800 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || isResolving || isInvalidDomain}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-700 to-blue-600 py-3 text-[13px] font-semibold text-white shadow-md shadow-blue-600/15 transition-colors duration-200 hover:from-blue-800 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-700">
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
                    className="w-full rounded-xl border border-indigo-100 bg-white/85 px-4 py-2.5 text-center font-mono text-lg tracking-[0.4em] text-slate-800 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                  <span>Didn&apos;t receive code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-[#1A73E8] hover:underline font-semibold cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-700 to-blue-600 py-3 text-[13px] font-semibold text-white shadow-md shadow-blue-600/15 transition-colors duration-200 hover:from-blue-800 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
              <form onSubmit={handleSetPassword} className="space-y-3">
                <div className="p-3 rounded-2xl bg-[#E8F0FE] border border-[#D2E3FC] text-xs text-[#0B57D0] flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>
                    Verified <strong>{normalizedEmail}</strong>. Set a password
                    to finish creating your account.
                  </span>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-700">
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
                      className="w-full rounded-xl border border-indigo-100 bg-white/85 px-4 py-2.5 text-[13px] text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
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
                  <label className="mb-1 block text-[11px] font-medium text-slate-700">
                    Confirm password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full rounded-xl border border-indigo-100 bg-white/85 px-4 py-2.5 text-[13px] text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-700 to-blue-600 py-3 text-[13px] font-semibold text-white shadow-md shadow-blue-600/15 transition-colors duration-200 hover:from-blue-800 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
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
                      setAuthMethod('password');
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
    </AuthBackground>
  );
}

export default ModernAuthCard;