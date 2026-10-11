// src/features/setup-wizard/services/setup.service.ts
import { apiClient } from '@/lib/api';
import { SetupFormData } from '../types/setup.types';
import { AuthResponse } from '@/features/auth/types/auth.types';

function generateShortCode(name: string): string {
  const letters = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
  return letters.slice(0, 4) || 'CAMP';
}

export const setupService = {
  // Matches: @Post('request-otp') on @Controller('universities')
  async requestVerificationOtp(email: string, domain: string) {
    return apiClient<{ message: string; devOtp?: string }>('/universities/request-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        domains: [domain.trim().toLowerCase()],
      }),
    });
  },

  // Matches: @Post('claim') on @Controller('universities')
  async claimUniversity(formData: SetupFormData): Promise<AuthResponse> {
    const cleanDomain = formData.universityDomain
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/+$/, '')
      .trim()
      .toLowerCase();

    const shortCode =
      formData.shortCode || generateShortCode(formData.universityName);

    const contactName = `${formData.adminFirstName || 'Admin'} ${formData.adminLastName || 'User'}`.trim();

    return apiClient<AuthResponse>('/universities/claim', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.universityName.trim(),
        shortCode,
        contactName,
        contactEmail: formData.currentEmail.trim().toLowerCase(),
        domains: [cleanDomain],
        otp: formData.otpCode.trim(),
        password: formData.adminPassword,
      }),
    });
  },
};

export default setupService;