'use client';

import React, { useState, useMemo } from 'react';
import type { CampusEvent } from '../../types/academics.types';

export interface CalendarTimetableSlot {
  id?: string;
  subjectName?: string;
  subject?: string;
  code?: string;
  startTime?: string;
  endTime?: string;
  time?: string;
  room?: string;
  faculty?: string;
  isToday?: boolean;
}

export interface CalendarTimetableDay {
  day: string;
  dateStr?: string;
  isToday?: boolean;
  classCount?: number;
  slots: CalendarTimetableSlot[];
}

interface CalendarViewProps {
  events?: CampusEvent[];
  assignments?: { id: string; title: string; dueDate?: string; subject?: string }[];
  exams?: { id: string; title: string; subject: string; date?: string; time?: string }[];
  timetable?: CalendarTimetableDay[] | Record<string, CalendarTimetableSlot[]>;
}

type CalendarFilter = 'All' | 'Classes' | 'Exams' | 'Deadlines' | 'Events' | 'Holidays';

export function CalendarView({
  events = [],
  assignments = [],
  exams = [],
  timetable = [],
}: CalendarViewProps) {
  // Calendar state initialized to October 2026
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 18));
  const [selectedDate, setSelectedDate] = useState<number>(18);
  const [activeFilter, setActiveFilter] = useState<CalendarFilter>('All');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday as index 0

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(1);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(1);
  };

  // Direct calculation avoids React Compiler memoization warnings
  const selectedDateObj = new Date(year, month, selectedDate);
  const selectedDayOfWeekName = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ][selectedDateObj.getDay()];

  // Aggregate schedule items for the selected date
  const selectedDayItems = useMemo(() => {
    const items: {
      id: string;
      title: string;
      time: string;
      type: 'class' | 'exam' | 'deadline' | 'event' | 'holiday';
      subtitle?: string;
      badge?: string;
      location?: string;
    }[] = [];

    // 1. Classes from Timetable (supports array of days or day-keyed record)
    if (Array.isArray(timetable)) {
      const dayData = timetable.find(
        (d) => d.day?.toLowerCase() === selectedDayOfWeekName.toLowerCase(),
      );
      if (dayData?.slots) {
        dayData.slots.forEach((cls, idx) => {
          const title = cls.subjectName || cls.subject || 'Lecture Class';
          const timeStr =
            cls.startTime && cls.endTime
              ? `${cls.startTime} - ${cls.endTime}`
              : cls.time || 'Class Time';

          items.push({
            id: cls.id || `class-${idx}`,
            title,
            time: timeStr,
            type: 'class',
            subtitle: cls.faculty,
            location: cls.room || 'Room 138',
            badge: 'Lecture',
          });
        });
      }
    } else if (timetable && typeof timetable === 'object') {
      const slots = (timetable as Record<string, CalendarTimetableSlot[]>)[selectedDayOfWeekName];
      if (Array.isArray(slots)) {
        slots.forEach((cls, idx) => {
          const title = cls.subjectName || cls.subject || 'Lecture Class';
          const timeStr =
            cls.startTime && cls.endTime
              ? `${cls.startTime} - ${cls.endTime}`
              : cls.time || 'Class Time';

          items.push({
            id: cls.id || `class-${idx}`,
            title,
            time: timeStr,
            type: 'class',
            subtitle: cls.faculty,
            location: cls.room || 'Room 138',
            badge: 'Lecture',
          });
        });
      }
    }

    // 2. Events & Hackathons
    events.forEach((evt) => {
      items.push({
        id: evt.id,
        title: evt.title,
        time: evt.dateTimeStr || 'Upcoming',
        type: 'event',
        subtitle: `Organized by ${evt.organizer}`,
        location: evt.venue,
        badge: evt.category || 'Event',
      });
    });

    // 3. Exams
    exams.forEach((ex) => {
      items.push({
        id: ex.id,
        title: `${ex.subject} — ${ex.title}`,
        time: ex.time || '10:00 AM - 01:00 PM',
        type: 'exam',
        badge: 'Exam',
        location: 'Examination Hall',
      });
    });

    // 4. Deadlines
    assignments.forEach((asg) => {
      items.push({
        id: asg.id,
        title: asg.title,
        time: asg.dueDate || '11:59 PM',
        type: 'deadline',
        subtitle: asg.subject,
        badge: 'Assignment Due',
      });
    });

    if (activeFilter === 'Classes') return items.filter((i) => i.type === 'class');
    if (activeFilter === 'Exams') return items.filter((i) => i.type === 'exam');
    if (activeFilter === 'Deadlines') return items.filter((i) => i.type === 'deadline');
    if (activeFilter === 'Events') return items.filter((i) => i.type === 'event');
    if (activeFilter === 'Holidays') return items.filter((i) => i.type === 'holiday');

    return items;
  }, [selectedDayOfWeekName, timetable, events, exams, assignments, activeFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header & Month Navigator */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Schedule & Calendar</span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {monthNames[month]} {year}
          </h1>
          <p className="text-xs text-slate-500">
            Master academic timeline, exams, lecture timetable, and campus fests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentDate(new Date(2026, 9, 18));
              setSelectedDate(18);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Previous month"
            >
              ←
            </button>
            <button
              onClick={handleNextMonth}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Next month"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Filter Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {(['All', 'Classes', 'Exams', 'Deadlines', 'Events', 'Holidays'] as CalendarFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
              activeFilter === filter
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Main Grid & Selected Day Schedule */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-8">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 rounded-xl bg-slate-50/50" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected = dayNum === selectedDate;
              const isToday = dayNum === 18 && month === 9 && year === 2026;

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDate(dayNum)}
                  className={`group relative flex h-16 flex-col justify-between rounded-xl p-2 text-left transition ${
                    isSelected
                      ? 'border-2 border-indigo-600 bg-indigo-50/40 shadow-sm'
                      : isToday
                      ? 'border border-indigo-200 bg-indigo-50/20 hover:bg-slate-50'
                      : 'border border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold ${
                      isToday
                        ? 'bg-indigo-600 text-white'
                        : isSelected
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>

                  <div className="flex gap-1">
                    {dayNum % 2 === 0 && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
                    {dayNum % 5 === 0 && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
                    {dayNum === 18 && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-4">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {selectedDayOfWeekName}
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              {monthNames[month]} {selectedDate}, {year}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {selectedDayItems.length} {selectedDayItems.length === 1 ? 'item' : 'items'} scheduled
            </p>
          </div>

          <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
            {selectedDayItems.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-center">
                <span className="text-2xl text-slate-300">📅</span>
                <p className="mt-2 text-xs font-medium text-slate-500">No scheduled classes or events</p>
                <p className="text-[11px] text-slate-400">Enjoy your free time or work on projects!</p>
              </div>
            ) : (
              selectedDayItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        item.type === 'class'
                          ? 'bg-blue-100 text-blue-700'
                          : item.type === 'exam'
                          ? 'bg-rose-100 text-rose-700'
                          : item.type === 'deadline'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">{item.time}</span>
                  </div>

                  <h3 className="mt-2 text-xs font-bold text-slate-800">{item.title}</h3>
                  {item.subtitle && <p className="mt-0.5 text-[11px] text-slate-500">{item.subtitle}</p>}
                  {item.location && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-slate-400">
                      <span>📍</span>
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}