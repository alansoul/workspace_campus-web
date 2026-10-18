'use client';

import React from 'react';
import type { BranchCode } from '../../hooks/useAcademicsWorkspace';

export interface TimetableSlot {
  id: string;
  subjectName: string;
  code?: string;
  type?: 'Theory' | 'Practical' | 'Tutorial' | string;
  startTime: string;
  endTime: string;
  room?: string;
  faculty?: string;
}

export interface TimetableDay {
  day: string;
  dateStr?: string;
  isToday?: boolean;
  classCount?: number;
  slots: TimetableSlot[];
}

interface TimetableViewProps {
  timetable: TimetableDay[];
  branch: BranchCode | string;
  semester: number | string;
  roomNo?: string;
  effectiveDate?: string;
  institutionName?: string;
  isAdmin?: boolean;
  onOpenUploadModal: () => void;
}

export function TimetableView({
  timetable = [],
  branch,
  semester,
  roomNo = 'Room 138',
  effectiveDate = '07/09/2026',
  institutionName = 'International Institute of Information Technology',
  isAdmin = true,
  onOpenUploadModal,
}: TimetableViewProps) {
  const getBadgeStyle = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'practical':
      case 'lab':
        return 'bg-purple-50 text-purple-700 border-purple-200/60';
      case 'tutorial':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              B.Tech Semester {semester} · {branch} · {roomNo}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
              w.e.f. {effectiveDate}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Weekly timetable
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">{institutionName}</p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-98 cursor-pointer"
          >
            <span>⚡</span>
            <span>Upload Timetable (PDF / OCR)</span>
          </button>
        )}
      </div>

      {/* 5-Day Lecture Columns Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5 items-start">
        {timetable.map((dayItem) => {
          const isToday = dayItem.isToday;
          const slots = dayItem.slots || [];

          return (
            <div
              key={dayItem.day}
              className={`flex flex-col rounded-3xl border transition-all ${
                isToday
                  ? 'border-indigo-300 bg-white shadow-md ring-2 ring-indigo-500/10'
                  : 'border-slate-200/80 bg-white/80 hover:bg-white shadow-xs'
              }`}
            >
              {/* Day Column Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{dayItem.day}</h3>
                    {isToday && (
                      <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                        Today
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {roomNo} · {slots.length} periods
                  </p>
                </div>
              </div>

              {/* Slot Cards List with Invisible / Modern Scrollbar */}
              <div className="flex flex-col gap-2.5 p-3 max-h-[70vh] overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
                {slots.length === 0 ? (
                  <div className="py-12 text-center">
                    <span className="text-xl">☕</span>
                    <p className="mt-1 text-xs font-medium text-slate-400">No classes</p>
                  </div>
                ) : (
                  slots.map((slot, idx) => (
                    <div
                      key={slot.id || `${dayItem.day}-${idx}`}
                      className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:border-indigo-200 hover:bg-white hover:shadow-xs"
                    >
                      {/* Top Row: Subject & Category Pill */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                            {slot.subjectName}
                          </h4>
                          {slot.code && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {slot.code}
                            </span>
                          )}
                        </div>
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[9px] font-bold tracking-wide ${getBadgeStyle(
                            slot.type,
                          )}`}
                        >
                          {slot.type || 'Theory'}
                        </span>
                      </div>

                      {/* Middle Row: Class Timing */}
                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                        <span className="text-[10px] text-slate-400">🕒</span>
                        <span>
                          {slot.startTime} – {slot.endTime}
                        </span>
                      </div>

                      {/* Bottom Row: Room & Faculty */}
                      <div className="mt-2 flex items-center justify-between border-t border-slate-100/80 pt-2 text-[10px] text-slate-400">
                        <span className="truncate max-w-20">{slot.room || roomNo}</span>
                        <span className="font-medium text-slate-600 truncate max-w-25 text-right">
                          {slot.faculty || 'Faculty'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}