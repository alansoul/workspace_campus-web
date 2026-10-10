// src/features/admin/ui/TelemetryGrid.tsx
'use client';

import React from 'react';
import Link from 'next/link';

export function TelemetryGrid() {
  const stats = [
    { title: 'Academic Notes & PYQs', count: '1,280', delta: '+12% this week', color: 'from-blue-500/20 to-blue-600/5' },
    { title: 'Active Freelance Gigs', count: '48', delta: '₹1,24,000 in escrow', color: 'from-emerald-500/20 to-emerald-600/5' },
    { title: 'Campus Chat Messages', count: '18.4k', delta: '4 active channels', color: 'from-indigo-500/20 to-indigo-600/5' },
    { title: 'Verified Students', count: '942', delta: '98% institutional', color: 'from-amber-500/20 to-amber-600/5' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.title} className={`p-5 rounded-2xl bg-linear-to-b ${s.color} border border-slate-800 bg-slate-900/60`}>
          <p className="text-xs font-medium text-slate-400">{s.title}</p>
          <p className="text-2xl font-bold text-white mt-2">{s.count}</p>
          <p className="text-[11px] text-slate-500 mt-1">{s.delta}</p>
        </div>
      ))}
    </div>
  );
}

export function DashboardView() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Campus Workspace Hub</h1>
          <p className="text-sm text-slate-400 mt-1">Single sign-on access to all institutional services</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/academics" className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition">
            Browse Academics
          </Link>
          <Link href="/freelance" className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition">
            Explore Gigs
          </Link>
          <Link href="/chat" className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition">
            Open Chat
          </Link>
        </div>
      </div>

      <TelemetryGrid />
    </div>
  );
}