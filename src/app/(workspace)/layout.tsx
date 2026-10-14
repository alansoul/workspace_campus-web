// campus-web/src/app/(workspace)/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { AppLauncher } from '@/components/layout/AppLauncher';
import { UserProfileMenu } from '@/components/layout/UserProfileMenu';

// Self-contained loader: mounts & unmounts with isLoading (No cascading setState)
function WorkspaceLoader() {
  const [showWakingNotice, setShowWakingNotice] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowWakingNotice(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFD] flex flex-col items-center justify-center select-none font-['Google_Sans',sans-serif] p-4 text-center">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300 max-w-sm">
        <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-cyan-500 via-indigo-600 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/20 animate-pulse">
          ✦
        </div>
        <div className="space-y-2 w-full">
          <h3 className="text-base font-semibold text-slate-800 tracking-tight">
            Northstar Workspace
          </h3>
          <p className="text-xs text-slate-500 font-medium transition-all">
            {showWakingNotice
              ? '⚡ Backend server is waking up from idle sleep (Render free tier), almost ready...'
              : 'Initializing workspace session...'}
          </p>
          {showWakingNotice && (
            <div className="w-48 mx-auto bg-slate-200 h-1 rounded-full overflow-hidden mt-3">
              <div className="bg-blue-600 h-full w-2/3 animate-pulse rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SuiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuthSession();

  // 1. Smart Branded Loading Screen (Mounts/Unmounts cleanly)
  if (isLoading) {
    return <WorkspaceLoader />;
  }

  // 2. Unauthenticated Visitor -> Render child page without app shell
  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  // 3. Resolve Current App Name for Top Breadcrumb
  const currentApp =
    pathname.startsWith('/academics') ? 'Academics & Drive' :
    pathname.startsWith('/freelance') ? 'Freelance Hub' :
    pathname.startsWith('/chat') ? 'Campus Chat' :
    pathname.startsWith('/admin') ? 'Admin Console' :
    pathname.startsWith('/settings') ? 'Settings' :
    'Dashboard';

  const universityTitle = user.universityName || 'Campus Workspace';

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-slate-900 flex flex-col font-['Google_Sans',sans-serif]">
      {/* Universal Workspace Header Bar */}
      <header className="h-14 border-b border-slate-800 bg-[#0E1525] text-white flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
              ✦
            </div>
            <span className="font-semibold text-sm tracking-tight text-white group-hover:text-cyan-300 transition-colors truncate max-w-[200px] sm:max-w-xs">
              {universityTitle}
            </span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-xs text-slate-300 font-medium truncate">{currentApp}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* 9-Dot App Launcher */}
          <AppLauncher userRole={user.role || 'STUDENT'} />

          {/* User Profile Avatar & Dropdown Menu */}
          <UserProfileMenu />
        </div>
      </header>

      {/* Main Workspace Page View */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}