'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../AcademicsIcons';
import {
  AiChatMessage,
  StudentProfile,
  GeminiModelId,
  GeminiThinkingLevel,
  GeminiModelConfig,
  DayTimetable,
  AssignmentItem,
  CampusNotice,
} from '../../types/academics.types';
import { apiFetch } from '@/lib/api';



interface CampusAiDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  profile: StudentProfile;
  timetable?: DayTimetable[];
  assignments?: AssignmentItem[];
  notices?: CampusNotice[];
  activeTab?: string;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

const GEMINI_MODELS: GeminiModelConfig[] = [
  {
    id: '3.5-flash-lite',
    name: '3.5 Flash-Lite',
    badge: 'Flash-Lite',
    description: 'Fastest answers',
    apiModel: 'gemini-3.5-flash-lite',
  },
  {
    id: '3.8-flash',
    name: '3.8 Flash',
    badge: 'Flash',
    description: 'All-around help',
    apiModel: 'gemini-3.8-flash',
  },
  {
    id: '3.1-pro',
    name: '3.1 Pro',
    badge: 'Pro',
    description: 'Advanced reasoning',
    apiModel: 'gemini-3.1-pro-preview',
  },
  {
    id: '4-argon',
    name: '4 Argon',
    badge: 'Argon',
    description: 'Complex tasks',
    apiModel: 'gemini-4-argon',
  },
];

const THINKING_LEVELS: { id: GeminiThinkingLevel; label: string; desc: string }[] = [
  { id: 'low', label: 'Low', desc: 'Quick and efficient' },
  { id: 'medium', label: 'Medium', desc: 'Balanced depth' },
  { id: 'high', label: 'High', desc: 'Extra thorough' },
];

export function CampusAiDrawer({
  isOpen,
  onToggle,
  profile,
  timetable = [],
  assignments = [],
  notices = [],
  activeTab = 'timetable',
  initialPrompt,
  onClearInitialPrompt,
}: CampusAiDrawerProps) {
  const [selectedModelId, setSelectedModelId] = useState<GeminiModelId>('3.5-flash-lite');
  const [thinkingLevel, setThinkingLevel] = useState<GeminiThinkingLevel>('low');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThinkingFlyoutOpen, setIsThinkingFlyoutOpen] = useState(false);

  // Settings & Custom API Key State (In-Memory Only, Never Stored in LocalStorage)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  // Security Purge: Automatically erase any exposed Gemini key from browser Local Storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_gemini_api_key');
    }
  }, []);

  // Screen Reading Context Toggle
  const [readPageContext, setReadPageContext] = useState(true);

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Hello ${profile.name}! I am your Campus AI Copilot for ${profile.collegeName}. Ready to assist with ${profile.branch} coursework and exams.`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeModel = GEMINI_MODELS.find((m) => m.id === selectedModelId) || GEMINI_MODELS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsThinkingFlyoutOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Real API Key Validator: Pings Google Gemini through backend
  const handleTestApiKey = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({ valid: false, message: 'Please enter an API key to test.' });
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);

    try {
      const res = await apiFetch<{ valid: boolean; status: number; message: string }>(
        '/ai/validate-key',
        {
          method: 'POST',
          body: JSON.stringify({ apiKey: apiKeyInput.trim() }),
        },
      );

      setTestResult({
        valid: res.valid,
        message: res.message,
      });

      // In-Memory save only (session-based)
      if (res.valid) {
        setCustomApiKey(apiKeyInput.trim());
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed.';
      setTestResult({ valid: false, message: `Error: ${msg}` });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomApiKey(apiKeyInput.trim());
    setIsSettingsOpen(false);
  };

  const handleClearApiKey = () => {
    setCustomApiKey('');
    setApiKeyInput('');
    setTestResult(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_gemini_api_key');
    }
  };

  // Extracts live screen data while strictly scrubbing emails and private profile data
  const generatePageContextString = (): string => {
    if (!readPageContext) return '';

    // 1. Strict Privacy Shield: If viewing the Profile view, do NOT send personal profile credentials
    if (activeTab === 'profile') {
      return `
=== ACTIVE SCREEN CONTEXT ===
Screen Tab: PROFILE SETTINGS
[PRIVACY RESTRICTION: The user is viewing their private profile and account settings. All personal emails, roll numbers, contact records, and credentials are redacted and hidden for security.]
`;
    }

    const now = new Date();
    const liveTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const liveDateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    // Scrub any email pattern found anywhere in screen text
    const scrubEmails = (text: string) =>
      text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, '[PROTECTED_EMAIL]');

    const todaySchedule = timetable.find((d) => d.isToday) || timetable[0];
    const todaySlotsSummary = todaySchedule?.slots?.length
      ? todaySchedule.slots
          .map(
            (s, idx) =>
              `Period ${idx + 1} [${s.startTime} – ${s.endTime}]: ${s.subjectName} (${s.code}) | Room: ${s.room} | Faculty: ${s.faculty}`,
          )
          .join('\n')
      : 'No scheduled classes today';

    const fullWeekSummary = timetable
      .map((d) => `${d.day} (${d.slots.length} periods): ${d.slots.map((s) => s.subjectName).join(', ')}`)
      .join('\n');

    const assignmentsSummary = assignments
      .map((a) => `- ${a.title} [${a.subject}] | Status: ${a.status} | Priority: ${a.priority} | Due: ${a.dueDate}`)
      .join('\n');

    const noticesSummary = notices
      .map((n) => `- [${n.category}] ${n.title} (${n.dateStr}): ${n.summary}`)
      .join('\n');

    const rawContext = `
=== LIVE CLOCK ===
Time: ${liveTimeStr}
Date: ${liveDateStr}

=== ACTIVE SCREEN CONTEXT ===
Screen Tab: ${activeTab.toUpperCase()}
Student: ${profile.name} (${profile.branch}, Sem ${profile.semester})
Institution: ${profile.collegeName}

=== TODAY'S SCHEDULE (${todaySchedule?.day?.toUpperCase() || 'TODAY'}) ===
${todaySlotsSummary}

=== WEEKLY MATRIX ===
${fullWeekSummary}

=== COURSEWORK ON SCREEN ===
${assignmentsSummary || 'No pending coursework'}

=== NOTICES ON SCREEN ===
${noticesSummary || 'No active notices'}
`;

    return scrubEmails(rawContext);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const now = new Date();
    const timeFormatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const userMsg: AiChatMessage = {
      id: `usr-${messages.length + 1}`,
      sender: 'user',
      text,
      timestamp: timeFormatted,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsTyping(true);

    try {
      const pageContext = generatePageContextString();

      const res = await apiFetch<{ success: boolean; reply: string }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          model: activeModel.apiModel,
          modelName: activeModel.name,
          thinkingLevel,
          userApiKey: customApiKey || undefined,
          pageContext: pageContext || undefined,
          messages: newHistory.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      const aiMsg: AiChatMessage = {
        id: `ai-${newHistory.length + 1}`,
        sender: 'assistant',
        text: res.reply || 'No response returned from the model.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Check your backend Gemini configuration.';
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${newHistory.length + 1}`,
          sender: 'assistant',
          text: `⚠️ AI Engine Error: ${errorMsg}\n\nClick the ⚙️ settings icon to verify your Google Gemini API Key.`,
          timestamp: 'Now',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* 1. Floating Animated Side Trigger Button (Right Edge) */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggle}
          title="Open Campus AI Copilot"
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-linear-to-l from-indigo-700 via-indigo-600 to-blue-600 text-white pl-4 pr-3 py-3.5 rounded-l-2xl shadow-xl shadow-indigo-500/25 border-l-2 border-y-2 border-indigo-400/50 hover:pl-5 transition-all flex items-center gap-2 group cursor-pointer animate-pulse hover:animate-none"
        >
          <Icons.Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-bold tracking-wide [writing-mode:vertical-rl] rotate-180">
            Campus AI
          </span>
        </button>
      )}

      {/* 2. Slide-over AI Copilot Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-110 bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white relative">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-indigo-500 to-blue-400 flex items-center justify-center text-white shadow-xs">
              <Icons.Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight">Campus AI</h3>

                {/* Gemini Model Dropdown Selector */}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(!isMenuOpen);
                      setIsThinkingFlyoutOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-medium transition cursor-pointer"
                  >
                    <span>{activeModel.badge}</span>
                    <span className="text-[10px] text-slate-400">▾</span>
                  </button>

                  {/* Google Gemini Popup Menu */}
                  {isMenuOpen && (
                    <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl bg-[#1e1f20] border border-slate-700/80 shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100 select-none">
                      {GEMINI_MODELS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedModelId(item.id);
                            setIsMenuOpen(false);
                            setIsThinkingFlyoutOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-800/80 transition flex items-start gap-2.5 cursor-pointer"
                        >
                          <span className="w-4 text-xs text-indigo-400 pt-0.5 font-bold">
                            {selectedModelId === item.id ? '✓' : ''}
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-slate-100 leading-tight">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      ))}

                      {/* Thinking Level Menu Item */}
                      <div className="relative pt-1 border-t border-slate-800 mt-1">
                        <button
                          type="button"
                          onClick={() => setIsThinkingFlyoutOpen(!isThinkingFlyoutOpen)}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-800/80 transition flex items-center justify-between text-xs text-slate-200 cursor-pointer"
                        >
                          <span className="pl-6.5 font-medium">Thinking level</span>
                          <span className="text-slate-400 text-xs">▸</span>
                        </button>

                        {/* Thinking Level Submenu Flyout */}
                        {isThinkingFlyoutOpen && (
                          <div className="absolute left-full -top-1 ml-1 w-48 rounded-2xl bg-[#1e1f20] border border-slate-700/80 shadow-2xl py-2 z-50 animate-in fade-in duration-100">
                            {THINKING_LEVELS.map((level) => (
                              <button
                                key={level.id}
                                type="button"
                                onClick={() => {
                                  setThinkingLevel(level.id);
                                  setIsThinkingFlyoutOpen(false);
                                  setIsMenuOpen(false);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-800/80 transition flex items-start gap-2 cursor-pointer"
                              >
                                <span className="w-3 text-xs text-indigo-400 font-bold">
                                  {thinkingLevel === level.id ? '✓' : ''}
                                </span>
                                <div>
                                  <p className="text-xs font-semibold text-slate-100 leading-tight">
                                    {level.label}
                                  </p>
                                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                    {level.desc}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 truncate max-w-55">
                {profile.branch} · Sem {profile.semester}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* ⚙️ API Key Settings Button */}
            <button
              type="button"
              onClick={() => {
                setApiKeyInput(customApiKey);
                setTestResult(null);
                setIsSettingsOpen(true);
              }}
              title="Configure & Test Gemini API Key"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              ⚙️
            </button>
            <button
              type="button"
              onClick={onToggle}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Page Context Bar & Active Key Source */}
        <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px]">
          <button
            type="button"
            onClick={() => setReadPageContext(!readPageContext)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
              readPageContext
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-400 border border-slate-200'
            }`}
          >
            <span>{readPageContext ? '👁️ Screen Reading: Active' : '👁️ Screen Reading: Off'}</span>
          </button>
          <span className="text-[10px] font-semibold text-slate-500">
            {customApiKey ? (
              <span className="text-indigo-600 font-mono">🔑 Session Override ({customApiKey.slice(0, 6)}...)</span>
            ) : (
              <span className="text-emerald-600 font-medium">🛡️ Secure Server Engine (Render .env)</span>
            )}
          </span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {['What class is next today?', 'Summarize notices on screen', 'List pending assignments', 'What is the current time'].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className="text-[11px] bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0 transition font-medium cursor-pointer"
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
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
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
            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-100 text-slate-500 text-xs w-40 animate-pulse">
              <span>Reasoning ({activeModel.badge})...</span>
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
            placeholder={`Ask ${activeModel.name} about your schedule, assignments...`}
            className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition cursor-pointer"
          >
            <Icons.Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 3. API Key & Real-Time Test Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Gemini API Key & Testing</h3>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Paste your Google AI Studio key below and click <strong>Test Connection</strong> to verify that your key is valid and has active quota.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Gemini API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => {
                      setApiKeyInput(e.target.value);
                      setTestResult(null);
                    }}
                    placeholder="AIzaSy... or AQ.Ab8..."
                    className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-hidden focus:border-indigo-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleTestApiKey}
                    disabled={isTestingKey || !apiKeyInput.trim()}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl border border-indigo-200 transition cursor-pointer disabled:opacity-50"
                  >
                    {isTestingKey ? 'Testing...' : '⚡ Test Key'}
                  </button>
                </div>
              </div>

              {/* Real Test Result Banner */}
              {testResult && (
                <div
                  className={`p-3 rounded-2xl text-xs font-medium border leading-relaxed ${
                    testResult.valid
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {testResult.message}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleClearApiKey}
                  className="text-rose-600 hover:underline cursor-pointer"
                >
                  Clear Key
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
                  >
                    Save & Close
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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