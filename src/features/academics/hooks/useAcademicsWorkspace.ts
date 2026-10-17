'use client';

import { useState, useEffect } from 'react';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { getFormattedToday, getLiveGreeting, getDayName } from '../utils/academics-date.utils';
import type {
  AcademicTab,
  EventCategory,
  AssignmentStatus,
  StudentProfile,
  CampusEvent,
  AcademicTask,
  DriveFile,
  PracticalExperiment,
  DayTimetable,
  SubjectItem,
  McpConnector,
  CampusNotice,
} from '../types/academics.types';
import {
  INITIAL_STUDENT_PROFILE,
  INITIAL_EVENTS,
  INITIAL_FILES,
  INITIAL_ASSIGNMENTS,
  INITIAL_PRACTICALS,
  INITIAL_EXAMS,
  INITIAL_ATTENDANCE,
  INITIAL_NOTICES,
  INITIAL_TASKS,
  FACULTY_DIRECTORY,
  LOST_ITEMS,
  CAMPUS_TIMETABLES_REGISTRY,
  INITIAL_MCP_CONNECTORS,
} from '../data/academics.data';
import { academicsService } from '../services/academics.service';

export type BranchCode = 'CSE' | 'ECE' | 'DSAI' | 'MECH';

interface CustomTimetablePayload {
  institution: string;
  branch: BranchCode;
  semester: number;
  roomNo: string;
  effectiveDate: string;
  timetable: DayTimetable[];
  subjects: SubjectItem[];
}

export function useAcademicsWorkspace() {
  const { user } = useAuthSession();
  const [activeTab, setActiveTab] = useState<AcademicTab>('timetable');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Dynamic Branch & Semester
  const [selectedBranch, setSelectedBranch] = useState<BranchCode>('CSE');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);

  // 2. Designated Master Admins & Role Detection
  const DESIGNATED_ADMIN_EMAILS = [
    'alansoul1796@gmail.com',
    'admin@iiitnr.edu.in',
  ];

  const isAdmin = Boolean(
    user?.role === 'ADMIN' ||
    (user?.email && DESIGNATED_ADMIN_EMAILS.includes(user.email.toLowerCase()))
  );

  // 3. Custom Uploaded Timetable Override
  const [customTimetable, setCustomTimetable] = useState<CustomTimetablePayload | null>(null);

  // 4. Derived State: Active schedule
  const activeKey = `${selectedBranch}_${selectedSemester}`;
  const defaultRegistry = CAMPUS_TIMETABLES_REGISTRY[activeKey] || CAMPUS_TIMETABLES_REGISTRY.CSE_1;

  const activeConfig =
    customTimetable &&
    customTimetable.branch === selectedBranch &&
    customTimetable.semester === selectedSemester
      ? customTimetable
      : defaultRegistry;

  const institutionName = activeConfig.institution;
  const roomNo = activeConfig.roomNo;
  const effectiveDate = activeConfig.effectiveDate;
  const timetableMatrix = activeConfig.timetable;
  const subjects = activeConfig.subjects;

  // 5. Stateful & Editable Student Profile with LocalStorage Cache
  const [profileState, setProfileState] = useState<StudentProfile>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('user_profile_data');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
    }
    const resolvedName = user?.name || (isAdmin ? 'Alan Soul' : 'Rohan Singh Bhandari');
    return {
      ...INITIAL_STUDENT_PROFILE,
      name: resolvedName,
      avatarText: resolvedName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      email: user?.email || (isAdmin ? 'alansoul1796@gmail.com' : 'rohan26100@iiitnr.edu.in'),
      collegeName: institutionName,
      semester: selectedSemester,
      branch: `B.Tech · ${selectedBranch}`,
      bio: 'Software engineer & student researcher. Exploring systems, distributed computing and compilers.',
      phone: '+91 98765 43210',
      batch: '2026 – 2030',
      cgpa: '8.92',
      skills: ['C / C++', 'Verilog', 'TypeScript', 'Linux', 'Python', 'Data Structures'],
      githubUrl: 'https://github.com/alansoul',
      linkedinUrl: 'https://linkedin.com/in/alansoul',
    };
  });

  const profile: StudentProfile = {
    ...profileState,
    collegeName: institutionName,
    semester: selectedSemester,
    branch: `B.Tech · ${selectedBranch}`,
  };

  const updateProfile = (updatedData: Partial<StudentProfile>) => {
    setProfileState((prev) => {
      const next = {
        ...prev,
        ...updatedData,
        avatarText: updatedData.name
          ? updatedData.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()
          : prev.avatarText,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_profile_data', JSON.stringify(next));
      }
      return next;
    });

    if (updatedData.branch) {
      const cleanBranch = updatedData.branch.replace('B.Tech · ', '') as BranchCode;
      if (['CSE', 'ECE', 'DSAI', 'MECH'].includes(cleanBranch)) {
        setSelectedBranch(cleanBranch);
      }
    }
    if (updatedData.semester && typeof updatedData.semester === 'number') {
      setSelectedSemester(updatedData.semester);
    }
  };

  const handleAvatarUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      updateProfile({ avatarUrl: base64Url });
    };
    reader.readAsDataURL(file);
  };

  // 6. MCP Connectors State
  const [connectors, setConnectors] = useState<McpConnector[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mcp_connectors_data');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_MCP_CONNECTORS;
  });

  // Auto-verify Gmail Connection from Database / OAuth Redirect
  useEffect(() => {
    async function checkGmailStatus() {
      const isRedirected =
        typeof window !== 'undefined' &&
        window.location.search.includes('gmail_connected');

      const status = await academicsService.getGmailStatus();

      if (status.connected || isRedirected) {
        setConnectors((prev) => {
          const updated = prev.map((c) =>
            c.id === 'gmail'
              ? {
                  ...c,
                  isConnected: true,
                  connectedAccount: status.email || 'rohan26100@iiitnr.edu.in',
                }
              : c,
          );
          if (typeof window !== 'undefined') {
            localStorage.setItem('mcp_connectors_data', JSON.stringify(updated));
          }
          return updated;
        });
      }
    }

    checkGmailStatus();
  }, []);

  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [activeAiPrompt, setActiveAiPrompt] = useState('');

  const toggleConnector = (connectorId: string) => {
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

  // 7. Persistent State for Events, Drive, Tasks, Notices
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

  const [driveFiles, setDriveFiles] = useState<DriveFile[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('campus_files');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_FILES;
  });

  const [tasks, setTasks] = useState<AcademicTask[]>(INITIAL_TASKS);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentStatus>('All');
  const [practicals, setPracticals] = useState<PracticalExperiment[]>(INITIAL_PRACTICALS);
  const [selectedEventCategory, setSelectedEventCategory] = useState<EventCategory>('All');
  const [notices, setNotices] = useState<CampusNotice[]>(INITIAL_NOTICES);

  // Modals Visibility
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);

  // Quick Task Inputs
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<AcademicTask['category']>('Personal');
  const [newTaskPriority, setNewTaskPriority] = useState<AcademicTask['priority']>('Medium');

  // Timetable with live "Today" highlight
  const currentDay = getDayName();
  const timetable = timetableMatrix.map((d) => ({
    ...d,
    isToday: d.day.toLowerCase() === currentDay.toLowerCase(),
    slots: d.slots.map((s) => ({
      ...s,
      isToday: d.day.toLowerCase() === currentDay.toLowerCase(),
    })),
  }));

  const applyImportedTimetable = (data: CustomTimetablePayload) => {
    setSelectedBranch(data.branch);
    setSelectedSemester(data.semester);
    setCustomTimetable(data);
  };

  // Live Deep Sync Handler: Ingests Real Decoded Emails & Updates Full UI
  const handleFullInboxSync = async (): Promise<{
    success: boolean;
    scanned: number;
    unread: number;
    itemsCount: number;
  }> => {
    try {
      const res = await academicsService.runFullInboxScan();

      if (res.updates && res.updates.length > 0) {
        // 1. Ingest Notices
        const newNotices: CampusNotice[] = res.updates
          .filter((u) => u.actionType === 'NOTICE' || u.actionType === 'TIMETABLE_UPDATE')
          .map((u) => ({
            id: u.id,
            title: u.title,
            category: 'Academic',
            dateStr:
              new Date(u.receivedAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              }) + ' · From Inbox',
            summary: u.summary,
            isImportant: u.urgency === 'HIGH',
            isUnread: u.isUnread,
          }));

        if (newNotices.length > 0) {
          setNotices((prev) => [...newNotices, ...prev]);
        }

        // 2. Ingest Tasks
        const newTasks: AcademicTask[] = res.updates
          .filter((u) => u.actionType === 'TASK')
          .map((u) => ({
            id: u.id,
            title: u.title,
            category: 'Assignment',
            priority: u.urgency === 'HIGH' ? 'High' : 'Medium',
            dueDateText: u.extractedData?.dueDate || 'Due soon',
            completed: false,
          }));

        if (newTasks.length > 0) {
          setTasks((prev) => [...newTasks, ...prev]);
        }

        // 3. Ingest Events
        const newEvents: CampusEvent[] = res.updates
          .filter((u) => u.actionType === 'EVENT')
          .map((u) => ({
            id: u.id,
            title: u.title,
            category: 'Club',
            timingBadge: 'From Inbox',
            description: u.summary,
            dateTimeStr: u.extractedData?.dateStr || 'Upcoming',
            venue: u.extractedData?.venue || 'Campus',
            isInterested: false,
          }));

        if (newEvents.length > 0) {
          setEvents((prev) => [...newEvents, ...prev]);
        }

        return {
          success: true,
          scanned: res.scannedCount,
          unread: res.unreadCount,
          itemsCount: res.updates.length,
        };
      }

      return { success: true, scanned: 0, unread: 0, itemsCount: 0 };
    } catch {
      return { success: false, scanned: 0, unread: 0, itemsCount: 0 };
    }
  };

  // Creation Handlers
  const handleCreateEvent = (newEvent: {
    title: string;
    category: EventCategory;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    venue: string;
  }) => {
    const item: CampusEvent = {
      id: `evt-${Date.now()}`,
      title: newEvent.title,
      category: newEvent.category,
      timingBadge: 'Upcoming',
      description: newEvent.description,
      dateTimeStr: `${newEvent.date} · ${newEvent.startTime} – ${newEvent.endTime}`,
      venue: newEvent.venue,
      isInterested: true,
    };
    setEvents([item, ...events]);
  };

  const handleUploadFile = (newFile: {
    title: string;
    subject: string;
    category: 'Lectures' | 'Notes' | 'Assignments' | 'Practicals';
    size: string;
    fileUrl: string;
  }) => {
    const item: DriveFile = {
      id: `file-${Date.now()}`,
      name: `${newFile.title}.pdf`,
      subject: newFile.subject,
      category: newFile.category,
      size: newFile.size,
      uploadDate: 'Just now',
      author: profile.name,
      isStarred: false,
      fileUrl: newFile.fileUrl,
    };
    setDriveFiles([item, ...driveFiles]);
  };

  const updateAssignmentStatus = (
    assignmentId: string,
    newStatus: Exclude<AssignmentStatus, 'All'>,
  ) => {
    setAssignments((prev) =>
      prev.map((asg) =>
        asg.id === assignmentId ? { ...asg, status: newStatus } : asg,
      ),
    );
  };

  const toggleEventInterest = (eventId: string) => {
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === eventId ? { ...evt, isInterested: !evt.isInterested } : evt,
      ),
    );
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
    );
  };

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
    setTasks([item, ...tasks]);
    setNewTaskTitle('');
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const toggleStarFile = (fileId: string) => {
    setDriveFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isStarred: !f.isStarred } : f)),
    );
  };

  const markPracticalComplete = (id: string) => {
    setPracticals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p)),
    );
  };

  const markNoticeAsRead = (noticeId: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === noticeId ? { ...n, isUnread: false } : n)),
    );
  };

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,

    // Profile & CRUD Handlers
    profile,
    updateProfile,
    handleAvatarUpload,

    // MCP Connectors & AI Drawer
    connectors,
    toggleConnector,
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    activeAiPrompt,
    setActiveAiPrompt,
    openAiDrawerWithPrompt,

    // Live Deep Email Sync
    handleFullInboxSync,

    todayFormatted: getFormattedToday(),
    greeting: getLiveGreeting(),
    isAdmin,

    // Institution & Room Metadata
    institutionName,
    roomNo,
    effectiveDate,

    // Branch & Semester
    selectedBranch,
    setSelectedBranch,
    selectedSemester,
    setSelectedSemester,

    // Timetable & Subjects
    timetable,
    subjects,
    isTimetableModalOpen,
    setIsTimetableModalOpen,
    applyImportedTimetable,

    // Events
    events: events.filter(
      (evt) =>
        (selectedEventCategory === 'All' || evt.category === selectedEventCategory) &&
        (evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          evt.description.toLowerCase().includes(searchQuery.toLowerCase())),
    ),
    selectedEventCategory,
    setSelectedEventCategory,
    toggleEventInterest,
    isEventModalOpen,
    setIsEventModalOpen,
    handleCreateEvent,

    // Drive
    driveFiles,
    toggleStarFile,
    isUploadModalOpen,
    setIsUploadModalOpen,
    handleUploadFile,

    // Coursework
    assignments: assignments.filter(
      (a) => assignmentFilter === 'All' || a.status === assignmentFilter,
    ),
    assignmentFilter,
    setAssignmentFilter,
    updateAssignmentStatus,
    practicals,
    markPracticalComplete,
    exams: INITIAL_EXAMS,
    attendance: INITIAL_ATTENDANCE,
    notices,
    markNoticeAsRead,

    // Tasks
    tasks,
    newTaskTitle,
    setNewTaskTitle,
    newTaskCategory,
    setNewTaskCategory,
    newTaskPriority,
    setNewTaskPriority,
    addTask,
    deleteTask,
    toggleTaskCompletion,

    // Campus Help
    facultyDirectory: FACULTY_DIRECTORY,
    lostItems: LOST_ITEMS,
  };
}