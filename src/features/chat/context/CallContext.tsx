'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { getSocket } from '@/lib/socket';
import { IncomingCallModal } from '../ui/call/IncomingCallModal';
import { LiveKitVideoCall } from '../ui/call/LiveKitVideoCall';

interface IncomingCallPayload {
  fromSocketId: string;
  channelId: string;
  callerName: string;
  callerId: string;
  roomName: string;
  isVideo: boolean;
}

interface CallContextType {
  activeLiveKitRoom: string | null;
  startCall: (channelId: string, isVideo: boolean, targetUserId?: string) => void;
  endCall: () => void;
}

const CallContext = createContext<CallContextType | null>(null);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthSession() as {
    user?: { fullName?: string; email?: string; id?: string };
    session?: { user?: { fullName?: string; email?: string; id?: string } };
  };
  const activeUser = auth?.user || auth?.session?.user;

  const [activeLiveKitRoom, setActiveLiveKitRoom] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCallPayload | null>(null);

  const userName =
    activeUser?.fullName ||
    activeUser?.email?.split('@')[0] ||
    'Campus User';

  // 1. Maintain user registration on the socket globally
  useEffect(() => {
    if (!activeUser?.id) return;
    const socket = getSocket();

    const register = () => {
      socket.emit('user:register', {
        userId: activeUser.id,
        email: activeUser.email,
        fullName: activeUser.fullName,
      });
    };

    if (socket.connected) register();
    socket.on('connect', register);

    return () => {
      socket.off('connect', register);
    };
  }, [activeUser?.id, activeUser?.email, activeUser?.fullName]);

  // 2. Global call listeners active on all pages
  useEffect(() => {
    const socket = getSocket();

    const handleIncomingCall = (data: IncomingCallPayload) => {
      if (data.callerId === activeUser?.id) return;
      setIncomingCall(data);
    };

    const handleCallEnded = () => {
      setIncomingCall(null);
      setActiveLiveKitRoom(null);
    };

    const handleCallRejected = () => {
      setIncomingCall(null);
    };

    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:ended', handleCallEnded);
    socket.on('call:rejected', handleCallRejected);

    return () => {
      socket.off('call:incoming', handleIncomingCall);
      socket.off('call:ended', handleCallEnded);
      socket.off('call:rejected', handleCallRejected);
    };
  }, [activeUser?.id]);

  // 3. Initiate call
  const startCall = useCallback(
    (channelId: string, isVideo: boolean, targetUserId?: string) => {
      const roomId = `campus-${channelId}`;
      setActiveLiveKitRoom(roomId);

      const socket = getSocket();
      socket.emit('call:offer', {
        channelId,
        targetUserId,
        callerName: userName,
        callerId: activeUser?.id || 'anonymous',
        roomName: roomId,
        isVideo,
      });
    },
    [activeUser?.id, userName]
  );

  const handleAcceptCall = () => {
    if (!incomingCall) return;
    const roomToJoin = incomingCall.roomName || `campus-${incomingCall.channelId}`;
    setActiveLiveKitRoom(roomToJoin);
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      getSocket().emit('call:reject', { channelId: incomingCall.channelId });
    }
    setIncomingCall(null);
  };

  const handleDisconnectCall = useCallback(() => {
    getSocket().emit('call:end', { channelId: 'global' });
    setActiveLiveKitRoom(null);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <CallContext.Provider value={{ activeLiveKitRoom, startCall, endCall: handleDisconnectCall }}>
      {children}

      {/* Global Ringing Modal - Appears over any page */}
      {incomingCall && !activeLiveKitRoom && (
        <IncomingCallModal
          incomingCall={{
            fromSocketId: incomingCall.fromSocketId,
            channelId: incomingCall.channelId,
            offer: {} as RTCSessionDescriptionInit,
            callerName: incomingCall.callerName,
            callerId: incomingCall.callerId,
            isVideo: incomingCall.isVideo,
          }}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
          getInitials={getInitials}
        />
      )}

      {/* Global LiveKit Video Conference - Stays connected while navigating */}
      {activeLiveKitRoom && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-md sm:p-6">
          <div className="relative h-full w-full max-w-6xl overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
            <LiveKitVideoCall
              roomName={activeLiveKitRoom}
              currentUser={activeUser}
              onDisconnect={handleDisconnectCall}
            />
          </div>
        </div>
      )}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
}