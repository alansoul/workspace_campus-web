// src/features/setup-wizard/ui/SetupWizard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SetupFormData, WizardStep } from '../types/setup.types';
import { setupService } from '../services/setup.service';
import { StepIntent } from './StepIntent';
import { StepOrgDetails } from './StepOrgDetails';
import { StepContact } from './StepContact';
import { StepDomain } from './StepDomain';
import { StepVerify } from './StepVerify';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';

const INITIAL_FORM: SetupFormData = {
  accountIntent: 'NEW_DOMAIN',
  universityName: '',
  shortCode: '',
  studentBodySize: '100 - 299',
  region: 'India',
  adminFirstName: '',
  adminLastName: '',
  currentEmail: '',
  universityDomain: '',
  otpCode: '',
  adminPassword: '',
};

export function SetupWizard() {
  const router = useRouter();
  const { refreshSession } = useAuthSession();
  const [step, setStep] = useState<WizardStep>(1);
  const [formData, setFormData] = useState<SetupFormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore draft from sessionStorage asynchronously
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('workspace_setup_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setFormData((prev) => ({ ...prev, ...parsed }));
        }, 0);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const updateFields = (fields: Partial<SetupFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...fields };
      try {
        sessionStorage.setItem('workspace_setup_draft', JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  };

  // Final step: Persist to database using fresh payload overrides
  const handleFinalSubmit = async (overrides?: Partial<SetupFormData>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = { ...formData, ...overrides };
      await setupService.claimUniversity(payload);
      sessionStorage.removeItem('workspace_setup_draft');

      // 1. Re-hydrate active session in React context
      await refreshSession();

      // 2. Next.js compliant client-side navigation (No window.location.href warning)
      router.replace('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to provision university workspace. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 px-6 sm:px-10 py-3.5 flex items-center justify-between">
        <Link href="/" className="text-xl tracking-tight text-slate-800">
          <span className="font-semibold text-slate-900">Northstar</span>{' '}
          <span className="font-normal text-slate-600">Workspace</span>
        </Link>
        <div className="w-8 h-8 rounded-full bg-[#00897B] text-white flex items-center justify-center font-medium text-xs">
          S
        </div>
      </header>

      {/* Green Promo Banner */}
      <div className="bg-[#E6F4EA] border-b border-[#CEEAD6] px-6 sm:px-10 py-2.5 text-xs text-[#137333] flex items-center gap-2">
        <span className="font-bold text-[10px] bg-[#137333] text-white px-1.5 py-0.5 rounded">NEW</span>
        <span><strong>Get professional email and tools at 50% off.</strong> Limited-time offer</span>
      </div>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Active Step Form */}
        <div className="lg:col-span-6">
          {step === 1 && (
            <StepIntent
              onSelectNew={() => {
                updateFields({ accountIntent: 'NEW_DOMAIN' });
                setStep(2);
              }}
            />
          )}

          {step === 2 && (
            <StepOrgDetails
              formData={formData}
              updateFields={updateFields}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <StepContact
              formData={formData}
              updateFields={updateFields}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <StepDomain
              formData={formData}
              updateFields={updateFields}
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
            />
          )}

          {step === 5 && (
            <StepVerify
              formData={formData}
              updateFields={updateFields}
              onSubmit={handleFinalSubmit}
              onBack={() => setStep(4)}
              isSubmitting={isSubmitting}
              error={error}
            />
          )}
        </div>

        {/* Right Column: AI Productivity Card */}
        <div className="lg:col-span-6 flex flex-col items-center text-center pt-4">
          <div className="w-full max-w-md relative">
            <div className="text-3xl mb-4 text-[#7C4DFF] flex justify-center">✦</div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8EAED] shadow-lg space-y-4 text-left">
              <p className="text-sm font-medium text-[#7C4DFF]">How can I help you?</p>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFD] border border-[#E8EAED]">
                <span className="text-xs text-[#5F6368]">Help me create a marketing campaign</span>
                <span className="text-[#0B57D0] text-sm">➤</span>
              </div>
              <div className="flex items-center gap-3 pt-2 text-[#5F6368] text-sm">
                <span>🖼️</span>
                <span>📄</span>
                <span>💡</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <h2 className="text-2xl font-normal text-[#1F1F1F]">
                Jump-start your productivity with AI
              </h2>
              <p className="text-xs sm:text-sm text-[#5F6368] leading-relaxed max-w-sm mx-auto">
                Northstar Workspace plans now include access to Gemini features and the Gemini app, letting you unlock the power of AI for everyday tasks.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SetupWizard;