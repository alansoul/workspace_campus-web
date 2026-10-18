
'use client';

import React, { useMemo, useState } from 'react';
import {
  Bell,
  Search,
  Home,
  Users,
  Hash,
  Plus,
  Mail,
  Loader2,
  MessageCircle,
  X,
} from 'lucide-react';
import { Channel } from '../types/chat.types';
import { OnlineMember } from '../hooks/useChat';

interface ChatSidebarProps {
  channels: Channel[];
  directChats: Channel[];
  currentChannel: Channel | null;
  onlineMembers: OnlineMember[];
  onSelectChannel: (channel: Channel) => void;
  onOpenAddFriend: () => void;
  isLoadingChannels: boolean;
  isConnected: boolean;
  userName: string;
  userInitials: string;
}

export function ChatSidebar({
  channels,
  directChats,
  currentChannel,
  onlineMembers,
  onSelectChannel,
  onOpenAddFriend,
  isLoadingChannels,
  isConnected,
  userName,
  userInitials,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredDirectChats = useMemo(
    () =>
      directChats.filter((chat) => {
        const name = chat.friend?.name || 'Peer';
        const email = chat.friend?.email || '';

        return (
          name.toLowerCase().includes(normalizedQuery) ||
          email.toLowerCase().includes(normalizedQuery)
        );
      }),
    [directChats, normalizedQuery],
  );

  const filteredChannels = useMemo(
    () =>
      channels.filter(
        (channel) =>
          channel.name.toLowerCase().includes(normalizedQuery) ||
          (channel.description || '').toLowerCase().includes(normalizedQuery),
      ),
    [channels, normalizedQuery],
  );

  const isUserOnline = (email?: string, id?: string) =>
    onlineMembers.some(
      (member) =>
        Boolean(email && member.email === email) ||
        Boolean(id && member.userId === id),
    );

  const isActiveChannel = (channel: Channel) =>
    currentChannel?.id === channel.id;

  return (
    <>
      {/* Workspace icon rail */}
      <aside className="flex w-15 shrink-0 flex-col items-center gap-4 border-r border-slate-200/80 bg-white/90 py-4 backdrop-blur-xl sm:w-17 dark:border-slate-800 dark:bg-slate-950">
        <button
          type="button"
          title="Campus Workspace"
          aria-label="Campus Workspace"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/25 transition duration-200 hover:scale-105"
        >
          <span className="text-xl font-black">C</span>
        </button>

        <div className="h-px w-8 bg-slate-200 dark:bg-slate-800" />

        <div className="flex w-full flex-1 flex-col items-center gap-3 px-2">
          <button
            type="button"
            title="Home"
            aria-label="Home"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25"
          >
            <Home className="h-5 w-5" />
          </button>

          <button
            type="button"
            title="People"
            aria-label="People"
            onClick={onOpenAddFriend}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
          >
            <Users className="h-5 w-5" />
          </button>

          <button
            type="button"
            title="Messages"
            aria-label="Messages"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-950" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div
            title={isConnected ? 'Connected' : 'Reconnecting'}
            className={`h-2.5 w-2.5 rounded-full ${
              isConnected ? 'bg-emerald-500' : 'animate-pulse bg-amber-500'
            }`}
          />
        </div>
      </aside>

      {/* Channels and direct messages */}
      <aside className="flex min-h-0 w-55 shrink-0 flex-col border-r border-slate-200/80 bg-white/95 sm:w-65 dark:border-slate-800 dark:bg-slate-900">
        {/* Sidebar heading */}
        <div className="border-b border-slate-200/80 p-4 dark:border-slate-800">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
                Campus workspace
              </p>
              <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Circle
              </h1>
            </div>

            <button
              type="button"
              title="Add friend"
              aria-label="Add friend"
              onClick={onOpenAddFriend}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/80">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search chats..."
              aria-label="Search chats and channels"
              className="w-full min-w-0 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
            />

            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
                className="shrink-0 text-slate-400 transition hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
        </div>

        {/* Add friend card */}
        <button
          type="button"
          onClick={onOpenAddFriend}
          className="group mx-3 mt-3 flex items-center gap-3 rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50 via-white to-violet-50 p-3 text-left transition hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5 dark:border-indigo-500/20 dark:from-indigo-500/10 dark:via-slate-900 dark:to-violet-500/10 dark:hover:border-indigo-500/40"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 transition group-hover:scale-105">
            <Mail className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 dark:text-white">
              Add a friend
            </p>
            <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">
              Start a direct message
            </p>
          </div>

          <Plus className="h-4 w-4 shrink-0 text-indigo-500 transition group-hover:rotate-90" />
        </button>

        {/* Scrollable lists */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-3 pt-5">
          {/* Direct messages */}
          <section>
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500 dark:text-slate-400">
                Direct messages
              </h2>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {filteredDirectChats.length}
              </span>
            </div>

            <div className="space-y-1">
              {filteredDirectChats.length === 0 ? (
                <p className="px-2 py-3 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                  {normalizedQuery
                    ? 'No matching direct messages.'
                    : 'No friends yet. Add a friend to start chatting.'}
                </p>
              ) : (
                filteredDirectChats.map((dm) => {
                  const friend = dm.friend;
                  const online = isUserOnline(friend?.email, friend?.id);
                  const active = isActiveChannel(dm);

                  return (
                    <button
                      key={dm.id}
                      type="button"
                      onClick={() => onSelectChannel(dm)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2.5 text-left transition ${
                        active
                          ? 'border-indigo-100 bg-linear-to-r from-indigo-50 to-violet-50 text-indigo-800 dark:border-indigo-500/25 dark:from-indigo-500/15 dark:to-violet-500/10 dark:text-white'
                          : 'border-transparent text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-xs font-bold uppercase text-white shadow-sm">
                          {friend?.name?.trim()?.[0] || 'U'}
                        </div>

                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${
                            online ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-xs font-semibold ${
                            active
                              ? 'text-indigo-800 dark:text-white'
                              : 'text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {friend?.name || 'Peer'}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">
                          {online ? 'Online now' : friend?.email || 'Offline'}
                        </p>
                      </div>

                      {active && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* Campus channels */}
          <section>
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500 dark:text-slate-400">
                Campus channels
              </h2>
              <Hash className="h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="space-y-1">
              {isLoadingChannels ? (
                <div className="flex items-center gap-2 px-2 py-3 text-xs text-slate-500 dark:text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading channels...</span>
                </div>
              ) : filteredChannels.length === 0 ? (
                <p className="px-2 py-3 text-[11px] text-slate-500 dark:text-slate-400">
                  {normalizedQuery
                    ? 'No matching channels.'
                    : 'No channels available.'}
                </p>
              ) : (
                filteredChannels.map((channel) => {
                  const active = isActiveChannel(channel);

                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => onSelectChannel(channel)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left text-xs transition ${
                        active
                          ? 'border-indigo-100 bg-linear-to-r from-indigo-50 to-violet-50 font-semibold text-indigo-800 dark:border-indigo-500/25 dark:from-indigo-500/15 dark:to-violet-500/10 dark:text-white'
                          : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        <Hash className="h-3.5 w-3.5" />
                      </span>

                      <span className="min-w-0 flex-1 truncate">
                        {channel.name}
                      </span>

                      {active && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* Signed-in user */}
        <div className="border-t border-slate-200/80 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-950/60">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-sm">
              {userInitials}

              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-950 ${
                  isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                {userName}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isConnected ? 'bg-emerald-500' : 'animate-pulse bg-amber-500'
                  }`}
                />
                {isConnected ? 'Connected' : 'Reconnecting...'}
              </p>
            </div>

            <Bell className="h-4 w-4 shrink-0 text-slate-400" />
          </div>
        </div>
      </aside>
    </>
  );
}
