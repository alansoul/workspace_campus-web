
'use client';

import React from 'react';
import { Phone, PhoneOff, Video, ShieldCheck } from 'lucide-react';
import { IncomingCallData } from '../../hooks/useWebRTCCall';

interface IncomingCallModalProps {
  incomingCall: IncomingCallData;
  onAccept: () => void;
  onReject: () => void;
  getInitials: (name?: string) => string;
}

export function IncomingCallModal({
  incomingCall,
  onAccept,
  onReject,
  getInitials,
}: IncomingCallModalProps) {
  const isVideo = incomingCall.isVideo;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Incoming call"
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/80 bg-linear-to-br from-white via-indigo-50/95 to-fuchsia-50/90 p-7 text-center shadow-2xl shadow-indigo-950/20">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-purple-300/30 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-sky-300/30 blur-3xl" />

        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Incoming call
          </div>

          <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-2xl font-bold text-white shadow-xl shadow-indigo-500/20 ring-4 ring-white">
            <span className="absolute -inset-2 animate-pulse rounded-full border border-indigo-300/60" />
            <span className="relative">{getInitials(incomingCall.callerName)}</span>
          </div>

          <h3 className="wrap-break-words text-xl font-bold tracking-tight text-slate-900">
            {incomingCall.callerName}
          </h3>

          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600">
            {isVideo ? (
              <Video className="h-4 w-4 text-indigo-500" />
            ) : (
              <Phone className="h-4 w-4 text-emerald-500" />
            )}
            {isVideo ? 'Video call' : 'Voice call'}
          </p>

          <p className="mt-3 text-xs text-slate-500">
            Answer when you’re ready to connect.
          </p>

          <div className="mt-8 flex items-center justify-center gap-8">
            <button
              type="button"
              onClick={onReject}
              className="group flex flex-col items-center gap-2"
              title="Decline"
              aria-label="Decline call"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/25 transition hover:scale-105 hover:bg-rose-600 active:scale-95">
                <PhoneOff className="h-6 w-6" />
              </span>
              <span className="text-[11px] font-semibold text-slate-600">
                Decline
              </span>
            </button>

            <button
              type="button"
              onClick={onAccept}
              className="group flex flex-col items-center gap-2"
              title="Accept"
              aria-label="Accept call"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition hover:scale-105 hover:bg-emerald-600 active:scale-95">
                {isVideo ? (
                  <Video className="h-6 w-6" />
                ) : (
                  <Phone className="h-6 w-6" />
                )}
              </span>
              <span className="text-[11px] font-semibold text-slate-600">
                Accept
              </span>
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Campus calling
          </div>
        </div>
      </div>
    </div>
  );
}
