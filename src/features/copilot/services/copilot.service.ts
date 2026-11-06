import { CopilotMessage } from '../types/copilot.types';

export const copilotService = {
  async queryOrchestrator(
    message: string,
    options?: { citations?: boolean; model?: string }
  ): Promise<Partial<CopilotMessage> & { quotaExceeded?: boolean; quotaRemaining?: number }> {
    const provider = (typeof window !== 'undefined' && localStorage.getItem('northstar_ai_provider')) || 'system';
    const userApiKey = (typeof window !== 'undefined' && localStorage.getItem('northstar_ai_key')) || '';
    const authToken =
      (typeof window !== 'undefined' &&
        (localStorage.getItem('token') ||
          localStorage.getItem('authToken') ||
          localStorage.getItem('access_token') ||
          localStorage.getItem('auth_token'))) ||
      '';

    // Fallback directly to the live Render backend
    let rawBase =
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL?.trim()) ||
      'https://workspace-campus-api.onrender.com';

    // Remove trailing slash if present
    rawBase = rawBase.replace(/\/+$/, '');

    // Prevent duplicate /api/api if NEXT_PUBLIC_API_URL already contains /api
    if (rawBase.endsWith('/api')) {
      rawBase = rawBase.slice(0, -4);
    }

    const endpoint = `${rawBase}/api/copilot/chat`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({
        message,
        options: {
          ...options,
          provider,
          userApiKey: userApiKey || undefined,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to query Northstar AI Orchestrator (${res.status})`);
    }

    return res.json();
  },
};