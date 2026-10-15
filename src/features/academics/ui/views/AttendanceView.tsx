'use client';

import React from 'react';
import { AttendanceSubject } from '../../types/academics.types';

export function AttendanceView({ attendance }: { attendance: AttendanceSubject[] }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">Records</p>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-0.5">Attendance</h2>
        <p className="text-sm text-slate-500 mt-0.5">Minimum required: 75% in every subject.</p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-500">Overall</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">81%</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-500">Total classes</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">210</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-500">Attended</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">170</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-500">Missed</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">40</p>
        </div>
      </div>

      {/* Detention Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
        <span className="font-bold">⚠️ Notice:</span> Attendance is below 75% in DBMS, DE. Attend upcoming classes to avoid detention.
      </div>

      {/* Subject Attendance Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {attendance.map((sub) => (
          <div
            key={sub.subject}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-base">{sub.subject}</h3>
              <span
                className={`text-sm font-bold ${
                  sub.attendancePct < 75 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {sub.attendancePct}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  sub.attendancePct < 75 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${sub.attendancePct}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-slate-500">
              <span>Total: {sub.totalClasses}</span>
              <span>Attended: {sub.attended}</span>
              <span>Missed: {sub.missed}</span>
            </div>

            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {sub.statusText}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}