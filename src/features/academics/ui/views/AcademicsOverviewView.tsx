'use client';

import React from 'react';
import { ScheduleSlot, AssignmentItem, CampusNotice, AcademicTab } from '../../types/academics.types';

interface OverviewProps {
  onNavigate: (tab: AcademicTab) => void;
  todaySchedule: ScheduleSlot[];
  assignments: AssignmentItem[];
  notices: CampusNotice[];
}

export function AcademicsOverviewView({
  onNavigate,
  todaySchedule,
  assignments,
  notices,
}: OverviewProps) {
  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-500">Classes today</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">4</p>
          <p className="text-xs text-indigo-600 font-medium mt-1">Next DE at 09:00</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-500">Due this week</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">10</p>
          <p className="text-xs text-rose-600 font-medium mt-1">1 overdue</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-500">Next exam</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">2d</p>
          <p className="text-xs text-slate-500 mt-1">Data Structures</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-500">Avg attendance</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">82%</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">On track</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-lg">Today&apos;s schedule</h3>
            <button
              onClick={() => onNavigate('timetable')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg"
            >
              Week view
            </button>
          </div>

          <div className="space-y-3">
            {todaySchedule.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 text-sm">{slot.subjectName}</p>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {slot.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {slot.startTime} – {slot.endTime} · {slot.room} · {slot.faculty}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span className="font-medium">Today&apos;s tasks:</span> Finish DBMS assignment 4 and submit
          </div>
        </div>

        {/* Deadlines & Notices Column */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-base">Upcoming deadlines</h3>
              <button
                onClick={() => onNavigate('assignments')}
                className="text-xs text-indigo-600 hover:underline"
              >
                View all
              </button>
            </div>
            <div className="space-y-3">
              {assignments.slice(0, 4).map((asg) => (
                <div key={asg.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {asg.subject[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 truncate">{asg.title}</p>
                    <p className="text-[11px] text-rose-500 font-medium">{asg.relativeDue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Notices */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-base">Latest notices</h3>
              <button
                onClick={() => onNavigate('notices')}
                className="text-xs text-indigo-600 hover:underline"
              >
                All notices
              </button>
            </div>
            {notices.slice(0, 2).map((notice) => (
              <div key={notice.id} className="p-3 bg-slate-50/70 rounded-xl space-y-1">
                <span className="text-[10px] font-semibold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded">
                  {notice.category}
                </span>
                <p className="text-xs font-semibold text-slate-900">{notice.title}</p>
                <p className="text-[11px] text-slate-400">{notice.dateStr}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}