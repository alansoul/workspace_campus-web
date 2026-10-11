'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export interface StepIntentProps {
  onSelectNew: () => void;
}

export function StepIntent({ onSelectNew }: StepIntentProps) {
  const router = useRouter();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* App Icons Row */}
      <div className="flex items-center gap-3 text-2xl">
        <span>📚</span>
        <span>💼</span>
        <span>💬</span>
        <span>🛡️</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-normal text-[#1F1F1F] tracking-tight">
        Let&apos;s get started
      </h1>

      {/* Option 1: Create New Account (Triggers Step 2) */}
      <div className="p-6 rounded-2xl bg-[#F8FAFD] border border-[#DADCE0] space-y-4">
        <p className="text-sm text-[#444746] leading-relaxed">
          Start fresh with a new account for a{' '}
          <span className="underline decoration-dotted font-medium text-[#1F1F1F]">
            custom email
          </span>{' '}
          like you@yourbusiness.com
        </p>
        <button
          type="button"
          onClick={onSelectNew}
          className="w-full py-2.5 px-6 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-sm transition shadow-xs cursor-pointer"
        >
          Create a new account
        </button>
      </div>

      {/* Option 2: Upgrade Existing Account */}
      <div className="p-6 rounded-2xl bg-white border border-[#DADCE0] space-y-4">
        <p className="text-sm text-[#444746] leading-relaxed">
          Use your existing Gmail for business. Get powerful business features and
          custom email like you@yourbusiness.com, all linked to your current account.
        </p>

        <div className="flex items-center gap-3 pt-1">
          <div className="w-9 h-9 rounded-full bg-[#00897B] text-white flex items-center justify-center font-medium text-sm">
            S
          </div>
          <div>
            <p className="text-sm font-medium text-[#1F1F1F]">Campus Member</p>
            <p className="text-xs text-[#5F6368]">member@gmail.com</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="w-full py-2.5 px-6 rounded-full border border-[#DADCE0] hover:bg-[#F8FAFD] text-[#0B57D0] font-medium text-sm transition cursor-pointer"
        >
          Upgrade this account
        </button>
      </div>
    </div>
  );
}

export default StepIntent;