
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
      localStream
        .getVideoTracks()
        .some((track) => track.readyState === 'live' && track.enabled) &&
      !isVideoDisabled
  );

  const showMainVideo = isMainLocal ? hasLocalVideo : hasRemoteVideo;
  const showPipVideo = isPipLocal ? hasLocalVideo : hasRemoteVideo;

  // Keep the remote audio element mounted so incoming audio can continue.
  useEffect(() => {
    const audioEl = remoteAudioRef.current;

    if (audioEl && remoteStream) {
      if (audioEl.srcObject !== remoteStream) {
        audioEl.srcObject = remoteStream;
      }

      audioEl.play().catch(() => {});
    } else if (audioEl) {
      audioEl.srcObject = null;
    }
  }, [remoteStream]);

  // Bind the main video to the selected stream.
  useEffect(() => {
    const videoEl = mainVideoRef.current;

    if (videoEl && primaryStream) {
      if (videoEl.srcObject !== primaryStream) {
        videoEl.srcObject = primaryStream;
      }

      videoEl.play().catch(() => {});
    } else if (videoEl) {
      videoEl.srcObject = null;
    }
  }, [primaryStream, showMainVideo]);

  // Bind the picture-in-picture video to the other stream.
  useEffect(() => {
    const videoEl = pipVideoRef.current;

    if (videoEl && secondaryStream) {
      if (videoEl.srcObject !== secondaryStream) {
        videoEl.srcObject = secondaryStream;
      }

      videoEl.play().catch(() => {});
    } else if (videoEl) {
      videoEl.srcObject = null;
    }
  }, [secondaryStream, showPipVideo]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const controlButtonClass =
    'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-slate-700 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:translate-y-0';

  const mutedButtonClass =
    'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 shadow-sm transition hover:bg-rose-100';

  return (
    <div className="fixed inset-0 z-50 flex select-none flex-col overflow-hidden bg-linear-to-br from-sky-50 via-indigo-50 to-fuchsia-100 text-slate-900">
      {/* Persistent remote audio receiver */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Header */}
      <header className="relative z-20 flex min-h-16 items-center justify-between gap-3 border-b border-white/70 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20">
            <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full border-2 border-white bg-emerald-500" />
            <VideoIcon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-slate-900 sm:text-base">
              {activeCall.peerName}
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  callState === 'connected'
                    ? 'bg-emerald-500'
                    : 'animate-pulse bg-amber-500'
                }`}
              />
              {callState === 'calling' ? 'Calling…' : 'Connected'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 transition hover:bg-white hover:text-indigo-600"
          aria-label="Toggle fullscreen"
          title="Toggle fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </header>

      {/* Main video area */}
      <main className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-3 sm:p-5">
        <div className="relative flex h-full w-full max-w-6xl items-center justify-center overflow-hidden rounded-3xl border border-white/80 bg-white/45 p-2 shadow-xl shadow-indigo-900/5 backdrop-blur-sm sm:p-4">
          {/* Main stage video */}
          <video
            ref={mainVideoRef}
            autoPlay
            playsInline
            muted={isMainLocal}
            className={`h-full w-full rounded-2xl border border-white/70 bg-slate-950 object-contain shadow-lg ${
              isMainLocal && !isScreenSharing ? 'scale-x-[-1]' : ''
            } ${
              showMainVideo
                ? 'opacity-100'
                : 'pointer-events-none absolute opacity-0'
            }`}
          />

          {/* Audio-only or camera-off fallback */}
          {!showMainVideo && (
            <div className="flex flex-col items-center justify-center px-4 text-center">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-3xl font-bold text-white shadow-xl shadow-indigo-500/20 ring-8 ring-white/60 sm:h-32 sm:w-32 sm:text-4xl">
                <span className="absolute inset-0 animate-pulse rounded-full border border-indigo-300/60" />
                <span className="relative">
                  {isMainLocal ? 'You' : getInitials(activeCall.peerName)}
                </span>
              </div>

              <p className="mt-5 text-base font-semibold text-slate-800">
                {isMainLocal
                  ? 'Your camera is off'
                  : callState === 'calling'
                    ? `Ringing ${activeCall.peerName}…`
                    : `${activeCall.peerName} · Audio only`}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {callState === 'connected'
                  ? 'Your audio connection is active.'
                  : 'Waiting for the other person to connect.'}
              </p>
            </div>
          )}

          {/* Main view label */}
          <div className="absolute left-4 top-4 flex max-w-[65%] items-center gap-2 truncate rounded-xl border border-white/70 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-xl sm:left-6 sm:top-6">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            <span className="truncate">
              {isMainLocal ? 'You · Main view' : activeCall.peerName}
            </span>
            {isMainLocal && isScreenSharing && (
              <span className="shrink-0 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700">
                Sharing
              </span>
            )}
          </div>

          {/* Picture-in-picture: click to swap the main and secondary views */}
          <button
            type="button"
            onClick={() => setIsSwapped((prev) => !prev)}
            title="Click to swap video views"
            aria-label="Swap main and picture-in-picture video"
            className="group absolute bottom-3 right-3 z-10 h-24 w-32 overflow-hidden rounded-2xl border-2 border-white/80 bg-slate-900 shadow-xl transition hover:scale-[1.03] hover:border-indigo-400 active:scale-[0.98] sm:bottom-6 sm:right-6 sm:h-36 sm:w-48 md:h-44 md:w-60"
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
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-linear-to-br from-indigo-100 to-purple-100 text-xs font-semibold text-slate-600">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-500 text-white">
                  {isPipLocal ? 'You' : getInitials(activeCall.peerName)}
                </span>
                {isPipLocal ? 'Camera off' : 'Audio only'}
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-slate-950/65 px-2 py-2 text-left text-[10px] font-medium text-white backdrop-blur-sm sm:px-3">
              <span className="truncate">
                {isPipLocal ? 'You' : activeCall.peerName}
                {isPipLocal && isScreenSharing ? ' · Sharing' : ''}
              </span>
              <ArrowLeftRight className="h-3.5 w-3.5 shrink-0 text-indigo-200 transition group-hover:text-white" />
            </div>
          </button>
        </div>
      </main>

      {/* Call control dock */}
      <footer className="relative z-20 flex min-h-20 items-center justify-center gap-2 border-t border-white/70 bg-white/80 px-3 py-3 backdrop-blur-xl sm:gap-3 sm:px-6">
        {/* Microphone */}
        <button
          type="button"
          onClick={onToggleAudio}
          className={isAudioMuted ? mutedButtonClass : controlButtonClass}
          title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
          aria-label={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
          aria-pressed={isAudioMuted}
        >
          {isAudioMuted ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </button>

        {/* Camera */}
        <button
          type="button"
          onClick={onToggleVideo}
          className={isVideoDisabled ? mutedButtonClass : controlButtonClass}
          title={isVideoDisabled ? 'Start camera' : 'Stop camera'}
          aria-label={isVideoDisabled ? 'Start camera' : 'Stop camera'}
          aria-pressed={isVideoDisabled}
        >
          {isVideoDisabled ? (
            <VideoOff className="h-5 w-5" />
          ) : (
            <VideoIcon className="h-5 w-5" />
          )}
        </button>

        {/* Mobile front/back camera switch */}
        {onSwitchCamera && !isVideoDisabled && (
          <button
            type="button"
            onClick={onSwitchCamera}
            className={controlButtonClass}
            title="Flip camera"
            aria-label="Flip camera"
          >
            <SwitchCamera className="h-5 w-5" />
          </button>
        )}

        {/* Screen sharing */}
        <button
          type="button"
          onClick={onToggleScreenShare}
          className={
            isScreenSharing
              ? 'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm transition hover:bg-emerald-100'
              : controlButtonClass
          }
          title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
          aria-label={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
          aria-pressed={isScreenSharing}
        >
          <Monitor className="h-5 w-5" />
        </button>

        {/* End call */}
        <button
          type="button"
          onClick={onEndCall}
          className="ml-1 flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:-translate-y-0.5 hover:bg-rose-600 active:translate-y-0 sm:ml-2 sm:px-6"
          title="End call"
          aria-label="End call"
        >
          <PhoneOff className="h-5 w-5" />
          <span className="hidden text-sm sm:inline">End call</span>
        </button>
      </footer>
    </div>
  );
}
