'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { DomainResolution, User } from '@/types';
import {
  GraduationCap,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
} from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [resolution, setResolution] = useState<DomainResolution | null>(null);
  const [resolving, setResolving] = useState(false);

  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    branch: 'CSE',
    password: '',
  });
  const [otp, setOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!email.includes('@') || (email.split('@')[1]?.length ?? 0) < 3) {
        setResolution(null);
        return;
      }

      setResolving(true);
      apiFetch<DomainResolution>(
        `/auth/resolve-domain?email=${encodeURIComponent(email)}`,
      )
        .then((res) => {
          setResolution(res);
        })
        .catch(() => {
          setResolution({ allowed: false });
        })
        .finally(() => {
          setResolving(false);
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [email]);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!resolution?.allowed) return;
    setError('');
    setLoading(true);

    try {
      const res = await apiFetch<{ devOtp?: string }>('/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (res.devOtp) setDevOtpHint(res.devOtp);
      setStep('OTP');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyAndRegister(e: React.FormEvent) {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const res = await apiFetch<{ user: User }>('/auth/verify-and-register', {
      method: 'POST',
      body: JSON.stringify({ email, otp, ...form }),
    });

    localStorage.setItem('user', JSON.stringify(res.user));
    window.dispatchEvent(new Event('storage'));
    router.push('/dashboard');
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : 'An unexpected error occurred');
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl">
          <GraduationCap className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Student Registration</h1>
          <p className="text-xs text-slate-400">Institutional Identity Verification</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs">
          {error}
        </div>
      )}

      {step === 'DETAILS' ? (
        <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-medium block mb-1">
              Institutional Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-blue-500"
              placeholder="rohan@iiitnr.edu.in"
            />
            {resolving && (
              <p className="text-[10px] text-slate-500 mt-1">Verifying campus domain...</p>
            )}
            {!resolving && resolution?.allowed && (
              <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-emerald-400 flex items-center gap-2 text-[11px]">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Verified:{' '}
                <strong>{resolution.university?.name}</strong>
              </div>
            )}
            {!resolving && resolution && !resolution.allowed && (
              <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-md text-amber-400 text-[11px]">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> Unregistered Campus Domain
                </div>
                <Link
                  href="/setup"
                  className="font-semibold text-emerald-400 hover:underline pt-1 block"
                >
                  Claim portal for your university →
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Rohan Sharma"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1">Username</label>
              <input
                type="text"
                required
                placeholder="rohan_iiitnr"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1">Branch</label>
              <select
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="CSE">CSE</option>
                <option value="DSAI">DSAI</option>
                <option value="ECE">ECE</option>
                <option value="MECH">MECH</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !resolution?.allowed}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold p-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Request Verification Code <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndRegister} className="space-y-4 text-xs">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <KeyRound className="w-4 h-4" /> Code Sent to {email}
            </p>
            {devOtpHint && (
              <p className="text-[10px] text-amber-400 font-mono">
                🔑 Dev OTP Hint: <strong>{devOtpHint}</strong>
              </p>
            )}
          </div>
          <div>
            <label className="text-slate-300 block mb-1">6-Digit Code</label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-center text-lg font-mono tracking-widest text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold p-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Verify & Complete Signup <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      <p className="text-center text-slate-500 text-xs mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-400 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <Suspense
        fallback={
          <div className="text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading registration portal...
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}