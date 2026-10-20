// campus-web/src/features/academics/hooks/useAcademicsCoursework.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  AssignmentItem,
  AssignmentStatus,
  PracticalExperiment,
  ExamItem,
  AttendanceSubject,
  CampusNotice,
  AcademicTask,
  DriveFile,
} from '../types/academics.types';
import {
  INITIAL_ASSIGNMENTS,
  INITIAL_PRACTICALS,
  INITIAL_EXAMS,
  INITIAL_ATTENDANCE,
  INITIAL_NOTICES,
  INITIAL_TASKS,
  INITIAL_FILES,
} from '../data/academics.data';
import { academicsService } from '../services/academics.service';

export function useAcademicsCoursework(
  authorName: string = 'Campus User',
  universityId?: string | null,
) {
  // Prefix storage per university so institutions never share cached records
  const storagePrefix = universityId ? `campus_${universityId}` : 'campus_default';
  const isCustomUniversity = Boolean(universityId);

  // Helper to read scoped storage first, falling back to legacy global key so no items are lost
  const getStoredData = useCallback(
    <T>(key: string, fallback: T): T => {
      if (typeof window === 'undefined') return fallback;
      const scoped = localStorage.getItem(`${storagePrefix}_${key}`);
      if (scoped) {
        try {
          return JSON.parse(scoped) as T;
        } catch {}
      }
      const legacy = localStorage.getItem(`campus_${key}`);
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localStorage.setItem(`${storagePrefix}_${key}`, legacy);
            return parsed as unknown as T;
          }
        } catch {}
      }
      return fallback;
    },
    [storagePrefix],
  );

  // 1. Assignments
  const [assignments, setAssignments] = useState<AssignmentItem[]>(() =>
    getStoredData('assignments', isCustomUniversity ? [] : INITIAL_ASSIGNMENTS),
  );
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentStatus>('All');

  // 2. Attendance
  const [attendance, setAttendance] = useState<AttendanceSubject[]>(() =>
    getStoredData('attendance', isCustomUniversity ? [] : INITIAL_ATTENDANCE),
  );

  // 3. Notices
  const [notices, setNotices] = useState<CampusNotice[]>(() =>
    getStoredData('notices', isCustomUniversity ? [] : INITIAL_NOTICES),
  );

  // 4. Drive Files
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>(() =>
    getStoredData('files', isCustomUniversity ? [] : INITIAL_FILES),
  );

  // 5. Practicals
  const [practicals, setPracticals] = useState<PracticalExperiment[]>(() =>
    getStoredData('practicals', isCustomUniversity ? [] : INITIAL_PRACTICALS),
  );

  // 6. Exams
  const [exams, setExams] = useState<ExamItem[]>(() =>
    getStoredData('exams', isCustomUniversity ? [] : INITIAL_EXAMS),
  );

  // 7. Tasks
  const [tasks, setTasks] = useState<AcademicTask[]>(() =>
    getStoredData('tasks', isCustomUniversity ? [] : INITIAL_TASKS),
  );

  // Synchronize state from localStorage whenever storagePrefix resolves or changes (Deferred to prevent cascading render lint error)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      setAssignments(getStoredData('assignments', isCustomUniversity ? [] : INITIAL_ASSIGNMENTS));
      setAttendance(getStoredData('attendance', isCustomUniversity ? [] : INITIAL_ATTENDANCE));
      setNotices(getStoredData('notices', isCustomUniversity ? [] : INITIAL_NOTICES));
      setDriveFiles(getStoredData('files', isCustomUniversity ? [] : INITIAL_FILES));
      setPracticals(getStoredData('practicals', isCustomUniversity ? [] : INITIAL_PRACTICALS));
      setExams(getStoredData('exams', isCustomUniversity ? [] : INITIAL_EXAMS));
      setTasks(getStoredData('tasks', isCustomUniversity ? [] : INITIAL_TASKS));
    }, 0);

    return () => clearTimeout(timer);
  }, [storagePrefix, isCustomUniversity, getStoredData]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // 5. Initial Sync with Live Database (Scoped per institution)
  useEffect(() => {
    let isMounted = true;

    async function hydrateFromDatabase() {
      try {
        const [backendNotices, backendAttendance, backendAssignments, backendNotes] =
          await Promise.allSettled([
            academicsService.getNotices(),
            academicsService.getAttendance(),
            academicsService.getAssignments(),
            academicsService.getNotes(),
          ]);

        if (!isMounted) return;

        // Drive Notes: Only merge if the server actually returned items
        if (backendNotes.status === 'fulfilled' && Array.isArray(backendNotes.value) && backendNotes.value.length > 0) {
          setDriveFiles(backendNotes.value);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`${storagePrefix}_files`, JSON.stringify(backendNotes.value));
          }
        }

        // Notices: Only merge if the server actually returned items
        if (backendNotices.status === 'fulfilled' && Array.isArray(backendNotices.value) && backendNotices.value.length > 0) {
          setNotices(backendNotices.value);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`${storagePrefix}_notices`, JSON.stringify(backendNotices.value));
          }
        }

        // Assignments: Merge without wiping user's locally created items
        if (backendAssignments.status === 'fulfilled' && Array.isArray(backendAssignments.value) && backendAssignments.value.length > 0) {
          setAssignments((prevLocal) => {
            const serverMap = new Map(backendAssignments.value.map((a) => [a.id, a]));
            const merged = [...backendAssignments.value];
            for (const local of prevLocal) {
              if (!serverMap.has(local.id)) {
                merged.push(local);
              }
            }
            if (typeof window !== 'undefined') {
              localStorage.setItem(`${storagePrefix}_assignments`, JSON.stringify(merged));
            }
            return merged;
          });
        }

        // Attendance: Merge without wiping user's attendance records
        if (backendAttendance.status === 'fulfilled' && Array.isArray(backendAttendance.value) && backendAttendance.value.length > 0) {
          setAttendance((prevLocal) => {
            const serverMap = new Map(backendAttendance.value.map((a) => [a.subject.toLowerCase(), a]));
            const merged = [...backendAttendance.value];
            for (const local of prevLocal) {
              if (!serverMap.has(local.subject.toLowerCase())) {
                merged.push(local);
              }
            }
            if (typeof window !== 'undefined') {
              localStorage.setItem(`${storagePrefix}_attendance`, JSON.stringify(merged));
            }
            return merged;
          });
        }
      } catch {}
    }

    hydrateFromDatabase();

    return () => {
      isMounted = false;
    };
  }, [storagePrefix, isCustomUniversity]);

  

  // Coursework Handlers
  const updateAssignmentStatus = useCallback(
    async (assignmentId: string, newStatus: Exclude<AssignmentStatus, 'All'>) => {
      setAssignments((prev) => {
        const next = prev.map((asg) => (asg.id === assignmentId ? { ...asg, status: newStatus } : asg));
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${storagePrefix}_assignments`, JSON.stringify(next));
          localStorage.setItem('campus_assignments', JSON.stringify(next));
        }
        return next;
      });

      try {
        await academicsService.updateAssignmentStatus(assignmentId, newStatus);
      } catch {}
    },
    [storagePrefix, setAssignments],
  );

  const handleCreateAssignment = useCallback(
    (asg: {
      title: string;
      subject: string;
      dueDate: string;
      priority?: 'High' | 'Medium' | 'Low';
      description?: string;
      attachments?: string[];
    }) => {
      const item: AssignmentItem = {
        id: `asg-${Date.now()}`,
        title: asg.title,
        subject: asg.subject,
        status: 'Not Started',
        priority: asg.priority || 'Medium',
        description: asg.description || '',
        faculty: 'Faculty In-Charge',
        issuedDate: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
        dueDate: asg.dueDate,
        relativeDue: `Due on ${asg.dueDate}`,
        attachments: asg.attachments || [],
      };

      setAssignments((prev) => {
        const next = [item, ...prev];
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${storagePrefix}_assignments`, JSON.stringify(next));
          localStorage.setItem('campus_assignments', JSON.stringify(next));
        }
        return next;
      });
    },
    [storagePrefix, setAssignments],
  );

  const markPracticalComplete = useCallback(
    (id: string) => {
      setPracticals((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p));
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${storagePrefix}_practicals`, JSON.stringify(next));
          localStorage.setItem('campus_practicals', JSON.stringify(next));
        }
        return next;
      });
    },
    [storagePrefix, setPracticals],
  );

  const handleCreatePractical = useCallback(
    (newPractical: {
      title: string;
      subject: string;
      labName?: string;
      faculty?: string;
      dueInDaysText?: string;
      tags?: string[];
    }) => {
      const assignedLab = newPractical.labName || 'Lab 1';
      const assignedDue = newPractical.dueInDaysText || 'Due in 3 days';
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const item: PracticalExperiment = {
        id: `prac-${Date.now()}`,
        title: newPractical.title,
        subject: newPractical.subject,
        experimentNumber: 1,
        labRoom: assignedLab,
        labName: assignedLab,
        lab: assignedLab,
        faculty: newPractical.faculty || 'Faculty In-Charge',
        sessionDate: today,
        recordDueDate: assignedDue,
        relativeDue: assignedDue,
        dueInDaysText: assignedDue,
        dueText: assignedDue,
        tags: newPractical.tags || ['Lab Manual'],
        completed: false,
      };

      setPracticals((prev) => {
        const next = [item, ...prev];
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${storagePrefix}_practicals`, JSON.stringify(next));
          localStorage.setItem('campus_practicals', JSON.stringify(next));
        }
        return next;
      });
    },
    [storagePrefix, setPracticals],
  );

  const handleCreateExam = useCallback(
    (exam: {
      title: string;
      subject: string;
      type: ExamItem['type'];
      dateStr: string;
      timeStr: string;
      room: string;
      syllabus: string;
    }) => {
      const item: ExamItem = {
        id: `ex-${Date.now()}`,
        title: exam.title,
        subject: exam.subject,
        type: exam.type,
        dateStr: exam.dateStr,
        timeStr: exam.timeStr,
        room: exam.room,
        syllabus: exam.syllabus,
        relativeNotice: exam.dateStr,
        isNextUp: true,
      };

      setExams((prev) => {
        const next = [item, ...prev];
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${storagePrefix}_exams`, JSON.stringify(next));
          localStorage.setItem('campus_exams', JSON.stringify(next));
        }
        return next;
      });
    },
    [storagePrefix, setExams],
  );

  const handleUpdatePractical = useCallback(
    (
      id: string,
      updated: {
        title: string;
        subject: string;
        labName?: string;
        faculty?: string;
        dueInDaysText?: string;
        tags?: string[];
      },
    ) => {
      setPracticals((prev) => {
        const next = prev.map((p) =>
          p.id === id
            ? {
                ...p,
                title: updated.title,
                subject: updated.subject,
                labName: updated.labName || p.labName,
                labRoom: updated.labName || p.labRoom,
                faculty: updated.faculty || p.faculty,
                dueInDaysText: updated.dueInDaysText || p.dueInDaysText,
                recordDueDate: updated.dueInDaysText || p.recordDueDate,
                tags: updated.tags || p.tags,
              }
            : p,
        );
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${storagePrefix}_practicals`, JSON.stringify(next));
          localStorage.setItem('campus_practicals', JSON.stringify(next));
        }
        return next;
      });
    },
    [storagePrefix, setPracticals],
  );

  const handleDeletePractical = useCallback(
    (id: string) => {
      setPracticals((prev) => {
        const next = prev.filter((p) => p.id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${storagePrefix}_practicals`, JSON.stringify(next));
          localStorage.setItem('campus_practicals', JSON.stringify(next));
        }
        return next;
      });
    },
    [storagePrefix, setPracticals],
  );

  const handleUpdateExam = useCallback(
    (
      id: string,
      updated: {
        title: string;
        subject: string;
        type: ExamItem['type'];
        dateStr: string;
        timeStr: string;
        room: string;
        syllabus: string;
      },
    ) => {
      setExams((prev) => {
        const next = prev.map((ex) => (ex.id === id ? { ...ex, ...updated } : ex));
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${storagePrefix}_exams`, JSON.stringify(next));
          localStorage.setItem('campus_exams', JSON.stringify(next));
        }
        return next;
      });
    },
    [storagePrefix, setExams],
  );

  const handleDeleteExam = useCallback(
    (id: string) => {
      setExams((prev) => {
        const next = prev.filter((ex) => ex.id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${storagePrefix}_exams`, JSON.stringify(next));
          localStorage.setItem('campus_exams', JSON.stringify(next));
        }
        return next;
      });
    },
    [storagePrefix, setExams],
  );

  // Attendance Handlers
  const logAttendance = useCallback(async (subjectName: string, attended: boolean) => {
    setAttendance((prev) => {
      const next = prev.map((att) => {
        if (att.subject.toLowerCase() !== subjectName.toLowerCase()) return att;
        const newTotal = att.totalClasses + 1;
        const newAttended = attended ? att.attended + 1 : att.attended;
        const newMissed = !attended ? att.missed + 1 : att.missed;
        const newPct = Math.round((newAttended / newTotal) * 100);

        return {
          ...att,
          totalClasses: newTotal,
          attended: newAttended,
          missed: newMissed,
          attendancePct: newPct,
          isWarning: newPct < 75,
          statusText:
            newPct < 75
              ? `Warning: ${newPct}% is below the mandatory 75% threshold.`
              : `Current attendance: ${newPct}%. On track.`,
        };
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('campus_attendance', JSON.stringify(next));
      }
      return next;
    });

    try {
      await academicsService.logAttendance(subjectName, attended);
    } catch {}
  }, []);

  const addCustomAttendanceSubject = useCallback(
    async (subjectName: string, total: number = 0, attended: number = 0) => {
      const safeTotal = Math.max(total, 0);
      const safeAttended = Math.min(Math.max(attended, 0), safeTotal);
      const pct = safeTotal > 0 ? Math.round((safeAttended / safeTotal) * 100) : 100;

      const newSub: AttendanceSubject = {
        subject: subjectName,
        totalClasses: safeTotal,
        attended: safeAttended,
        missed: safeTotal - safeAttended,
        attendancePct: pct,
        isWarning: pct < 75,
        statusText: pct < 75 ? 'Below 75% threshold' : 'On track',
      };

      setAttendance((prev) => {
        const next = [...prev.filter((s) => s.subject.toLowerCase() !== subjectName.toLowerCase()), newSub];
        if (typeof window !== 'undefined') {
          localStorage.setItem('campus_attendance', JSON.stringify(next));
        }
        return next;
      });

      try {
        await academicsService.logAttendance(subjectName, safeAttended > 0);
      } catch {}
    },
    [],
  );

  const deleteAttendanceSubject = (subjectName: string) => {
    setAttendance((prev) => {
      const updated = prev.filter((item) => item.subject !== subjectName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('campus_attendance', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Notice Handlers
  const markNoticeAsRead = useCallback((noticeId: string) => {
    setNotices((prev) => {
      const next = prev.map((n) => (n.id === noticeId ? { ...n, isUnread: false } : n));
      if (typeof window !== 'undefined') {
        localStorage.setItem('campus_notices', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const handleCreateNotice = useCallback(
    async (newNotice: {
      title: string;
      category?: string;
      summary: string;
      attachmentName?: string;
      isImportant?: boolean;
    }) => {
      const tempId = `not-${Date.now()}`;
      const noticeItem: CampusNotice = {
        id: tempId,
        title: newNotice.title,
        category: (newNotice.category as CampusNotice['category']) || 'General',
        dateStr: `${new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })} · Added`,
        summary: newNotice.summary,
        attachmentName: newNotice.attachmentName,
        isImportant: Boolean(newNotice.isImportant),
        isUnread: true,
      };

      setNotices((prev) => {
        const next = [noticeItem, ...prev];
        if (typeof window !== 'undefined') {
          localStorage.setItem('campus_notices', JSON.stringify(next));
        }
        return next;
      });

      try {
        const saved = await academicsService.createNotice(newNotice);
        if (saved && saved.id) {
          setNotices((prev) => {
            const next = prev.map((n) => (n.id === tempId ? { ...n, id: saved.id } : n));
            if (typeof window !== 'undefined') {
              localStorage.setItem('campus_notices', JSON.stringify(next));
            }
            return next;
          });
        }
      } catch {}
    },
    [],
  );

  // Drive File Upload Handler (Typed with DriveFile['category'] to accept "Question Papers")
  const handleUploadFile = useCallback(
    async (newFile: {
      title: string;
      subject: string;
      category: DriveFile['category'];
      size: string;
      fileUrl: string;
    }) => {
      const tempId = `file-${Date.now()}`;
      const item: DriveFile = {
        id: tempId,
        name: newFile.title.endsWith('.pdf') ? newFile.title : `${newFile.title}.pdf`,
        subject: newFile.subject,
        category: newFile.category,
        size: newFile.size,
        uploadDate: 'Just now',
        author: authorName,
        isStarred: false,
        fileUrl: newFile.fileUrl,
      };

      setDriveFiles((prev) => {
        const next = [item, ...prev];
        if (typeof window !== 'undefined') {
          localStorage.setItem('campus_files', JSON.stringify(next));
        }
        return next;
      });

      try {
        const saved = await academicsService.uploadNoteMetadata({
          title: newFile.title,
          subject: newFile.subject,
          fileUrl: newFile.fileUrl,
          category: newFile.category,
        });

        if (saved && saved.id) {
          setDriveFiles((prev) => {
            const next = prev.map((f) => (f.id === tempId ? { ...f, id: saved.id } : f));
            if (typeof window !== 'undefined') {
              localStorage.setItem('campus_files', JSON.stringify(next));
            }
            return next;
          });
        }
      } catch {}
    },
    [authorName],
  );

  const toggleStarFile = useCallback((fileId: string) => {
    setDriveFiles((prev) => {
      const next = prev.map((f) => (f.id === fileId ? { ...f, isStarred: !f.isStarred } : f));
      if (typeof window !== 'undefined') {
        localStorage.setItem('campus_files', JSON.stringify(next));
      }
      return next;
    });
  }, []);


  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<AcademicTask['category']>('Personal');
  const [newTaskPriority, setNewTaskPriority] = useState<AcademicTask['priority']>('Medium');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const item: AcademicTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      priority: newTaskPriority,
      dueDateText: 'Due soon',
      completed: false,
    };
    setTasks((prev) => {
      const next = [item, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${storagePrefix}_tasks`, JSON.stringify(next));
        localStorage.setItem('campus_tasks', JSON.stringify(next));
      }
      return next;
    });
    setNewTaskTitle('');
  };

  const deleteTask = useCallback(
    (taskId: string) => {
      setTasks((prev) => {
        const next = prev.filter((t) => t.id !== taskId);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${storagePrefix}_tasks`, JSON.stringify(next));
          localStorage.setItem('campus_tasks', JSON.stringify(next));
        }
        return next;
      });
    },
    [storagePrefix, setTasks],
  );

  const toggleTaskCompletion = useCallback(
    (taskId: string) => {
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${storagePrefix}_tasks`, JSON.stringify(next));
          localStorage.setItem('campus_tasks', JSON.stringify(next));
        }
        return next;
      });
    },
    [storagePrefix, setTasks],
  );

  // WhatsApp Raw Text Ingestion
  const importFromWhatsApp = useCallback(
    (rawText: string, targetType: 'NOTICE' | 'TASK' = 'NOTICE') => {
      if (!rawText.trim()) return;

      const lines = rawText.trim().split('\n').filter((l) => l.trim().length > 0);
      const title = lines[0]?.substring(0, 80) || 'Campus Announcement';
      const summary = lines.slice(1).join(' ') || lines[0] || 'Forwarded announcement';

      if (targetType === 'NOTICE') {
        handleCreateNotice({
          title,
          category: 'Circular',
          summary,
          isImportant: true,
        });
      } else if (targetType === 'TASK') {
        const item: AcademicTask = {
          id: `task-${Date.now()}`,
          title,
          category: 'Assignment',
          priority: 'High',
          dueDateText: 'From WhatsApp',
          completed: false,
        };
        setTasks((prev) => {
          const next = [item, ...prev];
          if (typeof window !== 'undefined') {
            localStorage.setItem(`${storagePrefix}_tasks`, JSON.stringify(next));
            localStorage.setItem('campus_tasks', JSON.stringify(next));
          }
          return next;
        });
      }
    },
    [handleCreateNotice, storagePrefix, setTasks],
  );

  return {
    assignments: assignments.filter((a) => assignmentFilter === 'All' || a.status === assignmentFilter),
    assignmentFilter,
    setAssignmentFilter,
    updateAssignmentStatus,
    handleCreateAssignment,
    practicals,
    markPracticalComplete,
    handleCreatePractical,
    handleUpdatePractical,
    handleDeletePractical,
    exams,
    handleCreateExam,
    handleUpdateExam,
    handleDeleteExam,
    attendance,
    logAttendance,
    addCustomAttendanceSubject,
    deleteAttendanceSubject,
    notices,
    setNotices,
    markNoticeAsRead,
    handleCreateNotice,
    driveFiles,
    toggleStarFile,
    isUploadModalOpen,
    setIsUploadModalOpen,
    handleUploadFile,
    tasks,
    setTasks,
    newTaskTitle,
    setNewTaskTitle,
    newTaskCategory,
    setNewTaskCategory,
    newTaskPriority,
    setNewTaskPriority,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    importFromWhatsApp,
  };
}