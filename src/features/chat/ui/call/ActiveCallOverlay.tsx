'use client';

import React, { useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  PhoneOff,
  Maximize2,
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
  onEndCall,
  getInitials,
}: ActiveCallOverlayProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Play local video stream without interrupting active loads
  useEffect(() => {
    const videoEl = localVideoRef.current;
    if (videoEl && localStream) {
      if (videoEl.srcObject !== localStream) {
        videoEl.srcObject = localStream;
      }
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, [localStream]);

  // Play incoming remote stream on a single persistent DOM element
  useEffect(() => {
    const videoEl = remoteVideoRef.current;
    if (videoEl && remoteStream) {
      if (videoEl.srcObject !== remoteStream) {
        videoEl.srcObject = remoteStream;
      }
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn('Remote video play warning:', err);
          }
        });
      }
    }
  }, [remoteStream]);

  const hasLocalVideo = Boolean(
    localStream &&
      localStream.getVideoTracks().length > 0 &&
      localStream.getVideoTracks().some((t) => t.readyState === 'live' && t.enabled),
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0b0e17] text-white">
      {/* Top Header */}
      <header className="flex h-16 items-center justify-between border-b border-[#1b2234] px-6 bg-[#101422]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-sm font-bold text-white tracking-wide">
            {activeCall.peerName} • {callState === 'calling' ? 'Calling...' : 'Connected'}
          </h2>
        </div>
        <button
          onClick={() => {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen();
            else document.exitFullscreen();
          }}
          className="rounded-lg p-2 text-gray-400 hover:text-white transition"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </header>

      {/* Main Video Arena */}
      <div className="relative flex-1 overflow-hidden p-4 flex items-center justify-center">
        <div className="relative flex h-full w-full max-w-5xl items-center justify-center">
          {/* Persistent video node prevents AbortError when tracks toggle */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`h-full w-full rounded-2xl object-contain bg-black shadow-2xl border border-white/10 ${
              hasRemoteVideo ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
            }`}
          />

          {/* Audio-Only Avatar Fallback */}
          {!hasRemoteVideo && (
            <div className="flex flex-col items-center justify-center">
              <div className="h-28 w-28 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold shadow-2xl animate-pulse">
                {getInitials(activeCall.peerName)}
              </div>
              <p className="mt-4 text-base font-semibold text-gray-300">
                {callState === 'calling'
                  ? `Ringing ${activeCall.peerName}...`
                  : `${activeCall.peerName} (Audio Only)`}
              </p>
            </div>
          )}
        </div>

        {/* Local Picture-in-Picture Preview */}
        <div className="absolute bottom-6 right-6 h-36 w-48 sm:h-44 sm:w-60 overflow-hidden rounded-2xl border border-white/20 bg-black/80 shadow-2xl">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`h-full w-full object-cover ${hasLocalVideo ? 'block' : 'hidden'}`}
          />
          {!hasLocalVideo && (
            <div className="flex h-full w-full items-center justify-center bg-[#1a2035] text-xs font-semibold text-gray-400">
              Camera Off
            </div>
          )}
          <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur-xs">
            You {isScreenSharing && '(Screen Sharing)'}
          </div>
        </div>
      </div>

      {/* Control Dock */}
      <footer className="flex h-20 items-center justify-center gap-4 border-t border-[#1b2234] bg-[#101422]">
        <button
          onClick={onToggleAudio}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
            isAudioMuted
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'bg-[#1e2538] hover:bg-[#2b3550] text-white'
          }`}
          title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        <button
          onClick={onToggleVideo}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
            isVideoDisabled
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'bg-[#1e2538] hover:bg-[#2b3550] text-white'
          }`}
          title={isVideoDisabled ? 'Start Camera' : 'Stop Camera'}
        >
          {isVideoDisabled ? <VideoOff className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
        </button>

        <button
          onClick={onToggleScreenShare}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
            isScreenSharing
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
              : 'bg-[#1e2538] hover:bg-[#2b3550] text-white'
          }`}
          title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
        >
          <Monitor className="h-5 w-5" />
        </button>

        <button
          onClick={onEndCall}
          className="flex h-12 px-6 items-center gap-2 rounded-2xl bg-rose-600 font-semibold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-700 transition"
        >
          <PhoneOff className="h-5 w-5" />
          <span>End Call</span>
        </button>
      </footer>
    </div>
  );
}