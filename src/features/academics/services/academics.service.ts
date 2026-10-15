import { apiFetch } from '@/lib/api';
import type { DriveFile } from '../types/academics.types';

export interface SyncedCampusEmailItem {
  category: 'NOTICE' | 'EVENT' | 'EXAM' | 'TASK';
  title: string;
  summary: string;
  targetBranch?: string;
  targetSemester?: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  dateStr?: string;
  venue?: string;
}

export interface SyncUniversityEmailResponse {
  success: boolean;
  message: string;
  extracted: SyncedCampusEmailItem[];
}

export const academicsService = {
  /**
   * Fetches notes / drive materials from campus-api with fallback
   */
  async getNotes(branch = 'CSE', semester = 3): Promise<DriveFile[]> {
    try {
      const res = await apiFetch<{ data: DriveFile[] }>(
        `/universities/notes?branch=${branch}&semester=${semester}`,
        { method: 'GET' },
      );
      return res.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Dispatches new note metadata to campus-api
   */
  async uploadNoteMetadata(payload: {
    title: string;
    subject: string;
    fileUrl: string;
    branch: string;
    semester: number;
  }) {
    return apiFetch('/universities/notes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Toggle event RSVP
   */
  async toggleEventRSVP(eventId: string, interested: boolean) {
    try {
      return await apiFetch(`/universities/events/${eventId}/interest`, {
        method: 'POST',
        body: JSON.stringify({ interested }),
      });
    } catch {
      return { success: true };
    }
  },

  /**
   * Submit institutional feedback
   */
  async submitFeedback(feedback: string) {
    return apiFetch('/universities/feedback', {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  },

  /**
   * Triggers the University Email MCP Agent sync
   */
  async syncUniversityEmail(): Promise<SyncUniversityEmailResponse> {
    return apiFetch<SyncUniversityEmailResponse>(
      '/universities/email-sync/run',
      {
        method: 'POST',
        body: JSON.stringify({}),
      },
    );
  },
};