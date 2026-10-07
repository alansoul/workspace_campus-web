'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { User } from '@/types';
import {
  BookOpen,
  Briefcase,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getUserSnapshot(): string | null {
  return localStorage.getItem('user');
}

function getServerSnapshot(): string | null {
  return null;
}

export default function DashboardPage() {
  const rawUser = useSyncExternalStore(
    subscribe,
    getUserSnapshot,
    getServerSnapshot,
  );

  let user: User | null = null;
  if (rawUser) {
    try {
      user = JSON.parse(rawUser) as User;
    } catch (e) {
      console.error('Failed to parse user profile', e);
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-blue-900/40 via-indigo-900/20 to-slate-900 border border-blue-500/20 rounded-3xl p-8">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold mb-2">
          <Sparkles className="w-4 h-4" />
          <span>{user?.universityName || 'Campus Workspace'} • Verified Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">
          Welcome back, {user?.fullName || 'Student'}! 👋
        </h1>
        <p className="text-sm text-slate-400">
          Connected as <span className="text-blue-400 font-semibold">{user?.email}</span> with role{' '}
          <span className="text-emerald-400 font-mono font-semibold">{user?.role}</span>.
        </p>
      </div>

      {/* Clickable Suite Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/academics"
          className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-blue-500/50 hover:bg-slate-900/80 transition group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Academic Hub</h2>
              <p className="text-xs text-slate-400">Notes & Questions</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-blue-400 font-semibold pt-2 border-t border-slate-800">
            <span>Access materials</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/freelance"
          className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-emerald-500/50 hover:bg-slate-900/80 transition group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-105 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Marketplace</h2>
              <p className="text-xs text-slate-400">Campus Freelancing</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold pt-2 border-t border-slate-800">
            <span>Explore peer gigs</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/chat"
          className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-purple-500/50 hover:bg-slate-900/80 transition group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Discord Chat</h2>
              <p className="text-xs text-slate-400">Real-time WebSocket</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-purple-400 font-semibold pt-2 border-t border-slate-800">
            <span>Join conversation</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}