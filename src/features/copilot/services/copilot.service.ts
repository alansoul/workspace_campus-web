import { CopilotMessage } from '../types/copilot.types';

declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  };
};

export const copilotService = {
  /**
   * Dispatches the query to campus-api (/api/copilot/chat)
   */
  async queryOrchestrator(
    message: string,
    options?: { citations?: boolean; model?: string }
  ): Promise<Partial<CopilotMessage>> {
    const baseUrl =
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
      'https://workspace-campus-api.onrender.com';

    const res = await fetch(`${baseUrl}/api/copilot/chat`, {
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