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

    const baseUrl =
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
      'https://workspace-campus-api.onrender.com';

    const res = await fetch(`${baseUrl}/api/copilot/chat`, {
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