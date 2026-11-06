import { CopilotMessage } from '../types/ai.types';

export const aiService = {
  /**
   * Dispatches the query to campus-api (/api/ai/chat)
   */
  async queryOrchestrator(
    message: string,
    options?: { citations?: boolean; model?: string }
  ): Promise<Partial<CopilotMessage>> {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || 'https://workspace-campus-api.onrender.com';

    const res = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ message, options }),
    });

    if (!res.ok) {
      throw new Error('Failed to query Northstar AI Orchestrator');
    }

    return res.json();
  },
};