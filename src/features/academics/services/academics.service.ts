// campus-web/src/features/academics/services/academics.service.ts

import { apiFetch } from '@/lib/api';
import type {
  DriveFile,
  CampusNotice,
  CampusEvent,
  AssignmentItem,
  AttendanceSubject,
  ExamItem,
  DayTimetable,
  PracticalExperiment,
} from '../types/academics.types';

export interface TimetableSyncResponse {
  schedule: DayTimetable[];
  roomNo?: string;
  effectiveDate?: string;
}

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

// Backend Response Interfaces for Drive Notes
interface BackendNoteAuthor {
  fullName?: string;
}

interface BackendNoteItem {
  id: string;
  title: string;
  subject?: string;
  category?: string;
  fileSize?: string;
  fileUrl?: string;
  isStarred?: boolean;
  createdAt?: string;
  author?: BackendNoteAuthor;
}

interface BackendNoteListResponse {
  data?: BackendNoteItem[];
}

export const academicsService = {
  // 1. Campus Notices & WhatsApp Ingestion
  async getNotices(): Promise<CampusNotice[]> {
    try {
      const res = await apiFetch<CampusNotice[] | { data: CampusNotice[] }>(
        '/universities/notices',
        { method: 'GET' },
      );
      if (Array.isArray(res)) return res;
      if (res && 'data' in res && Array.isArray(res.data)) return res.data;
      return [];
    } catch {
      return [];
    }
  },

  async createNotice(payload: {
    title: string;
    category?: string;
    summary: string;
    isImportant?: boolean;
    attachmentName?: string;
  }): Promise<CampusNotice> {
    return apiFetch<CampusNotice>('/universities/notices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 2. Attendance Tracking
  async getAttendance(): Promise<AttendanceSubject[]> {
    try {
      const res = await apiFetch<AttendanceSubject[] | { data: AttendanceSubject[] }>(
        '/universities/attendance',
        { method: 'GET' },
      );
      if (Array.isArray(res)) return res;
      if (res && 'data' in res && Array.isArray(res.data)) return res.data;
      return [];
    } catch {
      return [];
    }
  },

  async deleteAttendance(subjectName: string): Promise<void> {
    try {
      await apiFetch(`/universities/attendance/${encodeURIComponent(subjectName)}`, {
        method: 'DELETE',
      });
    } catch {}
  },

  async updateAssignmentStatus(id: string, status: string): Promise<void> {
    await apiFetch(`/universities/assignments/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async logAttendance(
    subjectName: string,
    attended: boolean,
  ): Promise<AttendanceSubject> {
    return apiFetch<AttendanceSubject>('/universities/attendance/log', {
      method: 'POST',
      body: JSON.stringify({ subjectName, attended }),
    });
  },

  // 3. Coursework & Assignments
  async getAssignments(): Promise<AssignmentItem[]> {
    try {
      const res = await apiFetch<AssignmentItem[] | { data: AssignmentItem[] }>(
        '/universities/assignments',
        { method: 'GET' },
      );
      if (Array.isArray(res)) return res;
      if (res && 'data' in res && Array.isArray(res.data)) return res.data;
      return [];
    } catch {
      return [];
    }
  },

  // 4. Campus Events
  async getEvents(): Promise<CampusEvent[]> {
    try {
      const res = await apiFetch<CampusEvent[] | { data: CampusEvent[] }>(
        '/universities/events',
        { method: 'GET' },
      );
      if (Array.isArray(res)) return res;
      if (res && 'data' in res && Array.isArray(res.data)) return res.data;
      return [];
    } catch {
      return [];
    }
  },

  async createEvent(payload: {
    title: string;
    category?: string;
    description: string;
    dateTimeStr: string;
    venue: string;
    organizer?: string;
    organizerContact?: string;
  }): Promise<CampusEvent> {
    return apiFetch<CampusEvent>('/universities/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async toggleEventRSVP(eventId: string, interested: boolean): Promise<CampusEvent | null> {
    try {
      return await apiFetch<CampusEvent>(`/universities/events/${encodeURIComponent(eventId)}/interest`, {
        method: 'POST',
        body: JSON.stringify({ interested }),
      });
    } catch {
      return null;
    }
  },

  // 5. Exam Schedules
  async getExams(): Promise<ExamItem[]> {
    try {
      const res = await apiFetch<ExamItem[] | { data: ExamItem[] }>(
        '/universities/exams',
        { method: 'GET' },
      );
      if (Array.isArray(res)) return res;
      if (res && 'data' in res && Array.isArray(res.data)) return res.data;
      return [];
    } catch {
      return [];
    }
  },

  async createExam(payload: Partial<ExamItem>): Promise<ExamItem | null> {
    try {
      return await apiFetch<ExamItem>('/universities/exams', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      return null;
    }
  },

  // Practicals
  async getPracticals(): Promise<PracticalExperiment[]> {
    try {
      const res = await apiFetch<PracticalExperiment[] | { data: PracticalExperiment[] }>(
        '/universities/practicals',
        { method: 'GET' },
      );
      if (Array.isArray(res)) return res;
      if (res && 'data' in res && Array.isArray(res.data)) return res.data;
      return [];
    } catch {
      return [];
    }
  },

  async createPractical(payload: Partial<PracticalExperiment>): Promise<PracticalExperiment | null> {
    try {
      return await apiFetch<PracticalExperiment>('/universities/practicals', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      return null;
    }
  },

  async togglePracticalComplete(id: string, completed: boolean): Promise<void> {
    try {
      await apiFetch(`/universities/practicals/${encodeURIComponent(id)}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ completed }),
      });
    } catch {}
  },

  // 6. Drive & Lecture Materials (Strongly Typed, No Any)
  async getNotes(branch = 'CSE', semester = 1): Promise<DriveFile[]> {
    try {
      const params = new URLSearchParams({
        branch: String(branch || 'CSE'),
        semester: String(semester ?? 1),
      });

      const res = await apiFetch<BackendNoteItem[] | BackendNoteListResponse>(
        `/universities/notes?${params.toString()}`,
        { method: 'GET' },
      );

      const rawItems: BackendNoteItem[] = Array.isArray(res)
        ? res
        : res && 'data' in res && Array.isArray(res.data)
          ? res.data
          : [];

      return rawItems.map((note) => ({
        id: note.id,
        name: note.title.endsWith('.pdf') ? note.title : `${note.title}.pdf`,
        subject: note.subject || 'General',
        category: (note.category as DriveFile['category']) || 'Notes',
        size: note.fileSize || '2.4 MB',
        uploadDate: note.createdAt
          ? new Date(note.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
          : 'Recently',
        author: note.author?.fullName || 'Faculty In-Charge',
        isStarred: Boolean(note.isStarred),
        fileUrl: note.fileUrl || '#',
      }));
    } catch {
      return [];
    }
  },

  async uploadNoteMetadata(payload: {
    title: string;
    subject: string;
    fileUrl: string;
    category?: string;
    branch?: string;
    semester?: number;
  }): Promise<DriveFile | null> {
    try {
      const saved = await apiFetch<BackendNoteItem>('/universities/notes', {
        method: 'POST',
        body: JSON.stringify({
          title: payload.title,
          subject: payload.subject,
          fileUrl: payload.fileUrl,
          branch: payload.branch || 'CSE',
          semester: Number(payload.semester) || 1,
        }),
      });

      return {
        id: saved.id,
        name: saved.title.endsWith('.pdf') ? saved.title : `${saved.title}.pdf`,
        subject: saved.subject || payload.subject,
        category: (payload.category as DriveFile['category']) || 'Notes',
        size: saved.fileSize || '1.8 MB',
        uploadDate: 'Just now',
        author: saved.author?.fullName || 'You',
        isStarred: Boolean(saved.isStarred),
        fileUrl: saved.fileUrl || payload.fileUrl,
      };
    } catch {
      return null;
    }
  },

  // 7. Feedback
  async submitFeedback(feedback: string): Promise<{ success: boolean; message?: string }> {
    return apiFetch<{ success: boolean; message?: string }>('/universities/feedback', {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  },

  // 8. Gmail Sync & Integration Status
  async getGmailConnectUrl(): Promise<{ url: string }> {
    return apiFetch<{ url: string }>('/universities/auth/google-gmail/connect-url', {
      method: 'GET',
    });
  },

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

  async runFullInboxScan(): Promise<FullInboxScanResponse> {
    try {
      return await apiFetch<FullInboxScanResponse>('/universities/email-sync/run', {
        method: 'POST',
        body: JSON.stringify({}),
      });
    } catch {
      return {
        scannedCount: 0,
        unreadCount: 0,
        updates: [],
      };
    }
  },

  // 9. Timetable Sync
  async getTimetable(
    branch: string,
    semester: number,
    universityId?: string | null,
  ): Promise<TimetableSyncResponse | null> {
    try {
      const params = new URLSearchParams({
        branch: String(branch || 'CSE'),
        semester: String(semester ?? 1),
      });

      if (universityId) {
        params.set('universityId', String(universityId));
      }

      return await apiFetch<TimetableSyncResponse>(
        `/universities/timetable?${params.toString()}`,
        { method: 'GET' },
      );
    } catch {
      return null;
    }
  },

  async saveTimetable(payload: {
    branch: string;
    semester: number;
    schedule: DayTimetable[];
    roomNo?: string;
    effectiveDate?: string;
    universityId?: string | null;
  }): Promise<{ success: boolean }> {
    return apiFetch<{ success: boolean }>('/universities/timetable', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};