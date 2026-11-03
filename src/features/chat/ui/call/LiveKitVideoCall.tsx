'use client';

import React, { useEffect, useState } from 'react';
import '@livekit/components-styles';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import { axiosInstance } from '@/lib/api';

interface LiveKitVideoCallProps {
  roomName: string;
  currentUser?: { id?: string; fullName?: string; email?: string };
  onDisconnect: () => void;
}

export function LiveKitVideoCall({
  roomName,
  currentUser,
  onDisconnect,
}: LiveKitVideoCallProps) {
  const [token, setToken] = useState<string>('');
  const [tokenError, setTokenError] = useState(false);
  const [canEnableVideo, setCanEnableVideo] = useState(false);
  const [isMediaReady, setIsMediaReady] = useState(false);

  const liveKitUrl =
    process.env.NEXT_PUBLIC_LIVEKIT_URL ||
    'wss://northstar-workspace-1d4bpd9g.livekit.cloud';

  useEffect(() => {
    let isMounted = true;

    async function initCall() {
      setTokenError(false);
      setToken('');
      setIsMediaReady(false);

      // 1. Probe camera access to prevent the Windows "Device in use" hardware crash
      let cameraAvailable = false;
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        // Release the test stream immediately so LiveKit can capture the sensor
        testStream.getTracks().forEach((track) => track.stop());
        cameraAvailable = true;
      } catch (err: unknown) {
        const error = err as Error;
        console.warn(
          '[LiveKit] Camera busy or unavailable, falling back to audio-only mode:',
          error.name || error.message
        );
        cameraAvailable = false;
      }

      if (isMounted) {
        setCanEnableVideo(cameraAvailable);
        setIsMediaReady(true);
      }

      // 2. Pass actual user ID and name so video tiles don't default to "Campus Peer"
      const userId = currentUser?.id || `user_${Math.random().toString(36).substring(2, 8)}`;
      const username =
        currentUser?.fullName ||
        currentUser?.email?.split('@')[0] ||
        'Campus Member';

      try {
        const { data: res } = await axiosInstance.get<{ token: string }>(
          '/chat/livekit/token',
          {
            params: {
              room: roomName,
              userId,
              username,
            },
          },
        );

        if (isMounted) {
          if (res?.token) {
            setToken(res.token);
          } else {
            setTokenError(true);
          }
        }
      } catch (err) {
        console.error('Failed to obtain LiveKit token:', err);
        if (isMounted) setTokenError(true);
      }
    }

    initCall();

    return () => {
      isMounted = false;
    };
  }, [roomName, currentUser?.id, currentUser?.fullName, currentUser?.email]);

  if (tokenError) {
    return (
      <div className="flex h-full min-h-64 w-full items-center justify-center rounded-3xl border border-rose-100 bg-linear-to-br from-white via-rose-50 to-indigo-50 p-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h3 className="font-semibold text-slate-900">
            Unable to connect to the call
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            We couldn’t obtain the media connection token. Please try joining
            the call again.
          </p>
          <button
            type="button"
            onClick={() => {
              setTokenError(false);
              setToken('');
            }}
            className="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!token || !isMediaReady) {
    return (
      <div className="flex h-full min-h-64 w-full items-center justify-center overflow-hidden rounded-3xl border border-white/70 bg-linear-to-br from-sky-50 via-white to-violet-100 p-6">
        <div className="text-center">
          <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
            <span className="absolute inset-0 animate-ping rounded-2xl bg-indigo-400/20" />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="relative h-7 w-7"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="m10 9 5 3-5 3z" />
            </svg>
          </div>

          <h3 className="font-semibold text-slate-800">
            Connecting to your call
          </h3>
          <p className="mt-2 text-xs text-slate-500">
            Preparing the secure media connection…
          </p>
          <div className="mx-auto mt-4 h-1 w-32 overflow-hidden rounded-full bg-indigo-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-linear-to-r from-indigo-500 to-fuchsia-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-64 w-full overflow-hidden rounded-3xl border border-white/70 bg-slate-950 shadow-xl shadow-indigo-950/10">
      <LiveKitRoom
        video={canEnableVideo}
        audio={true}
        token={token}
        serverUrl={liveKitUrl}
        connect={true}
        options={{
          adaptiveStream: true,
          dynacast: true,
          publishDefaults: {
            simulcast: false, // Prevents "Element not part of the array" error & reduces latency
          },
        }}
        onError={(err) => {
          // Gracefully ignore device locks, permission denials, and user disconnects
          if (
            err.name === 'NotReadableError' ||
            err.name === 'NotAllowedError' ||
            err.name === 'PermissionDeniedError' ||
            err.message?.includes('Device in use') ||
            err.message?.includes('Permission denied') ||
            err.message?.includes('Client initiated disconnect')
          ) {
            console.warn('[LiveKit] Media permission denied or hardware busy. Entering room without auto-publishing.');
            return;
          }
          console.error('[LiveKit Room Error]', err);
          setTokenError(true);
        }}
        onDisconnected={() => {
          if (!tokenError) {
            onDisconnect();
          }
        }}
        data-lk-theme="default"
        style={{ height: '100%' }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}