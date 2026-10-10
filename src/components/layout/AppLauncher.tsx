'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Grid,
  BookOpen,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  Home,
} from 'lucide-react';

interface App {
  name: string;
  href: string;
  icon: typeof BookOpen;
  color: string;
  adminOnly?: boolean;
}

const APPS: App[] = [
  { name: 'Home', href: '/dashboard', icon: Home, color: 'text-slate-300' },
  { name: 'Academics', href: '/academics', icon: BookOpen, color: 'text-blue-400' },
  { name: 'Freelance', href: '/freelance', icon: Briefcase, color: 'text-emerald-400' },
  { name: 'Chat', href: '/chat', icon: MessageSquare, color: 'text-purple-400' },
  { name: 'Admin', href: '/admin', icon: ShieldCheck, color: 'text-amber-400', adminOnly: true },
];

export function AppLauncher({ userRole }: { userRole: string }) {
  const [open, setOpen] = useState(false);
  const visibleApps = APPS.filter((a) => !a.adminOnly || userRole === 'ADMIN');

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
        title="Campus Workspace Apps"
      >
        <Grid className="w-5 h-5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-3 w-72 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl grid grid-cols-3 gap-2 z-50">
            {visibleApps.map((app) => (
              <Link
                key={app.name}
                href={app.href}
                onClick={() => setOpen(false)}
                className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-slate-800/60 transition text-center group"
              >
                <app.icon className={`w-6 h-6 mb-2 ${app.color} group-hover:scale-110 transition-transform`} />
                <span className="text-[11px] font-medium text-slate-300 group-hover:text-white">
                  {app.name}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}