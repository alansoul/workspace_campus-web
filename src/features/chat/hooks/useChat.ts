'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import { axiosInstance } from '@/lib/api';
import { Channel, ChatMessage } from '../types/chat.types';

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
          axiosInstance.get<Channel[]>('/chat/channels', {
            params: userId ? { userId } : undefined,
          }),
          userId
            ? axiosInstance.get<Channel[]>('/chat/direct', {
                params: { userId },
              })
            : Promise.resolve(null),
        ]);

        if (isMounted && channelsRes?.data) {
          setChannels(channelsRes.data);
          if (channelsRes.data.length > 0) {
            setCurrentChannel((prev) => prev ?? channelsRes.data[0]);
          }
        }

        if (isMounted && directRes?.data) {
          setDirectChats(directRes.data);
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

  
  useEffect(() => {
    if (!currentChannel) return;

    const socket = socketRef.current || getSocket();
    const channelId = currentChannel.id;
    let isMounted = true;

    axiosInstance
      .get<ChatMessage[]>(`/chat/channels/${channelId}/messages`, {
        params: { limit: 50 },
      })
      .then(({ data }) => {
        if (isMounted) {
          setMessages(data || []);
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

    const onMessageDeleted = (data: { messageId: string; isSoftDeleted?: boolean; newContent?: string }) => {
      setMessages((prev) =>
        data.isSoftDeleted
          ? prev.map((m) =>
              m.id === data.messageId
                ? { ...m, content: data.newContent || '🚫 This message was deleted', isDeleted: true, fileUrl: undefined }
                : m
            )
          : prev.filter((m) => m.id !== data.messageId)
      );
    };

    const onMessageEdited = (data: { messageId: string; content: string }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === data.messageId ? { ...m, content: data.content, isEdited: true } : m))
      );
    };

    socket.on('newMessage', onNewMessage);
    socket.on('message_deleted', onMessageDeleted);
    socket.on('message_edited', onMessageEdited);

    return () => {
      isMounted = false;
      socket.emit('leaveChannel', channelId);
      socket.off('newMessage', onNewMessage);
      socket.off('message_deleted', onMessageDeleted);
      socket.off('message_edited', onMessageEdited);
    };
  }, [currentChannel]);

  // 3. Upload File to Backend
  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await axiosInstance.post<{
      fileUrl: string;
      fileName: string;
      fileType: string;
      fileSize: number;
    }>('/chat/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data;
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

  const deleteMessage = useCallback(
    (messageId: string, mode: 'SOFT' | 'HARD' = 'SOFT') => {
      if (!currentChannel) return;
      const socket = socketRef.current || getSocket();

      // 1. Optimistic UI Update: update UI immediately so it vanishes right away
      setMessages((prev) =>
        mode === 'SOFT'
          ? prev.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    content: '🚫 This message was deleted by Admin',
                    isDeleted: true,
                    fileUrl: undefined,
                  }
                : m,
            )
          : prev.filter((m) => m.id !== messageId),
      );

      // 2. Send deletion request with explicit user identity
      socket.emit(
        'delete_message',
        {
          messageId,
          channelId: currentChannel.id,
          mode,
          userId: activeUser?.id,
          userEmail: activeUser?.email,
          userRole: (activeUser as { role?: string })?.role,
        },
        (response?: { error?: string }) => {
          if (response?.error) {
            window.alert(`Delete failed: ${response.error}`);
          }
        },
      );
    },
    [currentChannel, activeUser],
  );

  const editMessage = useCallback(
    (messageId: string, content: string) => {
      if (!currentChannel || !content.trim()) return;
      const socket = socketRef.current || getSocket();

      // Optimistic UI update
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, content: content.trim(), isEdited: true } : m)),
      );

      socket.emit('edit_message', {
        messageId,
        channelId: currentChannel.id,
        content: content.trim(),
        userId: activeUser?.id,
      });
    },
    [currentChannel, activeUser],
  );

  const addFriendByEmail = async (friendEmail: string) => {
    if (!activeUser?.id) return { success: false, error: 'User not logged in' };
    try {
      const { data } = await axiosInstance.post<Channel>('/chat/direct', {
        currentUserId: activeUser.id,
        friendEmail: friendEmail.trim(),
      });

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
      const { data: newGroup } = await axiosInstance.post<Channel>(
        '/chat/channels',
        {
          name,
          description,
          userId: activeUser?.id || 'campus-user',
        },
      );
      setChannels((prev) => [...prev, newGroup]);
      setCurrentChannel(newGroup);
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
    deleteMessage, // <-- ADDED
    editMessage,
    uploadFile,
    addFriendByEmail,
    createGroup,
    startCall,
    endCall,
    isCalling,
    localStreamRef,
  };
}