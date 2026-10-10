// src/features/setup-wizard/services/setup.service.ts
import { apiClient } from '@/lib/api';
import { SetupFormData } from '../types/setup.types';
import { AuthResponse } from '@/features/auth/types/auth.types';

export interface OtpRequestResponse {
  success: boolean;
  message: string;
}

export interface DomainCheckResponse {
  available: boolean;
  message?: string;
}

export const setupService = {
  // Check if apex domain (e.g. stanford.edu) is already claimed
  async checkDomain(domain: string): Promise<DomainCheckResponse> {
    return apiClient<DomainCheckResponse>(
      `/setup/check-domain?domain=${encodeURIComponent(domain)}`
    );
  },

  // Sends an OTP to the official institutional email address
  async requestVerificationOtp(
    email: string,
    domain: string
  ): Promise<OtpRequestResponse> {
    return apiClient<OtpRequestResponse>('/setup/request-otp', {
      method: 'POST',
      body: JSON.stringify({ email, domain }),
    });
  },

  // Final step: Registers university, sets admin password, creates session
  async claimUniversity(formData: SetupFormData): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/setup/claim-university', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  },
};