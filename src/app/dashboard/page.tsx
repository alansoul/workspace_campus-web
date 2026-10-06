'use client';

import { useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { User } from '@/types';
import {
  GraduationCap,
  LogOut,
  BookOpen,
  Briefcase,
  MessageSquare,
} from 'lucide-react';

// 1. Subscribe to storage changes (syncs across browser tabs)
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

// 2. Client snapshot: Read user from localStorage
function getUserSnapshot(): string | null {
  return localStorage.getItem('user');
}

// 3. Server snapshot: Always null during SSR
function getServerSnapshot(): string | null {
  return null;
}

export default function DashboardPage() {
  const router = useRouter();

  // Read user storage using React 19's recommended useSyncExternalStore hook
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
      console.error('Failed to parse user profile from storage', e);
    }
  }

  function handleLogout() {
    Cookies.remove('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-slate-800">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white">IIIT Naya Raipur</h1>
              <p className="text-[10px] text-blue-400 font-semibold">
                STUDENT WORKSPACE
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </aside>

      <main className="flex-1 p-8 space-y-8">
        <div className="bg-linear-to-r from-blue-900/40 via-indigo-900/20 to-slate-900 border border-blue-500/20 rounded-3xl p-8">
          <h1 className="text-3xl font-extrabold text-white mb-2">
            Welcome back, {user?.fullName || 'Student'}! 👋
          </h1>
          <p className="text-sm text-slate-400">
            Connected as{' '}
            <span className="text-blue-400 font-semibold">
              {user?.email || 'IIIT Naya Raipur'}
            </span>
            . Your campus workspace is active.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Academic Hub</h2>
              <p className="text-xs text-slate-400">Notes & Questions</p>
            </div>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Marketplace</h2>
              <p className="text-xs text-slate-400">Campus Freelancing</p>
            </div>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Discord Chat</h2>
              <p className="text-xs text-slate-400">Real-time WebSocket</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}