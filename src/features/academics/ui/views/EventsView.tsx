'use client';

import React, { useState } from 'react';
import type { CampusEvent, EventCategory, EventAttendee } from '../../types/academics.types';

interface EventsViewProps {
  events: CampusEvent[];
  selectedCategory: EventCategory;
  onSelectCategory: (category: EventCategory) => void;
  onToggleInterest: (eventId: string) => void;
}

export function EventsView({
  events,
  selectedCategory,
  onSelectCategory,
  onToggleInterest,
}: EventsViewProps) {
  const [selectedRosterEvent, setSelectedRosterEvent] = useState<CampusEvent | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const categories: EventCategory[] = [
    'All',
    'Workshop',
    'Hackathon',
    'Competition',
    'Seminar',
    'Club',
    'Cultural',
    'Holiday',
  ];

  const handleCopyEmails = (attendees: EventAttendee[]) => {
    const emailList = attendees.map((a) => a.email).filter(Boolean).join(', ');
    navigator.clipboard.writeText(emailList);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
          <p className="text-slate-500 text-sm">No events found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((evt) => {
            const attendeesList: EventAttendee[] = Array.isArray(evt.attendees) ? evt.attendees : [];
            const attendeeCount = attendeesList.length;

            return (
              <div
                key={evt.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      {evt.category}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {evt.timingBadge || 'Upcoming'}
                    </span>
                  </div>

                  {evt.organizer && (
                    <p className="text-[11px] font-medium text-slate-400 mb-1">
                      Organized by <span className="text-slate-700 font-semibold">{evt.organizer}</span>
                    </p>
                  )}

                  <h3 className="font-bold text-slate-900 text-lg mb-1">{evt.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                    {evt.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <span>🕒</span>
                      <span>{evt.dateTimeStr}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>📍</span>
                      <span>{evt.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedRosterEvent(evt)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer"
                    >
                      👥 {attendeeCount} {attendeeCount === 1 ? 'student' : 'students'} registered
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleInterest(evt.id)}
                    className={`w-full py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      evt.isInterested
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    {evt.isInterested ? '✓ Registered / Interested' : 'Register / RSVP'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attendee Roster Modal */}
      {selectedRosterEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Registered Attendees</h3>
                <p className="text-xs text-slate-500">{selectedRosterEvent.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRosterEvent(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              {(!selectedRosterEvent.attendees || selectedRosterEvent.attendees.length === 0) ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No students have registered yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {selectedRosterEvent.attendees.map((attendee: EventAttendee, i: number) => (
                    <div
                      key={attendee.id || i}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{attendee.fullName || 'Student'}</p>
                        <p className="text-[11px] text-slate-400">{attendee.email}</p>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(attendee.registeredAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {selectedRosterEvent.attendees && selectedRosterEvent.attendees.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Total: {selectedRosterEvent.attendees.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyEmails(selectedRosterEvent.attendees || [])}
                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                  >
                    {copyFeedback ? '✓ Copied!' : 'Copy All Emails'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}