'use client';

import React from 'react';
import { Sparkles, Paperclip, ChevronDown, ArrowUp } from 'lucide-react';

interface CopilotPromptBoxProps {
  show: boolean;
  inputPrompt: string;
  setInputPrompt: (v: string) => void;
  typedPlaceholder: string;
  citationsEnabled: boolean;
  setCitationsEnabled: (v: boolean) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function CopilotPromptBox({
  show,
  inputPrompt,
  setInputPrompt,
  typedPlaceholder,
  citationsEnabled,
  setCitationsEnabled,
  onSubmit,
  disabled,
}: CopilotPromptBoxProps) {
  return (
    <div
      className={`w-full bg-white rounded-3xl border border-slate-200/90 shadow-[0_10px_35px_-8px_rgba(15,23,42,0.06)] p-5 mb-10 transition-all duration-700 ease-out focus-within:border-purple-300 focus-within:shadow-[0_14px_45px_-8px_rgba(168,85,247,0.12)] ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-purple-400 mt-1 shrink-0 animate-pulse" />
        <div className="relative w-full">
          <textarea
            rows={3}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
            className="w-full bg-transparent resize-none text-sm text-slate-800 focus:outline-none leading-relaxed z-10 relative"
          />
          {!inputPrompt && (
            <div className="absolute top-0 left-0 text-sm text-slate-400 pointer-events-none select-none flex items-center">
              <span>{typedPlaceholder}</span>
              <span className="w-0.5 h-4 bg-purple-500 ml-0.5 inline-block animate-cursor" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 active:scale-95 transition"
          >
            <Paperclip className="w-3.5 h-3.5 text-slate-400" />
            <span>Attach</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 active:scale-95 transition"
          >
            <span>Writing Styles</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setCitationsEnabled(!citationsEnabled)}
              className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                citationsEnabled ? 'bg-purple-600' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                  citationsEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-xs font-medium text-slate-500">Citation</span>
          </label>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!inputPrompt.trim() || disabled}
            className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs hover:bg-slate-800 active:scale-90 transition-all disabled:opacity-30 disabled:hover:bg-slate-900"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}