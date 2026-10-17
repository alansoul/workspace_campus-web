'use client';

import React from 'react';
import {
  Bell,
  Search,
  Home,
  Users,
  Hash,
  Plus,
  Mail,
  Loader2,
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
  const isUserOnline = (email?: string, id?: string) => {
    return onlineMembers.some(
      (m) => (email && m.email === email) || (id && m.userId === id),
    );
  };

  return (
    <>
      {/* 1. Left Icon Rail */}
      <aside className="flex w-18 flex-col items-center border-r border-[#151926] bg-[#0c0f18] py-3.5 space-y-3 shrink-0">
        <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-[#6366f1] to-[#7c4dff] text-white shadow-lg shadow-indigo-500/25 transition hover:scale-105">
          <span className="text-xl font-black">C</span>
        </button>

        <div className="h-0.5 w-8 rounded-full bg-[#1b2030]" />

        <div className="flex flex-1 flex-col items-center space-y-2.5 overflow-y-auto w-full px-2 scrollbar-none">
          <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#171b29] text-[#8e95a8] hover:bg-[#20273a] hover:text-white transition">
            <Home className="h-5 w-5" />
          </button>
          <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#171b29] text-[#8e95a8] hover:bg-[#20273a] hover:text-white transition">
            <Users className="h-5 w-5" />
          </button>
          <div className="relative">
            <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-tr from-[#ec4899] via-[#8b5cf6] to-[#3b82f6] text-white shadow-md shadow-purple-500/20">
              <span className="text-xs font-black">DH</span>
            </button>
            <div className="absolute -left-3 top-3 h-5 w-1 rounded-r-full bg-white" />
          </div>
        </div>
      </aside>

      {/* 2. Channel & Friends List */}
      <aside className="flex w-64 flex-col border-r border-[#151926] bg-[#0f131f] shrink-0">
        <div className="p-4 border-b border-[#181d2c]">
          <div className="flex items-center justify-between mb-3.5">
            <h1 className="text-lg font-bold text-white tracking-tight">Circle</h1>
            <button className="relative text-[#7e869e] hover:text-white transition">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#ef4444]" />
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-[#151a29] px-3 py-2 text-xs text-[#7e869e]">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-transparent text-white placeholder-[#5a627a] focus:outline-none"
            />
          </div>
        </div>

        {/* Add Friend Trigger Card */}
        <button
          onClick={onOpenAddFriend}
          className="mx-3 my-3 flex items-center gap-2.5 rounded-xl bg-linear-to-br from-[#272052] to-[#161a33] p-3 border border-[#3b3570]/40 text-left hover:border-indigo-500 transition group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5b45f5] text-white group-hover:scale-105 transition">
            <Mail className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white group-hover:text-indigo-300">
              Add friend by email
            </p>
            <p className="text-[10px] text-[#9a9fc0] truncate">Message peers directly</p>
          </div>
        </button>

        {/* Channels & Direct Messages Roster */}
        <div className="flex-1 overflow-y-auto px-3 space-y-4 scrollbar-none">
          {/* Direct Messages Section */}
          <div>
            <div className="flex items-center justify-between px-1 py-1 text-[11px] font-bold uppercase tracking-wider text-[#5f6782]">
              <span>Direct Messages ({directChats.length})</span>
              <button onClick={onOpenAddFriend} className="hover:text-white" title="Add Friend">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-1 space-y-0.5">
              {directChats.length === 0 ? (
                <p className="px-2 py-1 text-[11px] text-[#555d77]">
                  No friends yet. Add by email above!
                </p>
              ) : (
                directChats.map((dm) => {
                  const isActive = currentChannel?.id === dm.id;
                  const friend = dm.friend;
                  const online = isUserOnline(friend?.email, friend?.id);

                  return (
                    <button
                      key={dm.id}
                      onClick={() => onSelectChannel(dm)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                        isActive
                          ? 'bg-[#22293e] text-white font-semibold'
                          : 'text-[#848da6] hover:bg-[#161a28] hover:text-[#c4cadb]'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 text-[10px] font-bold text-white uppercase">
                          {friend?.name ? friend.name[0] : 'U'}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-[#0f131f] ${
                            online ? 'bg-emerald-400' : 'bg-[#4b5563]'
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate leading-tight text-white">{friend?.name || 'Peer'}</p>
                        <p className="truncate text-[10px] text-[#5f6782]">
                          {online ? 'Online' : friend?.email || 'Offline'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Group Channels Section */}
          <div>
            <div className="flex items-center justify-between px-1 py-1 text-[11px] font-bold uppercase tracking-wider text-[#5f6782]">
              <span>Campus Channels</span>
            </div>

            <div className="mt-1 space-y-0.5">
              {isLoadingChannels ? (
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-[#7e869e]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                channels.map((chan) => {
                  const isActive = currentChannel?.id === chan.id;
                  return (
                    <button
                      key={chan.id}
                      onClick={() => onSelectChannel(chan)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                        isActive
                          ? 'bg-[#22293e] text-white font-semibold'
                          : 'text-[#848da6] hover:bg-[#161a28] hover:text-[#c4cadb]'
                      }`}
                    >
                      <Hash className="h-3.5 w-3.5 text-[#5e6680]" />
                      <span className="truncate">{chan.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Logged in User Bar */}
        <div className="flex items-center justify-between border-t border-[#181d2c] bg-[#0c0f18] p-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-tr from-[#6366f1] to-[#a855f7] text-xs font-bold text-white shrink-0">
              {userInitials}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#0c0f18] ${
                  isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{userName}</p>
              <p className="text-[10px] text-[#6d758d]">
                {isConnected ? 'Online' : 'Reconnecting...'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}