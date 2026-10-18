'use client';

import React from 'react';
import { ScheduleSlot, AssignmentItem, CampusNotice, AcademicTab } from '../../types/academics.types';

interface AttendanceItem {
  subject?: string;
  attended?: number;
  totalClasses?: number;
  attendancePct?: number;
  statusText?: string;
}

interface ExamInfo {
  id?: string;
  title?: string;
  subject?: string;
  relativeNotice?: string;
  timeStr?: string;
}

interface OverviewProps {
  onNavigate: (tab: AcademicTab) => void;
  todaySchedule: ScheduleSlot[];
  assignments: AssignmentItem[];
  notices: CampusNotice[];
  exams?: ExamInfo[];
  attendance?: AttendanceItem[];
}

export function AcademicsOverviewView({
  onNavigate,
  todaySchedule = [],
  assignments = [],
  notices = [],
  exams = [],
  attendance = [],
}: OverviewProps) {
  // 1. Live Classes Today
  const classesTodayCount = todaySchedule.length;
  const nextClassText =
    classesTodayCount > 0
      ? `Next ${todaySchedule[0].subjectName || 'Class'} at ${todaySchedule[0].startTime || '09:00'}`
      : 'No classes today';

  // 2. Live Assignments Due
  const pendingAssignments = assignments.filter((a) => a.status !== 'Submitted');
  const dueCount = pendingAssignments.length;
  const overdueCount = assignments.filter((a) =>
    (a.relativeDue || '').toLowerCase().includes('overdue'),
  ).length;

  // 3. Live Next Exam
  const nextExam = exams && exams.length > 0 ? exams[0] : null;
  const nextExamTime = nextExam?.relativeNotice || (nextExam ? 'Upcoming' : 'None');
  const nextExamSubject = nextExam?.subject || (nextExam ? nextExam.title : 'All clear');

  // 4. Live Weighted Attendance Average
  const totalAttended = attendance.reduce((sum, item) => sum + (item.attended || 0), 0);
  const totalHeld = attendance.reduce((sum, item) => sum + (item.totalClasses || 0), 0);
  const avgAttendance =
    totalHeld > 0
      ? Math.round((totalAttended / totalHeld) * 100)
      : attendance.length > 0
      ? Math.round(
          attendance.reduce((sum, item) => sum + (item.attendancePct || 0), 0) / attendance.length,
        )
      : 85;
  const isAttendanceWarning = avgAttendance < 75;

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-500">Classes today</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{classesTodayCount}</p>
          <p className="text-xs text-indigo-600 font-medium mt-1 truncate">{nextClassText}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-500">Due this week</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{dueCount}</p>
          <p className={`text-xs font-medium mt-1 ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
            {overdueCount > 0 ? `${overdueCount} overdue` : 'On track'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-500">Next exam</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{nextExamTime}</p>
          <p className="text-xs text-slate-500 mt-1 truncate">{nextExamSubject}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-500">Avg attendance</p>
          <p className={`text-3xl font-bold mt-1 ${isAttendanceWarning ? 'text-amber-600' : 'text-slate-900'}`}>
            {avgAttendance}%
          </p>
          <p className={`text-xs font-medium mt-1 ${isAttendanceWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
            {isAttendanceWarning ? 'Attention required' : 'On track'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-lg">Today&apos;s schedule</h3>
            <button
              onClick={() => onNavigate('timetable')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Week view
            </button>
          </div>

          <div className="space-y-3">
            {todaySchedule.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl">
                <p className="text-sm font-semibold text-slate-700">No classes scheduled for today</p>
                <p className="text-xs text-slate-400 mt-0.5">Enjoy your break or check upcoming coursework!</p>
              </div>
            ) : (
              todaySchedule.map((slot) => (
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
              ))
            )}
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
                className="text-xs text-indigo-600 hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>
            <div className="space-y-3">
              {assignments.slice(0, 4).map((asg) => (
                <div key={asg.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {asg.subject ? asg.subject[0] : 'A'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 truncate">{asg.title}</p>
                    <p className="text-[11px] text-rose-500 font-medium">{asg.relativeDue || asg.dueDate}</p>
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
                className="text-xs text-indigo-600 hover:underline cursor-pointer"
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