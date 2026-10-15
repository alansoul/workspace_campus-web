'use client';

import React from 'react';
import { DayTimetable } from '../../types/academics.types';

interface TimetableViewProps {
  timetable: DayTimetable[];
  branch: string;
  semester: number;
  roomNo: string;
  effectiveDate: string;
  institutionName: string;
  isAdmin: boolean;
  onOpenUploadModal: () => void;
}

export function TimetableView({
  timetable,
  branch,
  semester,
  roomNo,
  effectiveDate,
  institutionName,
  isAdmin,
  onOpenUploadModal,
}: TimetableViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            B.Tech Semester {semester} · {branch} · {roomNo}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            Weekly timetable
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl truncate">
            {institutionName} · w.e.f. {effectiveDate}
          </p>
        </div>

        {/* Admin Timetable Import Button */}
        {isAdmin && (
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
          >
            <span>⚡ Upload Timetable (PDF / OCR)</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {timetable.map((day) => (
          <div
            key={day.day}
            className={`rounded-3xl p-4 transition-all ${
              day.isToday
                ? 'bg-indigo-50/40 border-2 border-indigo-400/80 shadow-md ring-4 ring-indigo-50'
                : 'bg-white border border-slate-200/80 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">{day.day}</h4>
                <p className="text-[11px] text-slate-400">
                  {day.dateStr} · {day.slots.length} periods
                </p>
              </div>
              {day.isToday && (
                <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
            </div>

            <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-0.5 scrollbar-thin">
              {day.slots.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs space-y-1 hover:border-indigo-200 transition"
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      {slot.subjectName}
                    </p>
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 shrink-0">
                      {slot.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-600 font-medium">
                    {slot.startTime} – {slot.endTime}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>{slot.room}</span>
                    <span className="font-medium text-slate-600">{slot.faculty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}