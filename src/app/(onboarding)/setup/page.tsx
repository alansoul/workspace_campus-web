'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { User } from '@/types';
import {
  Building2,
  ArrowRight,
  Loader2,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

interface ClaimResponse {
  message: string;
  accessToken: string;
  user: User;
  university: {
    id: string;
    name: string;
    shortCode: string;
  };
}

export default function ClaimUniversityPage() {
  const router = useRouter();
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [form, setForm] = useState({
    name: '',
    shortCode: '',
    domains: '',
    contactName: '',
    contactEmail: '',
    password: '',
  });
  const [otp, setOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const domains = form.domains
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    try {
      const res = await apiFetch<{ message: string; devOtp?: string }>(
        '/universities/request-otp',
        {
          method: 'POST',
          body: JSON.stringify({
            email: form.contactEmail,
            domains,
          }),
        },
      );

      if (res.devOtp) setDevOtpHint(res.devOtp);
      setStep('OTP');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const domains = form.domains
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    try {
      const res = await apiFetch<ClaimResponse>('/universities/claim', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          shortCode: form.shortCode,
          domains,
          contactName: form.contactName,
          contactEmail: form.contactEmail,
          password: form.password,
          otp,
        }),
      });

      localStorage.setItem('user', JSON.stringify(res.user));
      window.dispatchEvent(new Event('storage'));
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              Register Your University
            </h1>
            <p className="text-xs text-slate-400">
              For Deans, HODs, Principals & Campus Admins
            </p>
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
                University Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. IIIT Naya Raipur"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Short Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="IIITNR"
                  value={form.shortCode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      shortCode: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Campus Domains
                </label>
                <input
                  type="text"
                  required
                  placeholder="iiitnr.edu.in, student.iiitnr.edu.in"
                  value={form.domains}
                  onChange={(e) =>
                    setForm({ ...form, domains: e.target.value.toLowerCase() })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Rohan Sharma"
                  value={form.contactName}
                  onChange={(e) =>
                    setForm({ ...form, contactName: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Official University Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="dean@iiitnr.edu.in"
                  value={form.contactEmail}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contactEmail: e.target.value.toLowerCase(),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-300 leading-relaxed">
              We will send a 6-digit code to your official email. Verifying it
              proves you represent this university and activates your Admin
              account immediately.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold p-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Send Verification Code <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleClaim} className="space-y-4 text-xs">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" /> Code sent to{' '}
                {form.contactEmail}
              </p>
              {devOtpHint && (
                <p className="text-[10px] text-amber-400 font-mono">
                  Dev OTP: <strong>{devOtpHint}</strong>
                </p>
              )}
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-emerald-500"
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
                  <CheckCircle2 className="w-4 h-4" />
                  Verify & Activate Admin Account
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('DETAILS')}
              className="w-full text-center text-slate-500 hover:text-slate-300"
            >
              ← Edit details
            </button>
          </form>
        )}

        <p className="text-center text-slate-500 text-xs mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}