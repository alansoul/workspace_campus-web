// src/components/layout/UserProfileMenu.tsx
'use client';

import React, { useState } from 'react';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';

export function UserProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthSession();

  if (!user) return null;

  // Added explicit string typing to (n: string) to resolve TS 7006
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center hover:opacity-90 transition shadow-xs cursor-pointer"
        aria-label="User Account Menu"
      >
        {initials}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-2xl z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name || 'Campus Member'}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <div className="py-3 space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Institution</p>
              <p className="text-xs text-white font-medium truncate">
                {user.universityName || 'Independent Workspace'}
              </p>
              <span className="inline-block px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold mt-1">
                {user.role}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={async () => {
                  setIsOpen(false);
                  await logout();
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition cursor-pointer flex items-center justify-between"
              >
                <span>Sign out</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}