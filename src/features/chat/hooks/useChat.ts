'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import { Channel, ChatMessage } from '../types/chat.types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://workspace-campus-api.onrender.com';

// Helper to construct absolute URL if API_URL is relative or proxy-based
const getApiEndpoint = (endpoint: string) => {
  if (typeof window !== 'undefined' && API_URL.startsWith('/')) {
    return `${window.location.origin}${API_URL}${endpoint}`;
  }
  return `${API_URL}${endpoint}`;
};

export interface OnlineMember {
  userId: string;
  name: string;
  email: string;
}

export function useChat(activeUser?: { id?: string; fullName?: string; email?: string }) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [directChats, setDirectChats] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);

  const [isConnected, setIsConnected] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return getSocket().connected;
    }
    return false;
  });

  const [isCalling, setIsCalling] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const currentChannelRef = useRef<Channel | null>(null);

  useEffect(() => {
    currentChannelRef.current = currentChannel;
  }, [currentChannel]);

  const endCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsCalling(false);
    if (currentChannelRef.current) {
      const socket = socketRef.current || getSocket();
      socket.emit('call:end', { channelId: currentChannelRef.current.id });
    }
  }, []);

  const endCallRef = useRef(endCall);
  useEffect(() => {
    endCallRef.current = endCall;
  }, [endCall]);

  // 1. Initial Socket & Channels Setup
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onPresenceSync = (users: OnlineMember[]) => setOnlineMembers(users);
    const onCallEnded = () => endCallRef.current();

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('presence:sync', onPresenceSync);
    socket.on('call:ended', onCallEnded);

    let isMounted = true;

    async function loadData() {
      try {
        const userId = activeUser?.id;
        const [channelsRes, directRes] = await Promise.all([
          fetch(getApiEndpoint(`/chat/channels${userId ? `?userId=${userId}` : ''}`), { credentials: 'include' }),
          userId ? fetch(getApiEndpoint(`/chat/direct?userId=${userId}`), { credentials: 'include' }) : Promise.resolve(null),
        ]);

        if (channelsRes.ok && isMounted) {
          const channelData: Channel[] = await channelsRes.json();
          setChannels(channelData);
          if (channelData.length > 0) {
            setCurrentChannel((prev) => prev ?? channelData[0]);
          }
        }

        if (directRes && directRes.ok && isMounted) {
          const directData: Channel[] = await directRes.json();
          setDirectChats(directData);
        }
      } catch (err) {
        console.error('Failed to load chat data:', err);
      } finally {
        if (isMounted) setIsLoadingChannels(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('presence:sync', onPresenceSync);
      socket.off('call:ended', onCallEnded);
    };
  }, [activeUser?.id]);

  // 2. Fetch Messages and Join Room
  useEffect(() => {
    if (!currentChannel) return;

    const socket = socketRef.current || getSocket();
    const channelId = currentChannel.id;
    let isMounted = true;

    fetch(getApiEndpoint(`/chat/channels/${channelId}/messages?limit=50`), { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ChatMessage[]) => {
        if (isMounted) {
          setMessages(data);
          setIsLoadingMessages(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingMessages(false);
      });

    socket.emit('joinChannel', channelId);

    const onNewMessage = (msg: ChatMessage) => {
      if (msg.channelId === channelId) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      }
    };

    socket.on('newMessage', onNewMessage);

    return () => {
      isMounted = false;
      socket.emit('leaveChannel', channelId);
      socket.off('newMessage', onNewMessage);
    };
  }, [currentChannel]);

  // 3. Upload File to Backend
  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(getApiEndpoint('/chat/upload'), {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!res.ok) throw new Error('File upload failed');
    return (await res.json()) as {
      fileUrl: string;
      fileName: string;
      fileType: string;
      fileSize: number;
    };
  };

  // 4. Send Message (Text + Attachments)
  const sendMessage = useCallback(
    (
      content: string,
      attachment?: {
        fileUrl?: string;
        fileType?: string;
        fileName?: string;
        fileSize?: number;
      },
    ) => {
      if (!currentChannel || (!content.trim() && !attachment?.fileUrl)) return;
      const socket = socketRef.current || getSocket();
      socket.emit('sendMessage', {
        channelId: currentChannel.id,
        content: content.trim(),
        senderId: activeUser?.id,
        senderName: activeUser?.fullName || activeUser?.email?.split('@')[0],
        ...attachment,
      });
    },
    [currentChannel, activeUser],
  );

  const addFriendByEmail = async (friendEmail: string) => {
    if (!activeUser?.id) return { success: false, error: 'User not logged in' };
    try {
      const res = await fetch(getApiEndpoint('/chat/direct'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUserId: activeUser.id,
          friendEmail: friendEmail.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || 'Failed to add friend' };
      }

      setDirectChats((prev) => {
        const exists = prev.some((c) => c.id === data.id);
        return exists ? prev : [data, ...prev];
      });

      setCurrentChannel(data);
      return { success: true };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Connection error';
      return { success: false, error: errorMessage };
    }
  };

  const createGroup = async (name: string, description?: string) => {
    try {
      const res = await fetch(getApiEndpoint('/chat/channels'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          userId: activeUser?.id || 'campus-user',
        }),
      });
      if (res.ok) {
        const newGroup = await res.json();
        setChannels((prev) => [...prev, newGroup]);
        setCurrentChannel(newGroup);
      }
    } catch (err) {
      console.error('Failed to create group:', err);
    }
  };

  const startCall = async (isVideo: boolean) => {
    if (!currentChannel) return;
    setIsCalling(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo,
      });
      localStreamRef.current = stream;

      const socket = socketRef.current || getSocket();
      socket.emit('call:start', {
        channelId: currentChannel.id,
        callerName: activeUser?.fullName || 'Campus Peer',
        isVideo,
      });
    } catch (err) {
      console.error('Media stream error:', err);
      setIsCalling(false);
    }
  };

  return {
    channels,
    directChats,
    currentChannel,
    selectChannel: (ch: Channel) => {
      setCurrentChannel(ch);
      setIsLoadingMessages(true);
    },
    messages,
    onlineMembers,
    isLoadingChannels,
    isLoadingMessages,
    isConnected,
    sendMessage,
    uploadFile,
    addFriendByEmail,
    createGroup,
    startCall,
    endCall,
    isCalling,
    localStreamRef,
  };
}