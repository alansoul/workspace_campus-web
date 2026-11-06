'use client';

import React from 'react';

interface CopilotOrbProps {
  show: boolean;
}

export function CopilotOrb({ show }: CopilotOrbProps) {
  return (
    <div
      className={`flex flex-col items-center mb-6 transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) ${
        show ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'
      }`}
    >
      <div className="animate-orb-float relative cursor-pointer group">
        <div
          className="w-16 h-16 rounded-full shadow-[0_16px_50px_rgba(168,85,247,0.45)] group-hover:scale-105 transition-transform duration-300"
          style={{
            background:
              'radial-gradient(circle at 32% 28%, #FFFFFF 0%, #E9D5FF 20%, #C084FC 45%, #9333EA 75%, #581C87 100%)',
          }}
        />
        <div className="absolute -inset-2 rounded-full bg-purple-500/20 blur-lg -z-10 animate-pulse" />
      </div>
      <div className="w-12 h-2.5 rounded-[100%] bg-purple-900/30 blur-[3px] mt-2 animate-shadow-pulse" />
    </div>
  );
}