
'use client';

import React, { useRef, useEffect } from 'react';
import { Phone, Mic, Users, Radio } from 'lucide-react';
import { OnlineMember } from '../hooks/useChat';

interface ChatRosterProps {
  onlineMembers: OnlineMember[];
  isCalling: boolean;
  onEndCall: () => void;
  localStream?: MediaStream | null;
  localStreamRef?: React.MutableRefObject<MediaStream | null> | {
    current: MediaStream | null;
  };
  getInitials: (name?: string) => string;
}

export function ChatRoster({
  onlineMembers,
  isCalling,
  onEndCall,
  localStream,
  localStreamRef,
  getInitials,
}: ChatRosterProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const activeStream = localStream ?? localStreamRef?.current ?? null;
    const videoEl = videoRef.current;

    if (videoEl && activeStream) {
      if (videoEl.srcObject !== activeStream) {
        videoEl.srcObject = activeStream;
      }
      videoEl.play().catch(() => {});
    } else if (videoEl) {
      videoEl.srcObject = null;
    }
  }, [isCalling, localStream, localStreamRef]);

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-5 border-l border-slate-200/80 bg-white/75 p-4 backdrop-blur-xl lg:flex">
      {isCalling && (
        <section className="rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50 via-white to-purple-50 p-3.5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold text-slate-800">
                Active Room Call
              </h3>
            </div>

            <button
              type="button"
              onClick={onEndCall}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-100"
              title="End Call"
              aria-label="End call"
            >
              <Phone className="h-4 w-4 rotate-135" />
            </button>
          </div>

          <div className="relative aspect-video overflow-hidden rounded-xl border border-white bg-slate-900 shadow-sm">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />

            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
              <Mic className="h-3 w-3 text-emerald-400" />
              You
            </div>
          </div>

          <p className="mt-2 text-[11px] text-slate-500">
            Your call is in progress.
          </p>
        </section>
      )}

      <section className="min-h-0 flex-1 overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Online
            </h3>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
              {onlineMembers.length}
            </span>
          </div>
        </div>

        {onlineMembers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-3 py-5 text-center">
            <Radio className="mx-auto mb-2 h-5 w-5 text-slate-400" />
            <p className="text-xs font-medium text-slate-600">
              No other peers online.
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Members will appear here when available.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {onlineMembers.map((member) => (
              <div
                key={member.userId}
                className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-indigo-50/70"
              >
                <div className="relative shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-indigo-400 via-violet-500 to-fuchsia-400 text-xs font-bold text-white shadow-sm ring-2 ring-white">
                    {getInitials(member.name)}
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {member.name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Online
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}
