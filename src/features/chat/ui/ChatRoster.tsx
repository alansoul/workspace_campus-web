'use client';

import React, { useRef, useEffect } from 'react';
import { Phone, Mic } from 'lucide-react';
import { OnlineMember } from '../hooks/useChat';

interface ChatRosterProps {
  onlineMembers: OnlineMember[];
  isCalling: boolean;
  onEndCall: () => void;
  localStream?: MediaStream | null;
  localStreamRef?: React.MutableRefObject<MediaStream | null> | { current: MediaStream | null };
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
    // Accessing ref.current inside useEffect runs after render and complies with React Compiler rules
    const activeStream = localStream ?? localStreamRef?.current ?? null;
    const videoEl = videoRef.current;

    if (videoEl && activeStream) {
      videoEl.srcObject = activeStream;
      videoEl.play().catch(() => {});
    }
  }, [isCalling, localStream, localStreamRef]);

  return (
    <aside className="hidden lg:flex w-72 flex-col border-l border-[#151926] bg-[#0c0f18] p-4 space-y-5 shrink-0">
      {/* 1. Live Call Widget */}
      {isCalling && (
        <div className="rounded-2xl border border-[#232b42] bg-[#111524] p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-bold text-white">Active Room Call</h3>
            </div>
            <button
              onClick={onEndCall}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600 transition"
              title="End Call"
            >
              <Phone className="h-3 w-3 rotate-135" />
            </button>
          </div>

          <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-[#232b42]">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] text-white backdrop-blur-xs">
              <Mic className="h-2.5 w-2.5 text-emerald-400" /> You
            </div>
          </div>
        </div>
      )}

      {/* 2. Real Active Campus Members */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-none">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#626a87] uppercase tracking-wider">
          <span>Online — {onlineMembers.length}</span>
        </div>

        <div className="space-y-2">
          {onlineMembers.length === 0 ? (
            <p className="text-xs text-[#555d77]">No other peers online.</p>
          ) : (
            onlineMembers.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between rounded-xl p-1.5 hover:bg-[#141826] cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="h-7 w-7 rounded-xl bg-linear-to-tr from-indigo-500 to-purple-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {getInitials(member.name)}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-[#0c0f18]" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-semibold text-white truncate block">
                      {member.name}
                    </span>
                    <p className="text-[10px] text-emerald-400">Online</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}