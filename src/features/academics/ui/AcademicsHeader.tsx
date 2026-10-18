// campus-web/src/features/academics/ui/AcademicsHeader.tsx
'use client';

import React from 'react';
import { Icons } from './AcademicsIcons';
import type { StudentProfile } from '../types/academics.types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  profile: StudentProfile;
  todayFormatted: string;
  greeting: string;
  selectedBranch: string;
  onBranchChange: (b: string) => void;
  selectedSemester: number;
  onSemesterChange: (s: number) => void;
}

export function AcademicsHeader({
  searchQuery,
  onSearchChange,
  profile,
  todayFormatted,
  greeting,
  selectedBranch,
  onBranchChange,
  selectedSemester,
  onSemesterChange,
}: HeaderProps) {
  return (
    <header className="h-18 px-8 border-b border-slate-200/70 bg-white/70 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
      {/* 1. Live Greeting & Date */}
      <div>
        <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          {greeting}
        </p>
        <h2 className="text-base font-semibold text-slate-900">{todayFormatted}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* 2. Branch & Semester Matrix Selectors */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60 text-xs">
          <select
            value={selectedBranch}
            onChange={(e) => onBranchChange(e.target.value)}
            className="bg-transparent font-semibold text-slate-700 outline-hidden px-1.5 cursor-pointer"
          >
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="DSAI">DSAI</option>
            <option value="MECH">MECH</option>
          </select>
          <span className="text-slate-300">|</span>
          <select
            value={selectedSemester}
            onChange={(e) => onSemesterChange(Number(e.target.value))}
            className="bg-transparent font-semibold text-slate-700 outline-hidden px-1.5 cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Sem {sem}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Global Search Input */}
        <div className="relative">
          <Icons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search everything..."
            className="w-56 pl-9 pr-11 py-2 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200/70 focus:border-indigo-400 text-xs text-slate-800 placeholder:text-slate-400 rounded-xl outline-hidden transition shadow-2xs"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono pointer-events-none">
            ⌘K
          </kbd>
        </div>

        {/* 4. Profile Avatar Pill */}
        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center justify-center shadow-2xs">
          {profile.avatarText || 'AS'}
        </div>
      </div>
    </header>
  );
}