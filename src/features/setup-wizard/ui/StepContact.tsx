// src/features/setup-wizard/ui/StepContact.tsx
'use client';

import React from 'react';
import { SetupFormData } from '../types/setup.types';

interface StepContactProps {
  formData: SetupFormData;
  updateFields: (fields: Partial<SetupFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepContact({ formData, updateFields, onNext, onBack }: StepContactProps) {
  const isValid =
    formData.adminFirstName.trim().length > 0 &&
    formData.adminLastName.trim().length > 0 &&
    formData.currentEmail.includes('@');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onNext();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-normal text-[#1F1F1F] tracking-tight">
          What&apos;s your contact info?
        </h1>
        <p className="text-xs text-[#5F6368]">
          You&apos;ll be the Northstar Workspace account admin since you&apos;re creating the account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <input
            type="text"
            required
            autoFocus
            value={formData.adminFirstName}
            onChange={(e) => updateFields({ adminFirstName: e.target.value })}
            placeholder="First name"
            className="w-full px-4 py-3 rounded-lg border border-[#747775] text-base text-[#1F1F1F] placeholder-[#5F6368] focus:outline-none focus:ring-2 focus:ring-[#0B57D0] focus:border-transparent"
          />
        </div>

        <div>
          <input
            type="text"
            required
            value={formData.adminLastName}
            onChange={(e) => updateFields({ adminLastName: e.target.value })}
            placeholder="Surname"
            className="w-full px-4 py-3 rounded-lg border border-[#747775] text-base text-[#1F1F1F] placeholder-[#5F6368] focus:outline-none focus:ring-2 focus:ring-[#0B57D0] focus:border-transparent"
          />
        </div>

        <div>
          <input
            type="email"
            required
            value={formData.currentEmail}
            onChange={(e) => updateFields({ currentEmail: e.target.value })}
            placeholder="Current email address"
            className="w-full px-4 py-3 rounded-lg border border-[#747775] text-base text-[#1F1F1F] placeholder-[#5F6368] focus:outline-none focus:ring-2 focus:ring-[#0B57D0] focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-600 transition"
          >
            ←
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="px-8 py-2.5 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-sm transition shadow-xs disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}