'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../AcademicsIcons';
import { AiChatMessage, StudentProfile } from '../../types/academics.types';

interface CampusAiDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  profile: StudentProfile;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export function CampusAiDrawer({
  isOpen,
  onToggle,
  profile,
  initialPrompt,
  onClearInitialPrompt,
}: CampusAiDrawerProps) {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Hello ${profile.name}! I am your Campus AI Copilot for ${profile.collegeName}. How can I assist you with your schedule, coursework, or notices today?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-fill prompt when user clicks a prompt in a connector card (deferred to prevent cascading render)
  useEffect(() => {
    if (initialPrompt) {
      const timer = setTimeout(() => {
        setInputText(initialPrompt);
        onClearInitialPrompt?.();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialPrompt, onClearInitialPrompt]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const now = new Date();
    const timeFormatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Pure deterministic ID based on message sequence (satisfies react-hooks/purity)
    const userMsg: AiChatMessage = {
      id: `usr-${messages.length + 1}`,
      sender: 'user',
      text,
      timestamp: timeFormatted,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // AI synthesis with campus context
    setTimeout(() => {
      let aiResponseText = `Based on your ${profile.branch} (Semester ${profile.semester}) curriculum at ${profile.collegeName}: `;

      if (/today|class|schedule|timetable/i.test(text)) {
        aiResponseText += `You have classes today. Next up is Digital Electronics (EC101) with Dr. Manoj in Room 138, followed by Linear Algebra with Dr. Mithilesh.`;
      } else if (/notice|circular|email/i.test(text)) {
        aiResponseText += `Latest notice from the Academic Office: "Autumn Semester 2026-27 Master Timetable Published" w.e.f. 07/09/2026. All lab sessions are in Lab 1 & 2.`;
      } else if (/exam|quiz/i.test(text)) {
        aiResponseText += `You have Calculus Quiz 1 scheduled on 19 Oct 2026 at 09:00 in Room 138.`;
      } else {
        aiResponseText += `I've analyzed your query regarding "${text}". I have summarized key formulas and pinned relevant study materials from your Lecture Drive.`;
      }

      const aiMsg: AiChatMessage = {
        id: `ai-${messages.length + 2}`,
        sender: 'assistant',
        text: aiResponseText,
        timestamp: timeFormatted,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <>
      {/* 1. Floating Animated Side Trigger Button (Right Edge) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          title="Open Campus AI Copilot"
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-l from-indigo-700 via-indigo-600 to-blue-600 text-white pl-4 pr-3 py-3.5 rounded-l-2xl shadow-xl shadow-indigo-500/25 border-l-2 border-y-2 border-indigo-400/50 hover:pl-5 transition-all flex items-center gap-2 group cursor-pointer animate-pulse hover:animate-none"
        >
          <Icons.Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-bold tracking-wide [writing-mode:vertical-rl] rotate-180">
            Campus AI
          </span>
        </button>
      )}

      {/* 2. Slide-over AI Copilot Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-400 flex items-center justify-center text-white shadow-xs">
              <Icons.Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm tracking-tight">Campus AI Copilot</h3>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                  Gemini 1.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                {profile.branch} · Sem {profile.semester}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {['Next class?', 'Summarize notices', 'Calculus quiz topics'].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className="text-[11px] bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0 transition font-medium cursor-pointer"
            >
              ✦ {chip}
            </button>
          ))}
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 space-y-3.5 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-100 text-slate-500 text-xs w-24 animate-pulse">
              <span>Thinking</span>
              <span className="animate-bounce">...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3.5 border-t border-slate-100 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about timetable, professors, exams..."
            className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition cursor-pointer"
          >
            <Icons.Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Dim backdrop on mobile */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/20 z-40 sm:hidden transition-opacity"
        />
      )}
    </>
  );
}