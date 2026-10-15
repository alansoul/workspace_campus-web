'use client';

import React, { useState } from 'react';
import { McpConnector } from '../../types/academics.types';
import { Icons } from '../AcademicsIcons';

interface McpPluginsViewProps {
  connectors: McpConnector[];
  onToggleConnector: (id: string) => void;
  onOpenAiDrawerWithPrompt: (prompt: string) => void;
}

export function McpPluginsView({
  connectors,
  onToggleConnector,
  onOpenAiDrawerWithPrompt,
}: McpPluginsViewProps) {
  const [selectedConnector, setSelectedConnector] = useState<McpConnector | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const connectedList = connectors.filter((c) => c.isConnected);
  const filteredList = connectors.filter(
    (c) => filterCategory === 'All' || c.category === filterCategory
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            Model Context Protocol
          </p>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            MCP Servers & Plugins
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Connect institutional tools and AI agents to work across your university data.
          </p>
        </div>
      </div>

      {/* Connected Active Dock (Notion AI style) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-slate-900/10">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Icons.Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Active Campus Intelligence Context</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            Ask Gemini AI across all connected tools
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your agents currently monitor {connectedList.length} sources to auto-populate notices, assignments, and schedule updates.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {connectedList.map((c) => (
              <span
                key={c.id}
                onClick={() => setSelectedConnector(c)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-medium cursor-pointer transition"
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </span>
            ))}
          </div>
        </div>
        <div className="absolute right-6 -bottom-10 opacity-10 text-9xl select-none pointer-events-none">
          ✦
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Communication', 'Productivity', 'Development', 'Academic LMS'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              filterCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Connectors (ChatGPT style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredList.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shadow-xs">
                  {item.icon}
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    item.isConnected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.isConnected ? '✓ Connected' : 'Available'}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-base">{item.name}</h4>
              <p className="text-[11px] text-slate-400 font-medium">By {item.developer}</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedConnector(item)}
                className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
              >
                Inspect Details ↗
              </button>
              <button
                type="button"
                onClick={() => onToggleConnector(item.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  item.isConnected
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
              >
                {item.isConnected ? 'Disconnect' : '+ Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Inspector Modal (ChatGPT style from Screenshot 5/6) */}
      {selectedConnector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl">
                  {selectedConnector.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">
                    {selectedConnector.name}
                  </h3>
                  <p className="text-xs text-slate-400">By {selectedConnector.developer}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedConnector(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedConnector.description}
            </p>

            {/* Capabilities */}
            <div>
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Capabilities
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {selectedConnector.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium"
                  >
                    ✓ {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Sample AI Prompts (Click to ask AI) */}
            <div>
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Sample AI Prompts (Click to Run)
              </h5>
              <div className="space-y-2">
                {selectedConnector.samplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      onOpenAiDrawerWithPrompt(prompt);
                      setSelectedConnector(null);
                    }}
                    className="w-full text-left p-3 rounded-2xl bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100/80 text-xs text-indigo-900 font-medium transition cursor-pointer flex items-center justify-between group"
                  >
                    <span>&quot;{prompt}&quot;</span>
                    <span className="text-indigo-400 group-hover:text-indigo-700 text-sm">✦</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Connection Toggle Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {selectedConnector.isConnected
                  ? `Account: ${selectedConnector.connectedAccount || 'Active'}`
                  : 'Ready to authenticate with campus OAuth.'}
              </span>
              <button
                type="button"
                onClick={() => onToggleConnector(selectedConnector.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedConnector.isConnected
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
              >
                {selectedConnector.isConnected ? 'Disconnect' : 'Connect Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}