'use client';

import React from 'react';
import Image from 'next/image';
import { AcademicTab, StudentProfile } from '../types/academics.types';
import { Icons } from './AcademicsIcons';

interface SidebarProps {
  activeTab: AcademicTab;
  onSelectTab: (tab: AcademicTab) => void;
  profile: StudentProfile;
}

const NAV_ITEMS: { id: AcademicTab; label: string; icon: keyof typeof Icons }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'Dashboard' },
  { id: 'timetable', label: 'Timetable', icon: 'Timetable' },
  { id: 'calendar', label: 'Calendar', icon: 'Calendar' },
  { id: 'subjects', label: 'Subjects', icon: 'Subjects' },
  { id: 'drive', label: 'Lecture Drive', icon: 'Drive' },
  { id: 'assignments', label: 'Assignments', icon: 'Assignments' },
  { id: 'practicals', label: 'Practicals', icon: 'Practicals' },
  { id: 'exams', label: 'Exams', icon: 'Exams' },
  { id: 'attendance', label: 'Attendance', icon: 'Attendance' },
  { id: 'notices', label: 'Notices', icon: 'Notices' },
  { id: 'events', label: 'Events', icon: 'Events' },
  { id: 'tasks', label: 'Tasks', icon: 'Tasks' },
  { id: 'resources', label: 'Resources', icon: 'Resources' },
  { id: 'plugins', label: 'MCP & Plugins', icon: 'Plugin' },
  { id: 'profile', label: 'Profile', icon: 'Profile' },
];

export function AcademicsSidebar({ activeTab, onSelectTab, profile }: SidebarProps) {
  // Compute clean display name & initial from dynamic institution
  const collegeDisplayName = profile.collegeName.includes('IIIT')
    ? 'IIIT Naya Raipur'
    : profile.collegeName.length > 22
      ? `${profile.collegeName.slice(0, 20)}...`
      : profile.collegeName || 'Campus Workspace';

  const collegeInitial = collegeDisplayName.trim()[0] || 'I';

  return (
    <aside className="w-64 shrink-0 bg-white/95 border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 backdrop-blur-md select-none z-30">
      <div>
        {/* Dynamic College Identity Header */}
        <div className="flex items-center gap-3.5 px-6 py-5 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-indigo-200 shrink-0">
            {collegeInitial}
          </div>
          <div className="overflow-hidden">
            <h1
              className="font-semibold text-slate-900 text-sm tracking-tight truncate leading-tight"
              title={profile.collegeName}
            >
              {collegeDisplayName}
            </h1>
            <p className="text-xs text-slate-500 font-normal">Campus Workspace</p>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const IconComp = Icons[item.icon];
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 font-normal ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-medium shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <IconComp
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-indigo-600 stroke-2' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Pill */}
      <div className="p-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onSelectTab('profile')}
          className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-150 text-left ${
            activeTab === 'profile'
              ? 'bg-indigo-50/80 border-indigo-200 shadow-2xs'
              : 'bg-slate-50/60 border-slate-200/70 hover:bg-white hover:border-slate-300'
          }`}
        >
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.name}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white shrink-0"
              unoptimized
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center ring-2 ring-white shrink-0">
              {profile.avatarText}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 truncate">{profile.name}</p>
            <p className="text-[11px] text-slate-500 truncate">
              {profile.branch.replace('B.Tech · ', '')} · Sem {profile.semester}
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
}