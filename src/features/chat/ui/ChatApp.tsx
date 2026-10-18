'use client';

import React, { useState } from 'react';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useChat } from '../hooks/useChat';
import { ChatSidebar } from './ChatSidebar';
import { ChatFeed } from './ChatFeed';
import { ChatRoster } from './ChatRoster';
import { useCall } from '../context/CallContext';
import { Mail, AlertCircle, Loader2 } from 'lucide-react';

type ChatTheme = 'light' | 'dark';

export function ChatApp() {
  const auth = useAuthSession() as {
    user?: { fullName?: string; email?: string; id?: string };
    session?: {
      user?: { fullName?: string; email?: string; id?: string };
    };
  };

  const activeUser = auth?.user || auth?.session?.user;

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

  // Consume the global workspace call system
  const { activeLiveKitRoom, startCall, endCall } = useCall();

  const [theme, setTheme] = useState<ChatTheme>('light');
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [friendEmailInput, setFriendEmailInput] = useState('');
  const [friendError, setFriendError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userName =
    activeUser?.fullName ||
    activeUser?.email?.split('@')[0] ||
    'Campus User';

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

  const handleAddFriendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = friendEmailInput.trim();
    if (!email || isSubmitting) return;

    setFriendError(null);
    setIsSubmitting(true);

    try {
      const result = await addFriendByEmail(email);
      if (result.success) {
        setFriendEmailInput('');
        setAddFriendOpen(false);
      } else {
        setFriendError(result.error || 'Failed to find friend.');
      }
    } catch (error) {
      console.error('Failed to add friend:', error);
      setFriendError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddFriend = () => {
    setFriendError(null);
    setAddFriendOpen(true);
  };

  const closeAddFriend = () => {
    if (isSubmitting) return;
    setAddFriendOpen(false);
    setFriendError(null);
  };

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  };

  return (
    <div
      data-chat-theme={theme}
      className={`chat-workspace relative flex h-[calc(100dvh-3.5rem)] min-h-0 w-full select-none overflow-hidden font-sans antialiased ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      <ChatSidebar
        channels={channels}
        directChats={directChats}
        currentChannel={currentChannel}
        onlineMembers={onlineMembers}
        onSelectChannel={selectChannel}
        onOpenAddFriend={openAddFriend}
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
          if (!currentChannel) return;
          const targetUserId = currentChannel.isDirect ? currentChannel.friend?.id : undefined;
          startCall(currentChannel.id, isVideo, targetUserId);
        }}
        getInitials={getInitials}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <ChatRoster
        onlineMembers={onlineMembers}
        isCalling={Boolean(activeLiveKitRoom)}
        onEndCall={endCall}
        getInitials={getInitials}
      />


      {/* Add Friend Dialog */}
      {addFriendOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeAddFriend();
          }}
        >
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 text-slate-800 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                <Mail className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-base font-bold">Add friend by email</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Start a direct conversation
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Enter the campus email your friend uses to log in. Once added, you can start messaging them.
            </p>

            <form onSubmit={handleAddFriendSubmit} className="mt-5 space-y-3">
              <label
                htmlFor="friend-email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Campus email
              </label>

              <input
                id="friend-email"
                type="email"
                autoComplete="email"
                placeholder="friend@campus.edu.in"
                value={friendEmailInput}
                onChange={(e) => {
                  setFriendEmailInput(e.target.value);
                  if (friendError) setFriendError(null);
                }}
                required
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />

              {friendError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{friendError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAddFriend}
                  disabled={isSubmitting}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !friendEmailInput.trim()}
                  className="flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{isSubmitting ? 'Starting…' : 'Start chat'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}