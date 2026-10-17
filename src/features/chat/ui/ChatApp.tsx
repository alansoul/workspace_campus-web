'use client';

import React, { useState } from 'react';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useChat } from '../hooks/useChat';
import { useWebRTCCall } from '../hooks/useWebRTCCall';
import { ChatSidebar } from './ChatSidebar';
import { ChatFeed } from './ChatFeed';
import { ChatRoster } from './ChatRoster';
import { IncomingCallModal } from './call/IncomingCallModal';
import { ActiveCallOverlay } from './call/ActiveCallOverlay';
import { Mail, AlertCircle, Loader2 } from 'lucide-react';

export function ChatApp() {
  const auth = useAuthSession() as {
    user?: { fullName?: string; email?: string; id?: string };
    session?: { user?: { fullName?: string; email?: string; id?: string } };
  };
  const activeUser = auth?.user || auth?.session?.user;

  // 1. Chat, Channels, and Direct Messaging State
  const {
    channels,
    directChats,
    currentChannel,
    selectChannel,
    messages,
    onlineMembers,
    isLoadingChannels,
    isLoadingMessages,
    isConnected,
    sendMessage,
    uploadFile,
    addFriendByEmail,
  } = useChat(activeUser);

  // 2. Dedicated WebRTC Audio / Video / Screen Share Call State
  const {
    callState,
    incomingCall,
    activeCall,
    localStream,
    remoteStream,
    hasRemoteVideo,
    isAudioMuted,
    isVideoDisabled,
    isScreenSharing,
    switchCamera,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  } = useWebRTCCall(activeUser);

  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [friendEmailInput, setFriendEmailInput] = useState('');
  const [friendError, setFriendError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleAddFriendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendEmailInput.trim()) return;

    setFriendError(null);
    setIsSubmitting(true);

    const result = await addFriendByEmail(friendEmailInput);
    setIsSubmitting(false);

    if (result.success) {
      setFriendEmailInput('');
      setAddFriendOpen(false);
    } else {
      setFriendError(result.error || 'Failed to find friend');
    }
  };

  const userName =
    activeUser?.fullName || activeUser?.email?.split('@')[0] || 'Campus User';

  return (
    <div className="flex h-screen w-full select-none overflow-hidden bg-[#0a0d14] text-[#cfd4dc] font-sans antialiased relative">
      <ChatSidebar
        channels={channels}
        directChats={directChats}
        currentChannel={currentChannel}
        onlineMembers={onlineMembers}
        onSelectChannel={selectChannel}
        onOpenAddFriend={() => {
          setFriendError(null);
          setAddFriendOpen(true);
        }}
        isLoadingChannels={isLoadingChannels}
        isConnected={isConnected}
        userName={userName}
        userInitials={getInitials(userName)}
      />

      <ChatFeed
        currentChannel={currentChannel}
        messages={messages}
        isLoadingMessages={isLoadingMessages}
        currentUserId={activeUser?.id}
        currentUserName={userName}
        onSendMessage={sendMessage}
        onUploadFile={uploadFile}
        onStartCall={(isVideo) => {
          if (currentChannel) {
            const peerName = currentChannel.friend?.name || currentChannel.name;
            startCall(currentChannel.id, peerName, isVideo);
          }
        }}
        getInitials={getInitials}
      />

      <ChatRoster
        onlineMembers={onlineMembers}
        isCalling={callState === 'connected'}
        onEndCall={endCall}
        localStream={localStream}
        getInitials={getInitials}
      />

      {/* 1. Incoming Call Alert Modal */}
      {callState === 'incoming' && incomingCall && (
        <IncomingCallModal
          incomingCall={incomingCall}
          onAccept={acceptCall}
          onReject={rejectCall}
          getInitials={getInitials}
        />
      )}

      {/* 2. Active Call Room (Audio, Video, Screen Share) */}
      {(callState === 'calling' || callState === 'connected') && activeCall && (
        <ActiveCallOverlay
          activeCall={activeCall}
          callState={callState}
          localStream={localStream}
          remoteStream={remoteStream}
          hasRemoteVideo={hasRemoteVideo}
          isAudioMuted={isAudioMuted}
          isVideoDisabled={isVideoDisabled}
          isScreenSharing={isScreenSharing}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={toggleScreenShare}
          onSwitchCamera={switchCamera}
          onEndCall={endCall}
          getInitials={getInitials}
        />
      )}

      {/* 3. Add Friend by Email Modal */}
      {addFriendOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-[#22293d] bg-[#121624] p-5 shadow-2xl">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-tr from-indigo-500 to-purple-600 text-white">
                <Mail className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-white">Add Friend by Email</h3>
            </div>
            <p className="text-xs text-[#707994]">
              Enter the campus email your friend used to log in. Once added, you can start messaging immediately.
            </p>

            <form onSubmit={handleAddFriendSubmit} className="mt-4 space-y-3">
              <input
                type="email"
                placeholder="friend@campus.edu.in"
                value={friendEmailInput}
                onChange={(e) => setFriendEmailInput(e.target.value)}
                required
                className="w-full rounded-xl border border-[#2b334a] bg-[#181d2e] px-3.5 py-2.5 text-xs text-white placeholder-[#5d6682] focus:border-indigo-500 focus:outline-none"
              />

              {friendError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{friendError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddFriendOpen(false)}
                  className="rounded-xl px-3 py-1.5 text-xs text-[#8e96af] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !friendEmailInput.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md hover:opacity-95 disabled:opacity-40"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Start Chat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}