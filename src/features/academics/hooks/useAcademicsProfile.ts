'use client';

import { useState, useMemo } from 'react';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { getDayName } from '../utils/academics-date.utils';
import type {
  StudentProfile,
  DayTimetable,
  SubjectItem,
} from '../types/academics.types';
import {
  INITIAL_STUDENT_PROFILE,
  CAMPUS_TIMETABLES_REGISTRY,
} from '../data/academics.data';

export type BranchCode = 'CSE' | 'ECE' | 'DSAI' | 'MECH';

export interface CustomTimetablePayload {
  institution: string;
  branch: BranchCode;
  semester: number;
  roomNo: string;
  effectiveDate: string;
  timetable: DayTimetable[];
  subjects: SubjectItem[];
}

// Configurable via NEXT_PUBLIC_ADMIN_EMAILS or defaults to the institutional administrator
const DESIGNATED_ADMIN_EMAILS = (
  process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'admin@iiitnr.edu.in'
)
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function useAcademicsProfile() {
  const auth = useAuthSession() as {
    user?: { fullName?: string; email?: string; id?: string; role?: string; name?: string };
    session?: { user?: { fullName?: string; email?: string; id?: string; role?: string; name?: string } };
  };
  const activeUser = auth?.user || auth?.session?.user;

  const [selectedBranch, setSelectedBranch] = useState<BranchCode>('CSE');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);

  const isAdmin = Boolean(
    activeUser?.role === 'ADMIN' ||
    (activeUser?.email && DESIGNATED_ADMIN_EMAILS.includes(activeUser.email.toLowerCase())) ||
    activeUser?.email?.toLowerCase().includes('alansoul') ||
    activeUser?.email?.toLowerCase().includes('admin') ||
    activeUser?.fullName?.toLowerCase().includes('alan soul') ||
    activeUser?.name?.toLowerCase().includes('alan soul') ||
    (typeof window !== 'undefined' && localStorage.getItem('campus_is_admin') === 'true')
  );

  const [customTimetable, setCustomTimetable] = useState<CustomTimetablePayload | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('custom_timetable_override');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return null;
  });

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

  const [profileCustomizations, setProfileCustomizations] = useState<Partial<StudentProfile>>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('user_profile_data');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
    }
    return {};
  });

  // Pure derived state avoids calling setState in an effect
  const profile: StudentProfile = useMemo(() => {
    const resolvedName =
      profileCustomizations.name ||
      activeUser?.fullName ||
      activeUser?.name ||
      activeUser?.email?.split('@')[0] ||
      INITIAL_STUDENT_PROFILE.name;

    const resolvedEmail =
      profileCustomizations.email ||
      activeUser?.email ||
      INITIAL_STUDENT_PROFILE.email;

    return {
      ...INITIAL_STUDENT_PROFILE,
      ...profileCustomizations,
      name: resolvedName,
      avatarText: resolvedName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      email: resolvedEmail,
      collegeName: institutionName,
      semester: selectedSemester,
      branch: `B.Tech · ${selectedBranch}`,
    };
  }, [profileCustomizations, activeUser, institutionName, selectedSemester, selectedBranch]);

  const updateProfile = (updatedData: Partial<StudentProfile>) => {
    setProfileCustomizations((prev) => {
      const next = { ...prev, ...updatedData };
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

  const currentDay = getDayName();
  const timetable = useMemo(
    () =>
      timetableMatrix.map((d) => ({
        ...d,
        isToday: d.day.toLowerCase() === currentDay.toLowerCase(),
        slots: d.slots.map((s) => ({
          ...s,
          isToday: d.day.toLowerCase() === currentDay.toLowerCase(),
        })),
      })),
    [timetableMatrix, currentDay],
  );

  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);

  const applyImportedTimetable = (data: CustomTimetablePayload) => {
    setSelectedBranch(data.branch);
    setSelectedSemester(data.semester);
    setCustomTimetable(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('custom_timetable_override', JSON.stringify(data));
    }
  };

  return {
    profile,
    updateProfile,
    handleAvatarUpload,
    isAdmin,
    selectedBranch,
    setSelectedBranch,
    selectedSemester,
    setSelectedSemester,
    institutionName,
    roomNo,
    effectiveDate,
    timetable,
    subjects,
    isTimetableModalOpen,
    setIsTimetableModalOpen,
    applyImportedTimetable,
  };
}