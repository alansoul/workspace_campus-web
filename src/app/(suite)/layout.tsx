'use client';

import { useSyncExternalStore } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { User } from '@/types';
import { AppLauncher } from '@/components/AppLauncher';
import { GraduationCap, LogOut } from 'lucide-react';
import { apiFetch } from '@/lib/api';

function subscribe(cb: () => void) {
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
}
function getSnap() { return localStorage.getItem('user'); }
function getServerSnap() { return null; }

export default function SuiteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const rawUser = useSyncExternalStore(subscribe, getSnap, getServerSnap);

  let user: User | null = null;
  if (rawUser) {
    try { user = JSON.parse(rawUser) as User; } catch {}
  }

  async function logout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch {
    // Continue cleanup even if network fails
  }
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('storage'));
  router.push('/login');
}

  const currentApp =
    pathname.startsWith('/academics') ? 'Academics' :
    pathname.startsWith('/freelance') ? 'Freelance' :
    pathname.startsWith('/chat') ? 'Campus Chat' :
    pathname.startsWith('/admin') ? 'Admin Console' :
    'Dashboard';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm">
              {user?.universityName || 'Campus Workspace'}
            </span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-xs text-slate-300 font-semibold">{currentApp}</span>
        </div>

        <div className="flex items-center gap-3">
          <AppLauncher userRole={user?.role || 'STUDENT'} />
          <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-300">
            {user?.fullName?.[0]?.toUpperCase() || 'U'}
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}