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

export interface ScannedInboxUpdate {
  id: string;
  sourceEmailId: string;
  sender: string;
  subject: string;
  isUnread: boolean;
  receivedAt: string;
  actionType: 'NOTICE' | 'TIMETABLE_UPDATE' | 'EVENT' | 'TASK';
  title: string;
  summary: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  extractedData?: {
    venue?: string;
    room?: string;
    subjectName?: string;
    rescheduledTime?: string;
    dueDate?: string;
  };
}

export interface FullInboxScanResponse {
  scannedCount: number;
  unreadCount: number;
  updates: ScannedInboxUpdate[];
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
   * Gets Google OAuth consent screen URL
   */
  async getGmailConnectUrl(): Promise<{ url: string }> {
    return apiFetch<{ url: string }>('/universities/auth/google-gmail/connect-url', {
      method: 'GET',
    });
  },

  /**
   * Checks if current user has an active Gmail token stored in database
   */
  async getGmailStatus(): Promise<{ connected: boolean; email?: string; connectedAt?: string }> {
    try {
      return await apiFetch<{ connected: boolean; email?: string; connectedAt?: string }>(
        '/universities/auth/google-gmail/status',
        { method: 'GET' },
      );
    } catch {
      return { connected: false };
    }
  },

  /**
   * Triggers deep inbox scan, full Base64 decoding, and Gemini AI multi-entity extraction
   */
  async runFullInboxScan(): Promise<FullInboxScanResponse> {
    return apiFetch<FullInboxScanResponse>('/universities/email-sync/full-scan', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
};