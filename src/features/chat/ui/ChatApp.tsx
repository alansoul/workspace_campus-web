// src/features/chat/ui/ChatApp.tsx
'use client';

import React, { useState } from 'react';

export function ChatApp() {
  const [activeChannel, setActiveChannel] = useState('#general');
  const [message, setMessage] = useState('');
  const channels = ['#general', '#academic-doubts', '#hackathons', '#freelance-collab'];

  const [messages, setMessages] = useState([
    { id: 1, user: 'Alan Soul', text: 'Has anyone finished problem 4 of DSA Assignment 2?', time: '10:42 AM' },
    { id: 2, user: 'Rahul Verma', text: 'Yes, check the approach with dynamic programming in the repo.', time: '10:45 AM' },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), user: 'You', text: message, time: 'Just now' },
    ]);
    setMessage('');
  };

  return (
    <div className="h-[calc(100vh-64px)] flex bg-slate-950">
      {/* Sidebar Channels */}
      <div className="w-64 border-r border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
        <div className="space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Campus Channels</p>
          <div className="space-y-1">
            {channels.map((ch) => (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition ${
                  activeChannel === ch ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
        <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl text-xs text-slate-400">
          🟢 Connected to Campus WebSocket
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="font-bold text-white text-sm">{activeChannel}</span>
          <span className="text-xs text-slate-400">Institutional Channel</span>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-xs text-indigo-400">{m.user}</span>
                <span className="text-[10px] text-slate-500">{m.time}</span>
              </div>
              <p className="text-sm text-slate-200 mt-0.5">{m.text}</p>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${activeChannel}...`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}