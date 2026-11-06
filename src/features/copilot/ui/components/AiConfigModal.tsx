'use client';

import React, { useState } from 'react';
import {
  X,
  Cpu,
  Key,
  ExternalLink,
  Check,
  Zap,
} from 'lucide-react';

interface AiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotaWarning?: boolean;
}

type AiProvider = 'system' | 'local' | 'huggingface' | 'gemini' | 'groq';

export function AiConfigModal({ isOpen, onClose, quotaWarning }: AiConfigModalProps) {
  const [provider, setProvider] = useState<AiProvider>(() => {
    if (typeof window === 'undefined') return 'system';
    const saved = localStorage.getItem('northstar_ai_provider');
    if (saved === 'local' || saved === 'huggingface' || saved === 'gemini' || saved === 'groq') {
      return saved;
    }
    return 'system';
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('northstar_ai_key') || '';
  });

  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('northstar_ai_provider', provider);
    localStorage.setItem('northstar_ai_key', apiKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Engine & Model Settings</h2>
              <p className="text-xs text-slate-500">Configure free open-source models, local AI, or custom API keys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quota Banner */}
        {quotaWarning && (
          <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Daily Free Quota Exhausted:</span> Switch to <strong>Local AI</strong> (offline) or paste your free Hugging Face / Groq / Gemini key below to continue without rate limits.
          </div>
        )}

        {/* Engine Grid */}
        <div className="mt-5 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Active Engine
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. Local AI */}
            <div
              onClick={() => setProvider('local')}
              className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                provider === 'local'
                  ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Local AI (Ollama)</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Offline
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Connects to localhost:11434. 100% free, runs on device.
              </p>
            </div>

            {/* 2. Hugging Face Serverless */}
            <div
              onClick={() => setProvider('huggingface')}
              className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                provider === 'huggingface'
                  ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Hugging Face</span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                  Open Source
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Meta Llama 3.2 3B via free HF Serverless API.
              </p>
            </div>

            {/* 3. Northstar Cloud */}
            <div
              onClick={() => setProvider('system')}
              className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                provider === 'system'
                  ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Northstar Cloud</span>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                  Shared
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Campus shared cluster with 20 free daily requests.
              </p>
            </div>

            {/* 4. Google Gemini */}
            <div
              onClick={() => setProvider('gemini')}
              className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                provider === 'gemini'
                  ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Google Gemini</span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  BYO Key
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Fast inference via personal Google AI Studio key.
              </p>
            </div>
          </div>
        </div>

        {/* API Key Field */}
        {(provider === 'huggingface' || provider === 'gemini' || provider === 'groq') && (
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">
                {provider === 'huggingface' ? 'Hugging Face Access Token' : provider === 'gemini' ? 'Gemini API Key' : 'Groq API Key'}
              </label>
              <a
                href={
                  provider === 'huggingface'
                    ? 'https://huggingface.co/settings/tokens'
                    : provider === 'gemini'
                    ? 'https://aistudio.google.com/app/apikey'
                    : 'https://console.groq.com/keys'
                }
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-semibold text-purple-600 hover:underline"
              >
                <span>Get free token</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  provider === 'huggingface'
                    ? 'hf_...'
                    : provider === 'gemini'
                    ? 'AIzaSy...'
                    : 'gsk_...'
                }
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-purple-600 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Keys are stored securely in your browser&apos;s localStorage and never logged to external servers.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 transition"
          >
            {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Zap className="w-3.5 h-3.5 text-purple-400" />}
            <span>{saved ? 'Saved' : 'Save & Apply'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}