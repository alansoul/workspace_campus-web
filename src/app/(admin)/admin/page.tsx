'use client';

import { useSyncExternalStore } from 'react';
import { User } from '@/types';
import { ShieldCheck, Users, Building2, CheckCircle2, Lock } from 'lucide-react';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}
function getUserSnapshot() { return localStorage.getItem('user'); }
function getServerSnapshot() { return null; }

export default function AdminConsolePage() {
  const rawUser = useSyncExternalStore(subscribe, getUserSnapshot, getServerSnapshot);

  let user: User | null = null;
  if (rawUser) {
    try { user = JSON.parse(rawUser) as User; } catch {}
  }

  // Strict Security Gate: Protect Admin View
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-sm space-y-4">
          <Lock className="w-10 h-10 text-amber-400 mx-auto" />
          <h1 className="text-base font-bold text-white">Access Restricted</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Campus Admin Console is restricted to verified Deans, HODs, and IT Administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-amber-400">
          <ShieldCheck className="w-6 h-6" /> Campus Admin Console
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage campus domains, faculty permissions, and institutional security settings for {user.universityName || 'your university'}.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Domain</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-white">Verified</p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Auto-validated
          </p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Registered Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-lg font-bold text-white">Active Portal</p>
          <p className="text-[10px] text-slate-400">Domain-bound signup enabled</p>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Admin Account</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-lg font-bold text-white">{user.fullName}</p>
          <p className="text-[10px] text-amber-400 font-mono">Role: {user.role}</p>
        </div>
      </div>
    </div>
  );
}