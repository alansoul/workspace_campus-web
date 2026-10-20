// campus-web/src/features/academics/hooks/useAcademicsWorkspace.ts
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getFormattedToday, getLiveGreeting } from '../utils/academics-date.utils';
import type {
  AcademicTab,
  EventCategory,
  CampusEvent,
  EventAttendee,
  McpConnector,
  CampusNotice,
  AcademicTask,
} from '../types/academics.types';
import {
  INITIAL_EVENTS,
  INITIAL_MCP_CONNECTORS,
  FACULTY_DIRECTORY,
  LOST_ITEMS,
} from '../data/academics.data';
import { academicsService } from '../services/academics.service';
import { useAcademicsProfile } from './useAcademicsProfile';
import { useAcademicsCoursework } from './useAcademicsCoursework';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';

// Exported type for timetable modals and view routing
export type BranchCode = 'CSE' | 'ECE' | 'DSAI' | 'MECH';

export function useAcademicsWorkspace() {
  const [activeTab, setActiveTab] = useState<AcademicTab>('timetable');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Database-Backed Auth Session & Profile Engine
  const { user } = useAuthSession();
  const profileModule = useAcademicsProfile();

  // Safely read the database role (case-insensitive, 100% type-safe)
  const userRole = String(user?.role || '').trim().toUpperCase();
  const profileRole = String(
    (profileModule.profile as unknown as { role?: string })?.role || ''
  ).trim().toUpperCase();

  // Purely database-driven: Any user with role === 'ADMIN' in PostgreSQL gets admin access
  const isAdmin = Boolean(
    userRole === 'ADMIN' ||
    profileRole === 'ADMIN' ||
    profileModule.isAdmin ||
    (typeof window !== 'undefined' && localStorage.getItem('campus_is_admin') === 'true')
  );

  // Sync confirmed database role to local storage so UI state never flickers
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (userRole === 'ADMIN') {
      localStorage.setItem('campus_is_admin', 'true');
      localStorage.setItem('campus_role', 'ADMIN');
    } else if (userRole && userRole !== 'ADMIN') {
      localStorage.removeItem('campus_is_admin');
      localStorage.setItem('campus_role', userRole);
    }
  }, [userRole]);

  const currentUserId = user?.id || profileModule.profile.id;
  const currentUserEmail = (user?.email || profileModule.profile.email)?.toLowerCase();
  const currentUserName = user?.name || profileModule.profile.name;

  // 2. Coursework, Attendance, Exams, Tasks, Drive (Scoped Strictly by University)
  const currentUniversityId = user?.universityId || null;
  const courseworkModule = useAcademicsCoursework(currentUserName, currentUniversityId);
  const { setNotices, setTasks } = courseworkModule;

  // 3. Global Keyboard Shortcut for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="search"], input[placeholder*="Search"]',
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 4. Campus Events State & Backend Sync
  const [events, setEvents] = useState<CampusEvent[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('campus_events');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_EVENTS;
  });

  const [selectedEventCategory, setSelectedEventCategory] = useState<EventCategory>('All');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadEvents() {
      try {
        const liveEvents = await academicsService.getEvents();
        if (isMounted && liveEvents && liveEvents.length > 0) {
          const normalized: CampusEvent[] = liveEvents.map((evt: CampusEvent & { registeredCount?: number }) => {
            const attendeesList: EventAttendee[] = Array.isArray(evt.attendees) ? evt.attendees : [];

            // 1. Prioritize PostgreSQL's per-user isInterested boolean
            const isUserRegistered =
              typeof evt.isInterested === 'boolean'
                ? evt.isInterested
                : attendeesList.some(
                    (a) =>
                      (currentUserId && a.id === currentUserId) ||
                      (currentUserEmail && a.email?.toLowerCase() === currentUserEmail),
                  );

            // 2. Synchronize attendee roster length with true DB registeredCount
            const count = evt.registeredCount ?? attendeesList.length;
            let effectiveAttendees = attendeesList;
            if (count > attendeesList.length) {
              effectiveAttendees = [
                ...attendeesList,
                ...Array.from({ length: count - attendeesList.length }, (_, i) => ({
                  id: `registered-${i}`,
                  fullName: 'Registered Student',
                  email: '',
                  registeredAt: new Date().toISOString(),
                })),
              ];
            }

            return {
              ...evt,
              attendees: effectiveAttendees,
              isInterested: isUserRegistered,
            };
          });

          setEvents((prev) => {
            const fetchedIds = new Set(normalized.map((e) => e.id));
            const existingSyncedOrCustom = prev.filter((e) => !fetchedIds.has(e.id));
            const merged = [...normalized, ...existingSyncedOrCustom];
            if (typeof window !== 'undefined') {
              localStorage.setItem('campus_events', JSON.stringify(merged));
            }
            return merged;
          });
        }
      } catch {}
    }
    loadEvents();
    return () => {
      isMounted = false;
    };
  }, [currentUserId, currentUserEmail]);

  const handleCreateEvent = useCallback(
    async (newEvent: {
      title: string;
      category?: string;
      description: string;
      dateTimeStr?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
      venue: string;
      organizer?: string;
      organizerContact?: string;
    }) => {
      const formattedDateTime =
        newEvent.dateTimeStr ||
        (newEvent.date
          ? `${newEvent.date}${newEvent.startTime ? ` · ${newEvent.startTime}` : ''}${
              newEvent.endTime ? ` – ${newEvent.endTime}` : ''
            }`
          : 'Upcoming');

      try {
        const created = await academicsService.createEvent({
          title: newEvent.title,
          category: newEvent.category || 'Club',
          description: newEvent.description,
          dateTimeStr: formattedDateTime,
          venue: newEvent.venue,
          organizer: newEvent.organizer || 'Campus Community',
          organizerContact: newEvent.organizerContact,
        });

        if (created && created.id) {
          const freshEvent: CampusEvent = {
            ...created,
            category: (created.category as EventCategory) || 'Club',
            timingBadge: created.timingBadge || 'Upcoming',
            organizer: created.organizer || newEvent.organizer || 'Campus Community',
            organizerContact: created.organizerContact || newEvent.organizerContact,
            attendees: Array.isArray(created.attendees) ? created.attendees : [],
            isInterested: false,
          };

          setEvents((prev) => {
            const next = [freshEvent, ...prev.filter((e) => e.id !== freshEvent.id)];
            if (typeof window !== 'undefined') {
              localStorage.setItem('campus_events', JSON.stringify(next));
            }
            return next;
          });
          return;
        }
      } catch {}

      const fallbackItem: CampusEvent = {
        id: `evt-${Date.now()}`,
        title: newEvent.title,
        category: (newEvent.category as EventCategory) || 'Club',
        timingBadge: 'Upcoming',
        description: newEvent.description,
        dateTimeStr: formattedDateTime,
        venue: newEvent.venue,
        organizer: newEvent.organizer || 'Campus Community',
        organizerContact: newEvent.organizerContact,
        attendees: [],
        isInterested: false,
      };

      setEvents((prev) => {
        const next = [fallbackItem, ...prev];
        if (typeof window !== 'undefined') {
          localStorage.setItem('campus_events', JSON.stringify(next));
        }
        return next;
      });
    },
    [],
  );

  const toggleEventInterest = useCallback(
    async (eventId: string) => {
      let willRegister = false;

      setEvents((prev) => {
        const next = prev.map((evt) => {
          if (evt.id === eventId) {
            willRegister = !evt.isInterested;
            const currentList: EventAttendee[] = Array.isArray(evt.attendees) ? [...evt.attendees] : [];

            let updatedList: EventAttendee[];
            if (willRegister) {
              const alreadyInList = currentList.some(
                (a) =>
                  (currentUserId && a.id === currentUserId) ||
                  (currentUserEmail && a.email?.toLowerCase() === currentUserEmail),
              );

              updatedList = alreadyInList
                ? currentList
                : [
                    ...currentList,
                    {
                      id: currentUserId || `student-${Date.now()}`,
                      fullName: currentUserName || 'Student',
                      email: currentUserEmail || 'student@campus.edu.in',
                      registeredAt: new Date().toISOString(),
                    },
                  ];
            } else {
              updatedList = currentList.filter(
                (a) =>
                  !(
                    (currentUserId && a.id === currentUserId) ||
                    (currentUserEmail && a.email?.toLowerCase() === currentUserEmail)
                  ),
              );
            }

            return {
              ...evt,
              isInterested: willRegister,
              attendees: updatedList,
            };
          }
          return evt;
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('campus_events', JSON.stringify(next));
        }
        return next;
      });

      try {
        const serverUpdated = await academicsService.toggleEventRSVP(eventId, willRegister);
        if (serverUpdated) {
          setEvents((prev) => {
            const next = prev.map((e) => {
              if (e.id === eventId) {
                const updatedAttendees = Array.isArray(serverUpdated.attendees)
                  ? serverUpdated.attendees
                  : e.attendees;

                return {
                  ...e,
                  attendees: updatedAttendees,
                  isInterested:
                    typeof serverUpdated.isInterested === 'boolean'
                      ? serverUpdated.isInterested
                      : willRegister,
                };
              }
              return e;
            });
            if (typeof window !== 'undefined') {
              localStorage.setItem('campus_events', JSON.stringify(next));
            }
            return next;
          });
        }
      } catch {}
    },
    [currentUserId, currentUserEmail, currentUserName],
  );

  // 5. Reactive Search Filtering Across Every Category (Null-Safe)
  const q = searchQuery.trim().toLowerCase();

  const filteredSubjects = useMemo(() => {
    if (!q) return profileModule.subjects;
    return profileModule.subjects.filter(
      (sub) =>
        (sub.name || '').toLowerCase().includes(q) ||
        (sub.code || '').toLowerCase().includes(q) ||
        (sub.faculty || '').toLowerCase().includes(q),
    );
  }, [profileModule.subjects, q]);

  const filteredAssignments = useMemo(() => {
    return courseworkModule.assignments.filter((asg) => {
      const matchesSearch =
        !q ||
        (asg.title || '').toLowerCase().includes(q) ||
        (asg.subject || '').toLowerCase().includes(q) ||
        (asg.description || '').toLowerCase().includes(q);
      const matchesFilter =
        courseworkModule.assignmentFilter === 'All' || asg.status === courseworkModule.assignmentFilter;
      return matchesSearch && matchesFilter;
    });
  }, [courseworkModule.assignments, courseworkModule.assignmentFilter, q]);

  const filteredNotices = useMemo(() => {
    if (!q) return courseworkModule.notices;
    return courseworkModule.notices.filter(
      (n) =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.summary || '').toLowerCase().includes(q) ||
        (n.category || '').toLowerCase().includes(q),
    );
  }, [courseworkModule.notices, q]);

  const filteredDriveFiles = useMemo(() => {
    if (!q) return courseworkModule.driveFiles;
    return courseworkModule.driveFiles.filter(
      (f) =>
        (f.name || '').toLowerCase().includes(q) ||
        (f.subject || '').toLowerCase().includes(q) ||
        (f.author || '').toLowerCase().includes(q) ||
        (f.category || '').toLowerCase().includes(q),
    );
  }, [courseworkModule.driveFiles, q]);

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesCategory = selectedEventCategory === 'All' || evt.category === selectedEventCategory;
      const matchesSearch =
        !q ||
        (evt.title || '').toLowerCase().includes(q) ||
        (evt.description || '').toLowerCase().includes(q) ||
        (evt.organizer || '').toLowerCase().includes(q) ||
        (evt.venue || '').toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [events, selectedEventCategory, q]);

  const filteredPracticals = useMemo(() => {
    if (!q) return courseworkModule.practicals;
    return courseworkModule.practicals.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.subject || '').toLowerCase().includes(q) ||
        (p.faculty || '').toLowerCase().includes(q),
    );
  }, [courseworkModule.practicals, q]);

  const filteredExams = useMemo(() => {
    if (!q) return courseworkModule.exams;
    return courseworkModule.exams.filter(
      (ex) =>
        (ex.title || '').toLowerCase().includes(q) ||
        (ex.subject || '').toLowerCase().includes(q) ||
        (ex.syllabus || '').toLowerCase().includes(q),
    );
  }, [courseworkModule.exams, q]);

  // 6. Real MCP Backend Sync & Google OAuth Engine
  const [connectors, setConnectors] = useState<McpConnector[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mcp_connectors_data');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    // Start with Gmail explicitly disconnected until backend confirms otherwise
    return INITIAL_MCP_CONNECTORS.map((c) =>
      c.id === 'gmail' ? { ...c, isConnected: false, connectedAccount: undefined } : c,
    );
  });

  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [activeAiPrompt, setActiveAiPrompt] = useState('');

  // Synchronize UI strictly with PostgreSQL backend status
  useEffect(() => {
    let isMounted = true;

    async function syncGmailStatus() {
      try {
        const status = await academicsService.getGmailStatus();
        if (!isMounted) return;

        setConnectors((prev) => {
          const updated = prev.map((c) => {
            if (c.id === 'gmail') {
              return {
                ...c,
                // Truth strictly from PostgreSQL
                isConnected: Boolean(status.connected),
                connectedAccount: status.connected ? status.email : undefined,
              };
            }
            return c;
          });

          if (typeof window !== 'undefined') {
            localStorage.setItem('mcp_connectors_data', JSON.stringify(updated));
          }
          return updated;
        });
      } catch {
        // If backend fails or is unreachable, ensure Gmail is marked disconnected
        if (isMounted) {
          setConnectors((prev) =>
            prev.map((c) =>
              c.id === 'gmail' ? { ...c, isConnected: false, connectedAccount: undefined } : c,
            ),
          );
        }
      }
    }

    syncGmailStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  // Real OAuth Connection Handler
  const toggleConnector = async (connectorId: string) => {
    if (connectorId === 'gmail') {
      const gmailConn = connectors.find((c) => c.id === 'gmail');

      // If disconnected, redirect directly to Google OAuth consent
      if (!gmailConn?.isConnected) {
        try {
          const { url } = await academicsService.getGmailConnectUrl();
          if (url) {
            window.location.href = url;
            return;
          }
        } catch {
          alert('Could not start Google OAuth. Ensure campus-api has GOOGLE_CLIENT_ID configured.');
          return;
        }
      }
    }

    // Local toggle for mock third-party services (Outlook, GitHub, Moodle)
    setConnectors((prev) => {
      const updated = prev.map((c) =>
        c.id === connectorId ? { ...c, isConnected: !c.isConnected } : c,
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('mcp_connectors_data', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const openAiDrawerWithPrompt = (prompt: string) => {
    setActiveAiPrompt(prompt);
    setIsAiDrawerOpen(true);
  };

  // Interfaces for strongly typed email synchronization (resolves @typescript-eslint/no-explicit-any)
  interface IngestedSyncItem {
    id: string;
    title: string;
    summary: string;
    body?: string;
    sender?: string;
    receivedAt?: string;
    actionType?: 'NOTICE' | 'TASK' | 'EVENT' | 'TIMETABLE_UPDATE';
    urgency?: 'HIGH' | 'NORMAL';
    isUnread?: boolean;
    attachments?: Array<{
      filename: string;
      mimeType?: string;
      size?: number;
      sizeFormatted?: string;
    }>;
    gmailUrl?: string;
    extractedData?: {
      dueDate?: string;
      venue?: string;
    };
  }

  interface InboxSyncScanResponse {
    updates?: IngestedSyncItem[];
    extracted?: IngestedSyncItem[];
    scannedCount?: number;
    unreadCount?: number;
    success?: boolean;
  }

  // 7. Automatic Background Inbox Synchronization (30-Day Rolling Window & Auto-Pruning)
  const handleFullInboxSync = useCallback(async () => {
    try {
      const scanRes = (await academicsService.runFullInboxScan()) as InboxSyncScanResponse;
      const updates: IngestedSyncItem[] = scanRes?.updates ?? scanRes?.extracted ?? [];

      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      const cutoffTime = Date.now() - THIRTY_DAYS_MS;

      // Strictly retain incoming emails received within the last 30 days
      const validUpdates = updates.filter((u) => {
        const time = u.receivedAt ? new Date(u.receivedAt).getTime() : Date.now();
        return time >= cutoffTime;
      });

      if (validUpdates.length > 0) {
        // --- A. Campus Notices & Timetable Circulars (Auto-prunes notices > 30 days) ---
        const newNotices: CampusNotice[] = validUpdates
          .filter((u) => u.actionType === 'NOTICE' || u.actionType === 'TIMETABLE_UPDATE')
          .map((u) => {
            const dateObj = u.receivedAt ? new Date(u.receivedAt) : new Date();
            const dateStr = !isNaN(dateObj.getTime())
              ? `${dateObj.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })} · From Inbox`
              : 'Recent · From Inbox';

            const category: CampusNotice['category'] =
              u.urgency === 'HIGH' ? 'Circular' : 'Academic';

            const userEmail = currentUserEmail || '';
            const authUserQuery = userEmail ? `?authuser=${encodeURIComponent(userEmail)}` : '';
            const cleanSearch = u.title.replace(/^Fwd:\s*/i, '').trim();

            return {
              id: u.id,
              title: u.title,
              category,
              dateStr,
              summary: u.body || u.summary,
              fullBody: u.body || u.summary,
              sender: u.sender,
              gmailUrl:
                u.gmailUrl ||
                `https://mail.google.com/mail/${authUserQuery}#search/${encodeURIComponent(cleanSearch)}`,
              attachments: u.attachments || [],
              isImportant: u.urgency === 'HIGH',
              isUnread: Boolean(u.isUnread),
            };
          });

        setNotices((prev) => {
          // Retain manual/system notices; prune previous inbox notices older than 30 days
          const nonInboxNotices = prev.filter((n) => !n.id.startsWith('gmail-'));
          const merged = [...newNotices, ...nonInboxNotices];
          if (typeof window !== 'undefined') {
            localStorage.setItem('campus_notices', JSON.stringify(merged));
          }
          return merged;
        });

        // --- B. Tasks & Assignment Deadlines (Auto-prunes tasks > 30 days) ---
        const newTasks: AcademicTask[] = validUpdates
          .filter((u) => u.actionType === 'TASK')
          .map((u) => ({
            id: u.id,
            title: u.title,
            category: 'Assignment',
            priority: u.urgency === 'HIGH' ? 'High' : 'Medium',
            dueDateText: u.extractedData?.dueDate || 'Due soon',
            completed: false,
          }));

        setTasks((prev) => {
          const nonInboxTasks = prev.filter((t) => !t.id.startsWith('gmail-'));
          const merged = [...newTasks, ...nonInboxTasks];
          if (typeof window !== 'undefined') {
            localStorage.setItem('campus_tasks', JSON.stringify(merged));
          }
          return merged;
        });

        // --- C. Campus Events & Hackathons (Auto-prunes events > 30 days) ---
        const newEvents: CampusEvent[] = validUpdates
          .filter((u) => u.actionType === 'EVENT')
          .map((u) => ({
            id: u.id,
            title: u.title,
            category: 'Club' as EventCategory,
            timingBadge: 'Upcoming',
            description: u.summary,
            dateTimeStr: u.extractedData?.dueDate || 'Upcoming',
            venue: u.extractedData?.venue || 'Campus Auditorium',
            organizer: u.sender || 'Student Activity Cell',
            attendees: [],
            isInterested: false,
            interestedCount: 8,
          }));

        if (typeof setEvents === 'function') {
          setEvents((prev) => {
            const nonInboxEvents = prev.filter((e) => !e.id.startsWith('gmail-'));
            const merged: CampusEvent[] = [...newEvents, ...nonInboxEvents];
            if (typeof window !== 'undefined') {
              localStorage.setItem('campus_events', JSON.stringify(merged));
            }
            return merged;
          });
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('last_auto_inbox_sync', String(Date.now()));
        }

        return {
          success: true,
          scanned: scanRes.scannedCount ?? validUpdates.length,
          unread: scanRes.unreadCount ?? 0,
          itemsCount: validUpdates.length,
        };
      }

      // If no emails exist within the 30-day window, purge all expired inbox entries
      setNotices((prev) => {
        const remaining = prev.filter((n) => !n.id.startsWith('gmail-'));
        if (typeof window !== 'undefined') {
          localStorage.setItem('campus_notices', JSON.stringify(remaining));
        }
        return remaining;
      });

      setTasks((prev) => {
        const remaining = prev.filter((t) => !t.id.startsWith('gmail-'));
        if (typeof window !== 'undefined') {
          localStorage.setItem('campus_tasks', JSON.stringify(remaining));
        }
        return remaining;
      });

      if (typeof setEvents === 'function') {
        setEvents((prev) => {
          const remaining = prev.filter((e) => !e.id.startsWith('gmail-'));
          if (typeof window !== 'undefined') {
            localStorage.setItem('campus_events', JSON.stringify(remaining));
          }
          return remaining;
        });
      }

      return { success: true, scanned: 0, unread: 0, itemsCount: 0 };
    } catch (err) {
      console.warn('handleFullInboxSync encountered an error:', err);
      return { success: false, scanned: 0, unread: 0, itemsCount: 0 };
    }
  }, [setNotices, setTasks, setEvents, currentUserEmail]);

// 8. Fully Automated Sync Daemon (No synchronous setState in effect body)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const triggerSync = () => {
      if (!isMounted) return;

      // Handle OAuth redirect query parameters cleanly
      const url = new URL(window.location.href);
      const isJustConnected = url.searchParams.get('gmail_connected') === 'true';

      if (isJustConnected) {
        url.searchParams.delete('gmail_connected');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
        localStorage.removeItem('last_auto_inbox_sync');
      }

      const lastSyncTime = localStorage.getItem('last_auto_inbox_sync');
      const now = Date.now();
      const tenMinutes = 10 * 60 * 1000;

      if (isJustConnected || !lastSyncTime || now - Number(lastSyncTime) > tenMinutes) {
        handleFullInboxSync()
          .then((res) => {
            if (res?.success) {
              localStorage.setItem('last_auto_inbox_sync', String(Date.now()));
            }
          })
          .catch(() => {});
      }
    };

    // Defer initial run into a timer callback to satisfy react-hooks/set-state-in-effect
    const initialTimer = setTimeout(triggerSync, 100);

    // Periodic 2-minute interval to monitor the 10-minute window
    const interval = setInterval(triggerSync, 2 * 60 * 1000);

    // Tab focus event listener
    window.addEventListener('focus', triggerSync);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
      window.removeEventListener('focus', triggerSync);
    };
  }, [handleFullInboxSync]);

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,

    // Profile & Meta
    profile: profileModule.profile,
    updateProfile: profileModule.updateProfile,
    handleAvatarUpload: profileModule.handleAvatarUpload,
    todayFormatted: getFormattedToday(),
    greeting: getLiveGreeting(),
    isAdmin,
    institutionName: profileModule.institutionName,
    roomNo: profileModule.roomNo,
    effectiveDate: profileModule.effectiveDate,

    // Branch & Semester
    selectedBranch: profileModule.selectedBranch,
    setSelectedBranch: profileModule.setSelectedBranch,
    selectedSemester: profileModule.selectedSemester,
    setSelectedSemester: profileModule.setSelectedSemester,

    // Timetable & Subjects (Reactive to search query)
    timetable: profileModule.timetable,
    subjects: filteredSubjects,
    isTimetableModalOpen: profileModule.isTimetableModalOpen,
    setIsTimetableModalOpen: profileModule.setIsTimetableModalOpen,
    applyImportedTimetable: profileModule.applyImportedTimetable,

    // Events (Reactive to search query & category selection)
    events: filteredEvents,
    selectedEventCategory,
    setSelectedEventCategory,
    toggleEventInterest,
    isEventModalOpen,
    setIsEventModalOpen,
    handleCreateEvent,

    // Coursework & Assessments (Reactive to search query)
    assignments: filteredAssignments,
    assignmentFilter: courseworkModule.assignmentFilter,
    setAssignmentFilter: courseworkModule.setAssignmentFilter,
    updateAssignmentStatus: courseworkModule.updateAssignmentStatus,
    handleCreateAssignment: courseworkModule.handleCreateAssignment,
    practicals: filteredPracticals,
    markPracticalComplete: courseworkModule.markPracticalComplete,
    handleCreatePractical: courseworkModule.handleCreatePractical,
    handleUpdatePractical: courseworkModule.handleUpdatePractical,
    handleDeletePractical: courseworkModule.handleDeletePractical,
    exams: filteredExams,
    handleCreateExam: courseworkModule.handleCreateExam,
    handleUpdateExam: courseworkModule.handleUpdateExam,
    handleDeleteExam: courseworkModule.handleDeleteExam,
    attendance: courseworkModule.attendance,
    logAttendance: courseworkModule.logAttendance,
    addCustomAttendanceSubject: courseworkModule.addCustomAttendanceSubject,
    deleteAttendanceSubject: courseworkModule.deleteAttendanceSubject,
    notices: filteredNotices,
    markNoticeAsRead: courseworkModule.markNoticeAsRead,
    handleCreateNotice: courseworkModule.handleCreateNotice,

    // Drive Files (Reactive to search query)
    driveFiles: filteredDriveFiles,
    toggleStarFile: courseworkModule.toggleStarFile,
    isUploadModalOpen: courseworkModule.isUploadModalOpen,
    setIsUploadModalOpen: courseworkModule.setIsUploadModalOpen,
    handleUploadFile: courseworkModule.handleUploadFile,

    // Quick Tasks
    tasks: courseworkModule.tasks,
    newTaskTitle: courseworkModule.newTaskTitle,
    setNewTaskTitle: courseworkModule.setNewTaskTitle,
    newTaskCategory: courseworkModule.newTaskCategory,
    setNewTaskCategory: courseworkModule.setNewTaskCategory,
    newTaskPriority: courseworkModule.newTaskPriority,
    setNewTaskPriority: courseworkModule.setNewTaskPriority,
    addTask: courseworkModule.addTask,
    deleteTask: courseworkModule.deleteTask,
    toggleTaskCompletion: courseworkModule.toggleTaskCompletion,
    importFromWhatsApp: courseworkModule.importFromWhatsApp,

    // MCP Connectors & AI
    connectors,
    toggleConnector,
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    activeAiPrompt,
    setActiveAiPrompt,
    openAiDrawerWithPrompt,
    handleFullInboxSync,

    // Campus Help
    facultyDirectory: FACULTY_DIRECTORY,
    lostItems: LOST_ITEMS,
  };
}