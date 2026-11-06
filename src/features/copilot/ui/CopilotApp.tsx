'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  Plus,
  ArrowUp,
  MessageSquare,
  History,
  Compass,
  FolderOpen,
  Bookmark,
  Settings,
  HelpCircle,
  ChevronDown,
  Bot,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { useCopilotOrchestrator } from '../hooks/useCopilotOrchestrator';
import { CopilotOrb } from './components/CopilotOrb';
import { CopilotPromptBox } from './components/CopilotPromptBox';
import { AgentReasoningView } from './components/AgentReasoningView';

export function CopilotApp() {
  const {
    greeting,
    inputPrompt,
    setInputPrompt,
    typedPlaceholder,
    citationsEnabled,
    setCitationsEnabled,
    selectedModel,
    activeNav,
    setActiveNav,
    messages,
    isProcessing,
    expandedThoughtId,
    setExpandedThoughtId,
    showShell,
    showOrb,
    showHeading,
    showInputBox,
    showCards,
    messagesEndRef,
    handleSendMessage,
    exampleCards,
    resetThread,
  } = useCopilotOrchestrator();

  return (
    <div className="flex h-screen w-full bg-[#FAFBFD] text-slate-800 font-sans overflow-hidden select-none">
      <style jsx global>{`
        @keyframes orbFloating {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-11px) scale(1.02); }
        }
        @keyframes shadowPulsing {
          0%, 100% { transform: scale(1); opacity: 0.38; }
          50% { transform: scale(0.82); opacity: 0.18; }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-orb-float { animation: orbFloating 4.4s ease-in-out infinite; }
        .animate-shadow-pulse { animation: shadowPulsing 4.4s ease-in-out infinite; }
        .animate-cursor { animation: cursorBlink 1s infinite; }
      `}</style>

      {/* Slim Left Navigation Rail */}
      <aside
        className={`w-16 shrink-0 flex flex-col items-center justify-between py-5 bg-white border-r border-slate-200/80 z-20 transition-all duration-700 ease-out ${
          showShell ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
        }`}
      >
        <div className="flex flex-col items-center gap-6 w-full">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
            title="Back to Dashboard"
          >
            <Sparkles className="w-5 h-5 text-purple-400" />
          </Link>

          <nav className="flex flex-col items-center gap-2 w-full px-2">
            {[
              { id: 'chat', icon: MessageSquare, tooltip: 'Orchestrator' },
              { id: 'history', icon: History, tooltip: 'History' },
              { id: 'explore', icon: Compass, tooltip: 'Campus Mind' },
              { id: 'vault', icon: FolderOpen, tooltip: 'Materials' },
              { id: 'saved', icon: Bookmark, tooltip: 'Bookmarks' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  title={item.tooltip}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-purple-50 text-purple-600 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button title="Help" className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button title="Settings" className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <Settings className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-full bg-linear-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-purple-100 shadow-xs cursor-pointer">
            R
          </div>
        </div>
      </aside>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header
          className={`h-16 shrink-0 flex items-center justify-between px-8 border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-10 transition-all duration-700 ease-out ${
            showShell ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300 transition">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span>{selectedModel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-50 border border-purple-200/60 text-[11px] font-semibold text-purple-700">
              <Layers className="w-3 h-3" /> Multi-Agent Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200/80 bg-white text-xs font-medium text-slate-500 hover:text-slate-800 hover:border-slate-300 transition">
              <Search className="w-3.5 h-3.5" />
              <span>Search thread</span>
            </button>

            <button
              onClick={resetThread}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-xs hover:bg-slate-800 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Thread</span>
            </button>
          </div>
        </header>

        {/* Center Workspace */}
        <main className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto">
              <CopilotOrb show={showOrb} />

              <div
                className={`text-center mb-8 space-y-1 transition-all duration-700 ease-out delay-100 ${
                  showHeading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
              >
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                  {greeting}, Jason
                </h1>
                <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-800">
                What&apos;s on{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 via-pink-500 to-purple-600 font-bold">
                  your mind?
                </span>
              </p>
              </div>

              <CopilotPromptBox
                show={showInputBox}
                inputPrompt={inputPrompt}
                setInputPrompt={setInputPrompt}
                typedPlaceholder={typedPlaceholder}
                citationsEnabled={citationsEnabled}
                setCitationsEnabled={setCitationsEnabled}
                onSubmit={() => handleSendMessage()}
              />

              <div className="w-full">
                <p
                  className={`text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-3 px-1 transition-all duration-700 ${
                    showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  GET STARTED WITH AN EXAMPLE BELOW
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {exampleCards.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={index}
                        onClick={() => handleSendMessage(item.title)}
                        style={{ transitionDelay: `${index * 110 + 200}ms` }}
                        className={`group bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between h-36 cursor-pointer hover:border-purple-300 hover:shadow-md hover:-translate-y-1 transition-all duration-700 ease-out ${
                          showCards ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
                        }`}
                      >
                        <h3 className="text-xs font-medium text-slate-700 leading-snug line-clamp-3 group-hover:text-slate-900">
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between pt-2">
                          <div className="w-6 h-6 rounded-lg bg-slate-50 group-hover:bg-purple-50 text-slate-400 group-hover:text-purple-600 flex items-center justify-center transition">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6 pb-24">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  {msg.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-slate-900 text-white px-5 py-3.5 text-sm shadow-xs leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>

                      <div className="flex-1 space-y-3">
                        {msg.agentSteps && msg.agentSteps.length > 0 && (
                          <AgentReasoningView
                            steps={msg.agentSteps}
                            isExpanded={expandedThoughtId === msg.id}
                            onToggle={() =>
                              setExpandedThoughtId(expandedThoughtId === msg.id ? null : msg.id)
                            }
                            isProcessing={isProcessing}
                          />
                        )}

                        {msg.content && (
                          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 text-sm text-slate-800 shadow-xs leading-relaxed space-y-2.5">
                            <div className="whitespace-pre-line">{msg.content}</div>

                            {msg.citations && msg.citations.length > 0 && (
                              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-semibold text-slate-400">Sources:</span>
                                {msg.citations.map((cite, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[11px] flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3 text-slate-400" />
                                    {cite}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {msg.suggestedFollowUps && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {msg.suggestedFollowUps.map((prompt, i) => (
                              <button
                                key={i}
                                onClick={() => handleSendMessage(prompt)}
                                className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:border-purple-300 hover:text-purple-700 transition shadow-2xs"
                              >
                                {prompt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Footer input when conversation is active */}
        {messages.length > 0 && (
          <footer className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-200/80">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-2 flex items-center gap-2">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask Copilot a follow-up or query next class..."
                className="flex-1 bg-transparent px-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputPrompt.trim() || isProcessing}
                className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition disabled:opacity-30"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}