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

  // 1. Assignments State (New institutions start clean: [])
  const [assignments, setAssignments] = useState<AssignmentItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storagePrefix}_assignments`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return isCustomUniversity ? [] : INITIAL_ASSIGNMENTS;
  });
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentStatus>('All');

  // 2. Attendance State
  const [attendance, setAttendance] = useState<AttendanceSubject[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storagePrefix}_attendance`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return isCustomUniversity ? [] : INITIAL_ATTENDANCE;
  });

  // 3. Notices State
  const [notices, setNotices] = useState<CampusNotice[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storagePrefix}_notices`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return isCustomUniversity ? [] : INITIAL_NOTICES;
  });

  // 4. Drive Files State
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storagePrefix}_files`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return isCustomUniversity ? [] : INITIAL_FILES;
  });

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

        // Drive Notes: Set database result directly (even if [] for new universities)
        if (backendNotes.status === 'fulfilled') {
          const serverNotes = Array.isArray(backendNotes.value) ? backendNotes.value : [];
          if (isCustomUniversity || serverNotes.length > 0) {
            setDriveFiles(serverNotes);
            if (typeof window !== 'undefined') {
              localStorage.setItem(`${storagePrefix}_files`, JSON.stringify(serverNotes));
            }
          }
        }

        // Notices
        if (backendNotices.status === 'fulfilled') {
          const serverNotices = Array.isArray(backendNotices.value) ? backendNotices.value : [];
          if (isCustomUniversity || serverNotices.length > 0) {
            setNotices(serverNotices);
            if (typeof window !== 'undefined') {
              localStorage.setItem(`${storagePrefix}_notices`, JSON.stringify(serverNotices));
            }
          }
        }

        // Assignments
        if (backendAssignments.status === 'fulfilled') {
          const serverAssignments = Array.isArray(backendAssignments.value) ? backendAssignments.value : [];
          if (isCustomUniversity || serverAssignments.length > 0) {
            setAssignments(serverAssignments);
            if (typeof window !== 'undefined') {
              localStorage.setItem(`${storagePrefix}_assignments`, JSON.stringify(serverAssignments));
            }
          }
        }

        // Attendance
        if (backendAttendance.status === 'fulfilled') {
          const serverAttendance = Array.isArray(backendAttendance.value) ? backendAttendance.value : [];
          if (isCustomUniversity || serverAttendance.length > 0) {
            setAttendance(serverAttendance);
            if (typeof window !== 'undefined') {
              localStorage.setItem(`${storagePrefix}_attendance`, JSON.stringify(serverAttendance));
            }
          }
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
          localStorage.setItem('campus_assignments', JSON.stringify(next));
        }
        return next;
      });

      try {
        await academicsService.updateAssignmentStatus(assignmentId, newStatus);
      } catch {}
    },
    [],
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
          localStorage.setItem('campus_assignments', JSON.stringify(next));
        }
        return next;
      });
    },
    [],
  );

  // Practicals
  const [practicals, setPracticals] = useState<PracticalExperiment[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storagePrefix}_practicals`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return isCustomUniversity ? [] : INITIAL_PRACTICALS;
  });

  const markPracticalComplete = useCallback((id: string) => {
    setPracticals((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p));
      if (typeof window !== 'undefined') {
        localStorage.setItem('campus_practicals', JSON.stringify(next));
      }
      return next;
    });
  }, []);

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
          localStorage.setItem('campus_practicals', JSON.stringify(next));
        }
        return next;
      });
    },
    [],
  );

  // Exams
  const [exams, setExams] = useState<ExamItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storagePrefix}_exams`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return isCustomUniversity ? [] : INITIAL_EXAMS;
  });

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
          localStorage.setItem('campus_exams', JSON.stringify(next));
        }
        return next;
      });
    },
    [],
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
          localStorage.setItem('campus_practicals', JSON.stringify(next));
        }
        return next;
      });
    },
    [],
  );

  const handleDeletePractical = useCallback((id: string) => {
    setPracticals((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('campus_practicals', JSON.stringify(next));
      }
      return next;
    });
  }, []);

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
          localStorage.setItem('campus_exams', JSON.stringify(next));
        }
        return next;
      });
    },
    [],
  );

  const handleDeleteExam = useCallback((id: string) => {
    setExams((prev) => {
      const next = prev.filter((ex) => ex.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('campus_exams', JSON.stringify(next));
      }
      return next;
    });
  }, []);

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

  // Tasks
  const [tasks, setTasks] = useState<AcademicTask[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storagePrefix}_tasks`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return isCustomUniversity ? [] : INITIAL_TASKS;
  });

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
        localStorage.setItem('campus_tasks', JSON.stringify(next));
      }
      return next;
    });
    setNewTaskTitle('');
  };

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== taskId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('campus_tasks', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const toggleTaskCompletion = useCallback((taskId: string) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
      if (typeof window !== 'undefined') {
        localStorage.setItem('campus_tasks', JSON.stringify(next));
      }
      return next;
    });
  }, []);

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
            localStorage.setItem('campus_tasks', JSON.stringify(next));
          }
          return next;
        });
      }
    },
    [handleCreateNotice],
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