// campus-web/src/features/auth/services/auth.service.ts
import { apiClient, apiFetch } from '@/lib/api';
import { AuthResponse, DomainResolution, LoginPayload } from '../types/auth.types';

// Safe fetcher fallback
const request = apiClient || apiFetch;

export const authService = {
  // Resolve university domain (passes both full email and extracted domain)
  async resolveDomain(email: string): Promise<DomainResolution> {
    const cleanEmail = email.trim().toLowerCase();
    const domain = cleanEmail.includes('@')
      ? cleanEmail.split('@')[1] || ''
      : cleanEmail;

    return request<DomainResolution>(
      `/auth/resolve-domain?email=${encodeURIComponent(cleanEmail)}&domain=${encodeURIComponent(domain)}`,
    );
  },

  // Login
  async login(payload: LoginPayload): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Hydrate session from cookie
  async getCurrentSession(): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/me');
  },

  // Logout
  async logout(): Promise<void> {
    await request('/auth/logout', { method: 'POST' });
  },
};

export default authService;