'use client';

import React, { useEffect, useState } from 'react';
import '@livekit/components-styles';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import { apiFetch } from '@/lib/api';

interface LiveKitVideoCallProps {
  roomName: string;
  onDisconnect: () => void;
}

export function LiveKitVideoCall({ roomName, onDisconnect }: LiveKitVideoCallProps) {
  const [token, setToken] = useState<string>('');
  const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://your-subdomain.livekit.cloud';

  useEffect(() => {
    let isMounted = true;

    async function fetchToken() {
      try {
        const res = await apiFetch<{ token: string }>(
          `/chat/livekit/token?room=${encodeURIComponent(roomName)}`
        );
        if (isMounted && res.token) {
          setToken(res.token);
        }
      } catch (err) {
        console.error('Failed to obtain LiveKit token:', err);
      }
    }

    fetchToken();

    return () => {
      isMounted = false;
    };
  }, [roomName]);

  if (!token) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900 text-white text-sm">
        Connecting to encrypted media edge...
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-950 relative overflow-hidden rounded-2xl">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={liveKitUrl}
        onDisconnected={onDisconnect}
        data-lk-theme="default"
        style={{ height: '100%' }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}