'use client';

import React from 'react';
import { Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { AgentStep } from '../../types/ai.types';

interface AgentReasoningViewProps {
  steps: AgentStep[];
  isExpanded: boolean;
  onToggle: () => void;
  isProcessing: boolean;
}

export function AgentReasoningView({
  steps,
  isExpanded,
  onToggle,
  isProcessing,
}: AgentReasoningViewProps) {
  return (
    <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-3.5 text-xs text-slate-700 transition">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between font-semibold text-purple-900"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Agent Reasoning & Tool Calls</span>
          {isProcessing && (
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
          )}
        </div>
        <ChevronRight
          className={`w-4 h-4 text-purple-500 transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-purple-100 space-y-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              {step.status === 'completed' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-purple-600 border-t-transparent animate-spin shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold text-slate-800">{step.agentName}: </span>
                <span className="text-slate-600">{step.action}</span>
                {step.resultSnippet && (
                  <div className="text-[11px] font-mono text-purple-700 bg-purple-100/60 rounded px-2 py-0.5 mt-1 inline-block">
                    {step.resultSnippet}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}