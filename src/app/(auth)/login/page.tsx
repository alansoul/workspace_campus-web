'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { User } from '@/types';
import { GraduationCap, LogIn, Loader2 } from 'lucide-react';

interface LoginResponse {
  accessToken: string;
  user: User;
}

// Next.js requires useSearchParams to be wrapped in a Suspense boundary for static generation
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

 async function handleLogin(e: React.FormEvent) {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const res = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(form),
    });

    // Token is automatically set as an httpOnly cookie by the server response
    localStorage.setItem('user', JSON.stringify(res.user));
    window.dispatchEvent(new Event('storage'));

    const redirect = searchParams.get('redirect') || '/dashboard';
    router.push(redirect);
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : 'An unexpected error occurred');
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl">
          <GraduationCap className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Campus Sign In</h1>
          <p className="text-xs text-slate-400">Students, Faculty & Administrators</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4 text-xs">
        <div>
          <label className="text-slate-300 font-medium block mb-1">
            Official Institutional Email
          </label>
          <input
            type="email"
            required
            placeholder="rohan@iiitnr.edu.in"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-slate-300 font-medium block mb-1">
            Password
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold p-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Sign In <LogIn className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-slate-500 text-xs mt-6">
        New student?{' '}
        <Link href="/register" className="text-blue-400 hover:underline">
          Create account
        </Link>
        {' · '}
        <Link href="/setup" className="text-emerald-400 hover:underline">
          Register university
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      {/* Fallback loader while searchParams initializes */}
      <Suspense fallback={<div className="text-slate-400 text-xs"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading workspace secure portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}