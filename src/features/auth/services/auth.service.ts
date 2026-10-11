// src/features/auth/services/auth.service.ts
import { apiClient, apiFetch } from '@/lib/api';
import { AuthResponse, DomainResolution, LoginPayload } from '../types/auth.types';

// Safe fetcher fallback
const request = apiClient || apiFetch;

export const authService = {
  // Resolve university domain
  async resolveDomain(email: string): Promise<DomainResolution> {
    const domain = email.split('@')[1] || '';
    return request<DomainResolution>(`/auth/resolve-domain?domain=${encodeURIComponent(domain)}`);
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