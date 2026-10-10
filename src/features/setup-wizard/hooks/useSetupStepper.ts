// src/features/setup-wizard/hooks/useSetupStepper.ts
'use client';

import { useState } from 'react';
import { SetupFormData, WizardStep } from '../types/setup.types';
import { setupService } from '../services/setup.service';
import { useRouter } from 'next/navigation';

const initialFormData: SetupFormData = {
  accountIntent: 'EXISTING_DOMAIN',
  universityName: '',
  studentBodySize: '100 - 299',
  region: 'India',
  adminFirstName: '',
  adminLastName: '',
  currentEmail: '',
  universityDomain: '',
  otpCode: '',
  adminPassword: '',
};

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return 'An unexpected error occurred. Please try again.';
}

export function useSetupStepper() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [formData, setFormData] = useState<SetupFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const updateFields = (fields: Partial<SetupFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, 5) as WizardStep);
  const prevStep = () =>
    setCurrentStep((prev) => Math.max(prev - 1, 1) as WizardStep);

  const triggerOtpRequest = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await setupService.requestVerificationOtp(
        formData.currentEmail,
        formData.universityDomain
      );
      nextStep();
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalizeClaim = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await setupService.claimUniversity(formData);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    formData,
    isSubmitting,
    error,
    updateFields,
    nextStep,
    prevStep,
    triggerOtpRequest,
    finalizeClaim,
  };
}