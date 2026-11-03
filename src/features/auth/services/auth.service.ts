// campus-web/src/features/auth/services/auth.service.ts
import { axiosInstance } from '@/lib/api';
import { AuthResponse, DomainResolution, LoginPayload } from '../types/auth.types';

export const authService = {
  // Resolve university domain (passes both full email and extracted domain)
  async resolveDomain(email: string): Promise<DomainResolution> {
    const cleanEmail = email.trim().toLowerCase();
    const domain = cleanEmail.includes('@')
      ? cleanEmail.split('@')[1] || ''
      : cleanEmail;

    const { data } = await axiosInstance.get<DomainResolution>(
      '/auth/resolve-domain',
      {
        params: { email: cleanEmail, domain },
      },
    );
    return data;
  },

  // Login
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>(
      '/auth/login',
      payload,
    );
    return data;
  },

  // Hydrate session from cookie
  async getCurrentSession(): Promise<AuthResponse> {
    const { data } = await axiosInstance.get<AuthResponse>('/auth/me');
    return data;
  },

  // Logout
  async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout');
  },
};

export default authService;