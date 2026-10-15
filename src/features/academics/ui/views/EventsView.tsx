'use client';

import React from 'react';
import { CampusEvent, EventCategory } from '../../types/academics.types';
import { Icons } from '../AcademicsIcons';

interface EventsViewProps {
  events: CampusEvent[];
  selectedCategory: EventCategory;
  onSelectCategory: (cat: EventCategory) => void;
  onToggleInterest: (id: string) => void;
}

const CATEGORIES: EventCategory[] = [
  'All',
  'Workshop',
  'Hackathon',
  'Competition',
  'Seminar',
  'Club',
  'Cultural',
  'Holiday',
];

export function EventsView({
  events,
  selectedCategory,
  onSelectCategory,
  onToggleInterest,
}: EventsViewProps) {
  return (
    <div className="space-y-6">
      {/* Title & Section Label */}
      <div>
        <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
          Campus Life
        </p>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-0.5">Events</h2>
        <p className="text-sm text-slate-500 mt-0.5">What&apos;s happening around Northgate.</p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                  {evt.category}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {evt.timingBadge}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="font-semibold text-slate-900 text-base leading-snug">
                {evt.title}
              </h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {evt.description}
              </p>
            </div>

            {/* Footer Details & Action */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Icons.Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{evt.dateTimeStr}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Icons.MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{evt.venue}</span>
              </div>

              <button
                onClick={() => onToggleInterest(evt.id)}
                className={`w-full mt-3 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
                  evt.isInterested
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                }`}
              >
                {evt.isInterested ? '✓ Registered / Interested' : "I'm interested"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}