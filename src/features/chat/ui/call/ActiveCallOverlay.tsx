'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  PhoneOff,
  Maximize2,
  SwitchCamera,
  ArrowLeftRight,
} from 'lucide-react';
import { ActiveCallData } from '../../hooks/useWebRTCCall';

interface ActiveCallOverlayProps {
  activeCall: ActiveCallData;
  callState: 'calling' | 'connected';
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  hasRemoteVideo: boolean;
  isAudioMuted: boolean;
  isVideoDisabled: boolean;
  isScreenSharing: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onSwitchCamera?: () => void;
  onEndCall: () => void;
  getInitials: (name?: string) => string;
}

export function ActiveCallOverlay({
  activeCall,
  callState,
  localStream,
  remoteStream,
  hasRemoteVideo,
  isAudioMuted,
  isVideoDisabled,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onSwitchCamera,
  onEndCall,
  getInitials,
}: ActiveCallOverlayProps) {
  // false = Remote is Big / Local is Small; true = Local is Big / Remote is Small
  const [isSwapped, setIsSwapped] = useState(false);

  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const primaryStream = isSwapped ? localStream : remoteStream;
  const secondaryStream = isSwapped ? remoteStream : localStream;

  const isMainLocal = isSwapped;
  const isPipLocal = !isSwapped;

  const hasLocalVideo = Boolean(
    localStream &&
      localStream.getVideoTracks().length > 0 &&
      localStream.getVideoTracks().some((t) => t.readyState === 'live' && t.enabled) &&
      !isVideoDisabled,
  );

  const showMainVideo = isMainLocal ? hasLocalVideo : hasRemoteVideo;
  const showPipVideo = isPipLocal ? hasLocalVideo : hasRemoteVideo;

  // 1. Persistent audio element guarantees incoming audio never drops or loops
  useEffect(() => {
    const audioEl = remoteAudioRef.current;
    if (audioEl && remoteStream) {
      if (audioEl.srcObject !== remoteStream) {
        audioEl.srcObject = remoteStream;
      }
      audioEl.play().catch(() => {});
    }
  }, [remoteStream]);

  // 2. Bind Main Video Node
  useEffect(() => {
    const videoEl = mainVideoRef.current;
    if (videoEl && primaryStream) {
      if (videoEl.srcObject !== primaryStream) {
        videoEl.srcObject = primaryStream;
      }
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, [primaryStream, showMainVideo]);

  // 3. Bind Picture-in-Picture Video Node
  useEffect(() => {
    const videoEl = pipVideoRef.current;
    if (videoEl && secondaryStream) {
      if (videoEl.srcObject !== secondaryStream) {
        videoEl.srcObject = secondaryStream;
      }
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, [secondaryStream, showPipVideo]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0b0e17] text-white select-none">
      {/* Invisible persistent audio receiver */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Top Header */}
      <header className="flex h-16 items-center justify-between border-b border-[#1b2234] px-6 bg-[#101422]/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-sm font-bold text-white tracking-wide">
            {activeCall.peerName} • {callState === 'calling' ? 'Calling...' : 'Connected'}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen();
            else document.exitFullscreen();
          }}
          className="rounded-lg p-2 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </header>

      {/* Main Video Arena */}
      <div className="relative flex-1 overflow-hidden p-4 flex items-center justify-center">
        <div className="relative flex h-full w-full max-w-5xl items-center justify-center">
          {/* Main Stage Video */}
          <video
            ref={mainVideoRef}
            autoPlay
            playsInline
            muted={isMainLocal} // Mute self to avoid local mic feedback
            className={`h-full w-full rounded-2xl object-contain bg-black shadow-2xl border border-white/10 ${
              isMainLocal && !isScreenSharing ? 'scale-x-[-1]' : ''
            } ${showMainVideo ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`}
          />

          {/* Audio-Only Avatar Fallback */}
          {!showMainVideo && (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <div className="h-28 w-28 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold shadow-2xl animate-pulse">
                {isMainLocal ? 'You' : getInitials(activeCall.peerName)}
              </div>
              <p className="mt-4 text-base font-semibold text-gray-300">
                {isMainLocal
                  ? 'You (Camera Off)'
                  : callState === 'calling'
                    ? `Ringing ${activeCall.peerName}...`
                    : `${activeCall.peerName} (Audio Only)`}
              </p>
            </div>
          )}

          {/* Main View Tag */}
          <div className="absolute top-4 left-4 rounded-md bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur-md border border-white/10">
            {isMainLocal ? 'You (Main View)' : activeCall.peerName}
          </div>
        </div>

        {/* Small Floating Picture-in-Picture - Click to Swap */}
        <div
          onClick={() => setIsSwapped((prev) => !prev)}
          title="Click to swap view"
          className="absolute bottom-6 right-6 h-36 w-48 sm:h-44 sm:w-60 overflow-hidden rounded-2xl border-2 border-white/20 hover:border-indigo-400 bg-black/80 shadow-2xl cursor-pointer group transition-all duration-200 hover:scale-105 active:scale-95 z-30"
        >
          <video
            ref={pipVideoRef}
            autoPlay
            playsInline
            muted={isPipLocal}
            className={`h-full w-full object-cover ${
              isPipLocal && !isScreenSharing ? 'scale-x-[-1]' : ''
            } ${showPipVideo ? 'block' : 'hidden'}`}
          />

          {!showPipVideo && (
            <div className="flex h-full w-full items-center justify-center bg-[#1a2035] text-xs font-semibold text-gray-300">
              {isPipLocal ? 'Camera Off' : getInitials(activeCall.peerName)}
            </div>
          )}

          {/* PiP Badge & Swap Indicator */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-0.5 text-[10px] text-white backdrop-blur-xs">
            <span>{isPipLocal ? 'You' : activeCall.peerName}</span>
            {isPipLocal && isScreenSharing && ' (Sharing)'}
            <ArrowLeftRight className="h-3 w-3 text-indigo-300 opacity-80 group-hover:opacity-100 transition" />
          </div>
        </div>
      </div>

      {/* Control Dock */}
      <footer className="flex h-20 items-center justify-center gap-3 sm:gap-4 border-t border-[#1b2234] bg-[#101422] z-20">
        <button
          type="button"
          onClick={onToggleAudio}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition cursor-pointer ${
            isAudioMuted
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'bg-[#1e2538] hover:bg-[#2b3550] text-white'
          }`}
          title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        <button
          type="button"
          onClick={onToggleVideo}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition cursor-pointer ${
            isVideoDisabled
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'bg-[#1e2538] hover:bg-[#2b3550] text-white'
          }`}
          title={isVideoDisabled ? 'Start Camera' : 'Stop Camera'}
        >
          {isVideoDisabled ? <VideoOff className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
        </button>

        {/* 🔄 Mobile Front / Back Camera Flip */}
        {onSwitchCamera && !isVideoDisabled && (
          <button
            type="button"
            onClick={onSwitchCamera}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1e2538] hover:bg-[#2b3550] text-white transition cursor-pointer shadow-lg"
            title="Flip Camera (Front / Back)"
          >
            <SwitchCamera className="h-5 w-5" />
          </button>
        )}

        <button
          type="button"
          onClick={onToggleScreenShare}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition cursor-pointer ${
            isScreenSharing
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
              : 'bg-[#1e2538] hover:bg-[#2b3550] text-white'
          }`}
          title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
        >
          <Monitor className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onEndCall}
          className="flex h-12 px-6 items-center gap-2 rounded-2xl bg-rose-600 font-semibold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-700 transition cursor-pointer"
        >
          <PhoneOff className="h-5 w-5" />
          <span>End Call</span>
        </button>
      </footer>
    </div>
  );
}