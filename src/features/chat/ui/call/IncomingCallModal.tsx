'use client';

import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="flex w-full max-w-sm flex-col items-center rounded-3xl border border-[#2b334d] bg-[#141824] p-6 shadow-2xl text-center">
        {/* Pulsing Avatar */}
        <div className="relative mb-4">
          <div className="absolute -inset-2 rounded-full bg-indigo-500/30 animate-ping" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-tr from-[#6366f1] to-[#7c4dff] text-2xl font-bold text-white shadow-xl">
            {getInitials(incomingCall.callerName)}
          </div>
        </div>

        <h3 className="text-lg font-bold text-white">{incomingCall.callerName}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-indigo-300">
          {incomingCall.isVideo ? <Video className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
          Incoming {incomingCall.isVideo ? 'Video Call' : 'Voice Call'}...
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center gap-6">
          <button
            onClick={onReject}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-600/30 hover:bg-rose-700 transition hover:scale-105"
            title="Decline"
          >
            <PhoneOff className="h-6 w-6" />
          </button>

          <button
            onClick={onAccept}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 transition hover:scale-105"
            title="Accept"
          >
            {incomingCall.isVideo ? <Video className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}