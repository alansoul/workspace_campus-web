// src/features/setup-wizard/ui/StepOrgDetails.tsx
'use client';

import React from 'react';
import { SetupFormData } from '../types/setup.types';

interface StepOrgDetailsProps {
  formData: SetupFormData;
  updateFields: (fields: Partial<SetupFormData>) => void;
  onNext: () => void;
}

const EMPLOYEE_SIZES: Array<SetupFormData['studentBodySize']> = [
  'Just you',
  '2 - 9',
  '10 - 99',
  '100 - 299',
  '300+',
];

const REGIONS = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'Singapore',
];

export function StepOrgDetails({ formData, updateFields, onNext }: StepOrgDetailsProps) {
  const isFormValid = formData.universityName.trim().length > 0 && !!formData.region;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <h1 className="text-3xl sm:text-4xl font-normal text-[#1F1F1F] tracking-tight">
        Let&apos;s get started
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business / University Name Input */}
        <div>
          <input
            type="text"
            required
            autoFocus
            value={formData.universityName}
            onChange={(e) => updateFields({ universityName: e.target.value })}
            placeholder="Business name"
            className="w-full px-4 py-3 rounded-lg border border-[#747775] text-base text-[#1F1F1F] placeholder-[#5F6368] focus:outline-none focus:ring-2 focus:ring-[#0B57D0] focus:border-transparent transition"
          />
        </div>

        {/* Number of Employees / Students Radio Group */}
        <div className="space-y-3 pt-2">
          <label className="block text-sm text-[#444746] font-normal">
            Number of employees, including you
          </label>

          <div className="space-y-3.5">
            {EMPLOYEE_SIZES.map((size) => {
              const isSelected = formData.studentBodySize === size;
              return (
                <label
                  key={size}
                  onClick={() => updateFields({ studentBodySize: size })}
                  className="flex items-center gap-3.5 cursor-pointer select-none group"
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="studentBodySize"
                      checked={isSelected}
                      onChange={() => updateFields({ studentBodySize: size })}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center ${
                        isSelected
                          ? 'border-[#0B57D0]'
                          : 'border-[#747775] group-hover:border-[#1F1F1F]'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0B57D0]" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-[#1F1F1F]">{size}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Region Dropdown */}
        <div className="pt-2">
          <div className="relative border border-[#747775] rounded-lg px-3 pt-1.5 pb-2 focus-within:ring-2 focus-within:ring-[#0B57D0] focus-within:border-transparent transition bg-white">
            <label className="block text-[11px] font-normal text-[#5F6368]">
              Region *
            </label>
            <select
              value={formData.region}
              onChange={(e) => updateFields({ region: e.target.value })}
              className="w-full bg-transparent text-sm text-[#1F1F1F] focus:outline-none cursor-pointer appearance-none pr-8 font-normal"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 bottom-3 pointer-events-none text-slate-600 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Next Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!isFormValid}
            className="px-8 py-2.5 rounded-full bg-[#0B57D0] hover:bg-[#0842A0] text-white font-medium text-sm transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}