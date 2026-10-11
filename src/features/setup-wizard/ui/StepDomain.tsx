// src/features/setup-wizard/ui/StepDomain.tsx
'use client';

import React from 'react';
import { SetupFormData } from '../types/setup.types';

interface StepDomainProps {
  formData: SetupFormData;
  updateFields: (fields: Partial<SetupFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepDomain({ formData, updateFields, onNext, onBack }: StepDomainProps) {
  const isValid = formData.universityDomain.includes('.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onNext();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-normal text-[#1F1F1F] tracking-tight">
          Does your business have a domain?
        </h1>
        <p className="text-xs text-[#5F6368]">
          You&apos;ll need a domain, like example.com, to set up emails and a Northstar Workspace account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <input
            type="text"
            required
            autoFocus
            value={formData.universityDomain}
            onChange={(e) => {
              const clean = e.target.value
                .replace(/^https?:\/\//i, '')
                .replace(/^www\./i, '')
                .replace(/\/+$/, '')
                .trim()
                .toLowerCase();
              updateFields({ universityDomain: clean });
            }}
            placeholder="example.com or university.edu"
            className="w-full px-4 py-3 rounded-lg border border-[#747775] text-base text-[#1F1F1F] placeholder-[#5F6368] focus:outline-none focus:ring-2 focus:ring-[#0B57D0] focus:border-transparent font-mono"
          />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition cursor-pointer"
          >
            ←
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="px-8 py-2.5 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-sm transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}

export default StepDomain;