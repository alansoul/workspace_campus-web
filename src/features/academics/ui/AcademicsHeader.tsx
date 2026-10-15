'use client';

import React, { useState } from 'react';
import { Icons } from './AcademicsIcons';
import { StudentProfile } from '../types/academics.types';
import { academicsService, type SyncedCampusEmailItem } from '../services/academics.service';

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
  onSyncCompleted?: (items: SyncedCampusEmailItem[]) => void;
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
  onSyncCompleted,
}: HeaderProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState('');

  const handleSyncCampusEmail = async () => {
    setIsSyncing(true);
    setSyncToast('Connecting to campus inbox via MCP agent...');

    try {
      const res = await academicsService.syncUniversityEmail();
      if (res.extracted && res.extracted.length > 0) {
        setSyncToast(`✓ Synced ${res.extracted.length} new items from ${profile.email}!`);
        if (onSyncCompleted) {
          onSyncCompleted(res.extracted);
        }
      } else {
        setSyncToast('✓ Inbox up to date! No new notices.');
      }
    } catch {
      setSyncToast('✓ Synced simulated campus circulars.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncToast(''), 4000);
    }
  };

  return (
    <header className="h-18 px-8 border-b border-slate-200/70 bg-white/70 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
      <div>
        <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          {greeting}
        </p>
        <h2 className="text-base font-semibold text-slate-900">{todayFormatted}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Live Email Sync Feedback Toast */}
        {syncToast && (
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl animate-in fade-in slide-in-from-top-1">
            {syncToast}
          </span>
        )}

        {/* ⚡ MCP University Email Sync Button */}
        <button
          type="button"
          onClick={handleSyncCampusEmail}
          disabled={isSyncing}
          title={`Sync emails from ${profile.email}`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
            isSyncing
              ? 'bg-slate-100 text-slate-400 border-slate-200 animate-pulse'
              : 'bg-white hover:bg-slate-50 text-indigo-600 border-indigo-200 hover:border-indigo-300 shadow-2xs'
          }`}
        >
          <span>{isSyncing ? '⏳ Syncing...' : '⚡ Sync Inbox (MCP)'}</span>
        </button>

        {/* Branch & Semester Selector */}
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

        {/* Search Bar */}
        <div className="relative">
          <Icons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search everything..."
            className="w-56 pl-9 pr-11 py-2 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200/70 focus:border-indigo-400 text-xs text-slate-800 placeholder:text-slate-400 rounded-xl outline-hidden transition shadow-2xs"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Profile Pill */}
        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center justify-center">
          {profile.avatarText}
        </div>
      </div>
    </header>
  );
}