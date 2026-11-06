import { axiosInstance } from '@/lib/api';
import { CopilotMessage } from '../types/copilot.types';

export const copilotService = {
  
  async queryOrchestrator(
    message: string,
    options?: { citations?: boolean; model?: string }
  ): Promise<
    Partial<CopilotMessage> & {
      quotaExceeded?: boolean;
      quotaRemaining?: number;
    }
  > {
    const provider =
      localStorage.getItem('northstar_ai_provider') || 'system';

    const userApiKey =
      localStorage.getItem('northstar_ai_key') || '';

    const response = await axiosInstance.post(
      '/copilot/chat',
      {
        message,
        options: {
          ...options,
          provider,
          userApiKey: userApiKey || undefined,
        },
      }
    );

    return response.data;
  },
};