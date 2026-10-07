'use client';

import { useEffect, useState, useRef, useSyncExternalStore } from 'react';
import { socket } from '@/lib/socket';
import { MessageSquare, Send, Hash } from 'lucide-react';

interface ChatMessage {
  id?: string;
  content: string;
  senderName: string;
  createdAt?: string;
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}
function getUserSnapshot() { return localStorage.getItem('user'); }
function getServerSnapshot() { return null; }

export default function ChatPage() {
  const rawUser = useSyncExternalStore(subscribe, getUserSnapshot, getServerSnapshot);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [activeChannel, setActiveChannel] = useState('general');
  const activeChannelRef = useRef(activeChannel);

  useEffect(() => {
    activeChannelRef.current = activeChannel;
  }, [activeChannel]);

  // Connect socket once on mount
  useEffect(() => {
    socket.connect();

    const handleNewMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.disconnect();
    };
  }, []);

  // Manage room switching without dropping connection
  useEffect(() => {
    socket.emit('joinChannel', activeChannel);

    return () => {
      socket.emit('leaveChannel', activeChannel);
    };
  }, [activeChannel]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !rawUser) return;

    socket.emit('sendMessage', {
      channelId: activeChannel,
      content: input,
    });
    setInput('');
  }

  const channels = ['general', 'doubts', 'hackathons', 'projects'];

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-slate-950 flex">
      <aside className="w-64 border-r border-slate-800 bg-slate-900/40 p-4 space-y-4 hidden md:block">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
          Campus Channels
        </h2>
        <div className="space-y-1">
          {channels.map((ch) => (
            <button
              key={ch}
              onClick={() => {
                setMessages([]);
                setActiveChannel(ch);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                activeChannel === ch
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Hash className="w-4 h-4 text-purple-400" /> {ch}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col justify-between bg-slate-950">
        <div className="p-4 border-b border-slate-800 bg-slate-900/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white">{activeChannel}</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
            ● Socket.io Live
          </span>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center my-auto pt-20 space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-700 mx-auto" />
              <p className="text-xs text-slate-500 italic">No messages in #{activeChannel} yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded-2xl max-w-lg space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-purple-400">{m.senderName}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{m.content}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900/30 flex gap-2">
          <input
            type="text"
            value={input}
            placeholder={`Message #${activeChannel}...`}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-xl text-white transition flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}