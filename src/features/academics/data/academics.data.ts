import {
  StudentProfile,
  DayTimetable,
  SubjectItem,
  DriveFile,
  AssignmentItem,
  PracticalExperiment,
  ExamItem,
  AttendanceSubject,
  CampusNotice,
  CampusEvent,
  AcademicTask,
  FacultyContact,
  LostItem,
} from '../types/academics.types';

// Add to src/features/academics/data/academics.data.ts:

import { McpConnector } from '../types/academics.types';

export const INITIAL_MCP_CONNECTORS: McpConnector[] = [
  {
    id: 'gmail',
    name: 'Gmail Campus Sync',
    icon: '✉️',
    developer: 'Northstar & Google Workspace',
    category: 'Communication',
    description: 'Ingests administrative circulars, fee deadlines, and exam schedules directly into campus notices.',
    capabilities: ['Read incoming emails', 'Auto-triage exam notices', 'Extract PDF datesheet tables'],
    samplePrompts: [
      'Summarize the last 5 notices sent by the academic office',
      'Check if my Verilog lab schedule on Thursday was changed',
      'Draft a polite leave email to Dr. Mithilesh for next Monday',
    ],
    isConnected: true,
    connectedAccount: 'alansoul796@gmail.com',
  },
  {
    id: 'outlook',
    name: 'Outlook / Microsoft 365',
    icon: '📬',
    developer: 'Microsoft Education',
    category: 'Communication',
    description: 'Syncs university institutional inbox (@iiitnr.edu.in) and automated class reminders from MS Teams.',
    capabilities: ['Triage Outlook inboxes', 'Sync Teams calendar', 'Parse professor announcements'],
    samplePrompts: [
      'Find all emails with subject "Mid-sem exam"',
      'Did Dr. Ruhul post the C-programming assignment deadline?',
    ],
    isConnected: false,
  },
  {
    id: 'gdrive',
    name: 'Google Drive Academic Sync',
    icon: '📁',
    developer: 'Google Workspace',
    category: 'Productivity',
    description: 'Indexes handwritten student notes, past-year question banks, and lecture presentations into the Lecture Drive.',
    capabilities: ['Read and search PDFs', 'Generate revision flashcards', 'Auto-categorize notes by unit'],
    samplePrompts: [
      'Extract all key formulas from Linear Algebra Unit 1 notes',
      'Generate 5 practice questions from the Verilog manual',
    ],
    isConnected: true,
    connectedAccount: 'alan.drive@iiitnr.edu.in',
  },
  {
    id: 'github',
    name: 'GitHub Education',
    icon: '🐙',
    developer: 'GitHub',
    category: 'Development',
    description: 'Connects your department lab repositories. Automatically tracks commits, assignment PRs, and CI test passes.',
    capabilities: ['Track lab assignment PRs', 'Inspect commit histories', 'Triage code review issues'],
    samplePrompts: [
      'Review my C pointer arithmetic code for memory leaks',
      'Did my GitHub Actions workflow for the Verilog testbench pass?',
    ],
    isConnected: true,
    connectedAccount: 'github.com/alansoul',
  },
  {
    id: 'moodle',
    name: 'Moodle / Canvas LMS',
    icon: '🎓',
    developer: 'LMS Open Consortium',
    category: 'Academic LMS',
    description: 'Syncs grading rubrics, quiz submission portals, and faculty announcements from college portals.',
    capabilities: ['Pull pending assignment deadlines', 'Fetch quiz marks', 'Sync course syllabus'],
    samplePrompts: [
      'List all assignments due in the next 7 days across all subjects',
      'What is my current attendance grade in Calculus?',
    ],
    isConnected: false,
  },
  {
    id: 'zimbra',
    name: 'Zimbra / IMAP Webmail',
    icon: '🌐',
    developer: 'University Network Cell',
    category: 'Communication',
    description: 'Direct socket connection to self-hosted university mail servers without third-party cloud routing.',
    capabilities: ['IMAP IDLE real-time listening', 'Zero third-party data retention', 'On-premises parsing'],
    samplePrompts: [
      'Listen for circulars sent to all-students@iiitnr.ac.in',
    ],
    isConnected: false,
  },
];

// ==========================================
// 1. DR. SPM IIIT NAYA RAIPUR — CSE SEM 1 (Room 138)
// ==========================================
export const IIITNR_CSE_SEM1_SUBJECTS: SubjectItem[] = [
  { id: 'cse1-1', code: 'CS101', name: 'Programming with C', faculty: 'Dr. Ruhul', credits: 4, classesPerWeek: 4, assignmentsCount: 2, filesCount: 5, unitsCompleted: 1, totalUnits: 4, attendancePct: 88 },
  { id: 'cse1-2', code: 'MA101', name: 'Calculus', faculty: 'Dr. Jaya Rahod', credits: 4, classesPerWeek: 4, assignmentsCount: 1, filesCount: 3, unitsCompleted: 2, totalUnits: 4, attendancePct: 92 },
  { id: 'cse1-3', code: 'MA102', name: 'Linear Algebra & Matrix Analysis', faculty: 'Dr. Mithilesh', credits: 4, classesPerWeek: 4, assignmentsCount: 1, filesCount: 4, unitsCompleted: 1, totalUnits: 4, attendancePct: 85 },
  { id: 'cse1-4', code: 'EC101', name: 'Digital Electronics using Verilog', faculty: 'Dr. Manoj', credits: 4, classesPerWeek: 4, assignmentsCount: 2, filesCount: 4, unitsCompleted: 2, totalUnits: 4, attendancePct: 78 },
  { id: 'cse1-5', code: 'CS102', name: 'Internet of Things', faculty: 'Dr. Abhishek', credits: 3, classesPerWeek: 3, assignmentsCount: 1, filesCount: 2, unitsCompleted: 1, totalUnits: 3, attendancePct: 90 },
  { id: 'cse1-6', code: 'HS101', name: 'International Language Competency (ILC)', faculty: 'Dr. Aruna', credits: 2, classesPerWeek: 5, assignmentsCount: 1, filesCount: 3, unitsCompleted: 2, totalUnits: 3, attendancePct: 95 },
  { id: 'cse1-7', code: 'CS103', name: 'IT Workshop', faculty: 'Prof. Srinivasa', credits: 2, classesPerWeek: 3, assignmentsCount: 1, filesCount: 2, unitsCompleted: 1, totalUnits: 3, attendancePct: 86 },
  { id: 'cse1-8', code: 'HS102', name: 'Entrepreneurship', faculty: 'Dr. Amit', credits: 2, classesPerWeek: 2, assignmentsCount: 1, filesCount: 1, unitsCompleted: 1, totalUnits: 2, attendancePct: 84 },
  { id: 'cse1-9', code: 'CL101', name: 'Music', faculty: 'Dr. Darash', credits: 1, classesPerWeek: 4, assignmentsCount: 0, filesCount: 1, unitsCompleted: 1, totalUnits: 1, attendancePct: 100 },
  { id: 'cse1-10', code: 'CL102', name: 'Yoga / Sports', faculty: 'GF / Dr. Khilesh Kumar', credits: 1, classesPerWeek: 4, assignmentsCount: 0, filesCount: 1, unitsCompleted: 1, totalUnits: 1, attendancePct: 100 },
];

export const IIITNR_CSE_SEM1_TIMETABLE: DayTimetable[] = [
  {
    day: 'Monday',
    dateStr: 'Room 138',
    classCount: 8,
    isToday: false,
    slots: [
      { id: 'csem-1', subjectName: 'Music', code: 'CL101', type: 'Theory', startTime: '09:00', endTime: '09:55', room: 'Room 138', faculty: 'Dr. Darash' },
      { id: 'csem-2', subjectName: 'Music', code: 'CL101', type: 'Theory', startTime: '10:00', endTime: '10:55', room: 'Room 138', faculty: 'Dr. Darash' },
      { id: 'csem-3', subjectName: 'Digital Electronics (Slot L)', code: 'EC101', type: 'Theory', startTime: '11:00', endTime: '11:55', room: 'Room 138', faculty: 'Dr. Manoj' },
      { id: 'csem-4', subjectName: 'Programming with C (Slot B)', code: 'CS101', type: 'Theory', startTime: '12:00', endTime: '12:55', room: 'Room 138', faculty: 'Dr. Ruhul' },
      { id: 'csem-5', subjectName: 'International Language Competency', code: 'HS101', type: 'Tutorial', startTime: '14:00', endTime: '14:55', room: 'Room 138', faculty: 'Dr. Aruna' },
      { id: 'csem-6', subjectName: 'Linear Algebra & Matrix (Slot A)', code: 'MA102', type: 'Theory', startTime: '15:00', endTime: '15:55', room: 'Room 138', faculty: 'Dr. Mithilesh' },
      { id: 'csem-7', subjectName: 'ILC / Yoga', code: 'CL102', type: 'Practical', startTime: '16:00', endTime: '16:55', room: 'Room 138', faculty: 'GF' },
      { id: 'csem-8', subjectName: 'ILC / Yoga', code: 'CL102', type: 'Practical', startTime: '17:00', endTime: '17:55', room: 'Room 138', faculty: 'GF' },
    ],
  },
  {
    day: 'Tuesday',
    dateStr: 'Room 138',
    classCount: 8,
    isToday: false,
    slots: [
      { id: 'cset-1', subjectName: 'Calculus (Slot Z)', code: 'MA101', type: 'Theory', startTime: '09:00', endTime: '09:55', room: 'Room 138', faculty: 'Dr. Jaya Rahod' },
      { id: 'cset-2', subjectName: 'Calculus (Slot Z)', code: 'MA101', type: 'Theory', startTime: '10:00', endTime: '10:55', room: 'Room 138', faculty: 'Dr. Jaya Rahod' },
      { id: 'cset-3', subjectName: 'IT Workshop (Slot P)', code: 'CS103', type: 'Practical', startTime: '11:00', endTime: '11:55', room: 'Lab 2', faculty: 'Prof. Srinivasa' },
      { id: 'cset-4', subjectName: 'Programming with C (Slot B)', code: 'CS101', type: 'Theory', startTime: '12:00', endTime: '12:55', room: 'Room 138', faculty: 'Dr. Ruhul' },
      { id: 'cset-5', subjectName: 'Calculus (Slot Z)', code: 'MA101', type: 'Tutorial', startTime: '14:00', endTime: '14:55', room: 'Room 138', faculty: 'Dr. Jaya Rahod' },
      { id: 'cset-6', subjectName: 'Internet of Things (Slot F)', code: 'CS102', type: 'Theory', startTime: '15:00', endTime: '15:55', room: 'Room 138', faculty: 'Dr. Abhishek' },
      { id: 'cset-7', subjectName: 'Entrepreneurship (Slot E)', code: 'HS102', type: 'Theory', startTime: '16:00', endTime: '16:55', room: 'Room 138', faculty: 'Dr. Amit' },
      { id: 'cset-8', subjectName: 'Entrepreneurship (Slot E)', code: 'HS102', type: 'Theory', startTime: '17:00', endTime: '17:55', room: 'Room 138', faculty: 'Dr. Amit' },
    ],
  },
  {
    day: 'Wednesday',
    dateStr: 'Room 138',
    classCount: 7,
    isToday: false,
    slots: [
      { id: 'csew-1', subjectName: 'ILC (Language Lab)', code: 'HS101', type: 'Tutorial', startTime: '09:00', endTime: '09:55', room: 'Room 138', faculty: 'Dr. Aruna' },
      { id: 'csew-2', subjectName: 'Linear Algebra (Slot A)', code: 'MA102', type: 'Theory', startTime: '10:00', endTime: '10:55', room: 'Room 138', faculty: 'Dr. Mithilesh' },
      { id: 'csew-3', subjectName: 'Calculus (Slot Z)', code: 'MA101', type: 'Theory', startTime: '11:00', endTime: '11:55', room: 'Room 138', faculty: 'Dr. Jaya Rahod' },
      { id: 'csew-4', subjectName: 'ILC', code: 'HS101', type: 'Tutorial', startTime: '14:00', endTime: '14:55', room: 'Room 138', faculty: 'Dr. Aruna' },
      { id: 'csew-5', subjectName: 'ILC', code: 'HS101', type: 'Tutorial', startTime: '15:00', endTime: '15:55', room: 'Room 138', faculty: 'Dr. Aruna' },
      { id: 'csew-6', subjectName: 'Music', code: 'CL101', type: 'Theory', startTime: '16:00', endTime: '16:55', room: 'Room 138', faculty: 'Dr. Darash' },
      { id: 'csew-7', subjectName: 'Music', code: 'CL101', type: 'Theory', startTime: '17:00', endTime: '17:55', room: 'Room 138', faculty: 'Dr. Darash' },
    ],
  },
  {
    day: 'Thursday',
    dateStr: 'Room 138',
    classCount: 8,
    isToday: true,
    slots: [
      { id: 'cseth-1', subjectName: 'Linear Algebra (Slot A)', code: 'MA102', type: 'Theory', startTime: '09:00', endTime: '09:55', room: 'Room 138', faculty: 'Dr. Mithilesh' },
      { id: 'cseth-2', subjectName: 'Linear Algebra (Slot A)', code: 'MA102', type: 'Theory', startTime: '10:00', endTime: '10:55', room: 'Room 138', faculty: 'Dr. Mithilesh' },
      { id: 'cseth-3', subjectName: 'Digital Electronics (Slot L)', code: 'EC101', type: 'Theory', startTime: '11:00', endTime: '11:55', room: 'Room 138', faculty: 'Dr. Manoj' },
      { id: 'cseth-4', subjectName: 'ILC (Language Lab)', code: 'HS101', type: 'Tutorial', startTime: '12:00', endTime: '12:55', room: 'Room 138', faculty: 'Dr. Aruna' },
      { id: 'cseth-5', subjectName: 'Digital Electronics Lab', code: 'EC101', type: 'Practical', startTime: '14:00', endTime: '14:55', room: 'Lab 1', faculty: 'Dr. Manoj' },
      { id: 'cseth-6', subjectName: 'Digital Electronics Lab', code: 'EC101', type: 'Practical', startTime: '15:00', endTime: '15:55', room: 'Lab 1', faculty: 'Dr. Manoj' },
      { id: 'cseth-7', subjectName: 'Internet of Things (Slot F)', code: 'CS102', type: 'Theory', startTime: '16:00', endTime: '16:55', room: 'Room 138', faculty: 'Dr. Abhishek' },
      { id: 'cseth-8', subjectName: 'Internet of Things (Slot F)', code: 'CS102', type: 'Theory', startTime: '17:00', endTime: '17:55', room: 'Room 138', faculty: 'Dr. Abhishek' },
    ],
  },
  {
    day: 'Friday',
    dateStr: 'Room 138',
    classCount: 8,
    isToday: false,
    slots: [
      { id: 'csef-1', subjectName: 'Programming with C (Slot B)', code: 'CS101', type: 'Theory', startTime: '09:00', endTime: '09:55', room: 'Room 138', faculty: 'Dr. Ruhul' },
      { id: 'csef-2', subjectName: 'Programming with C (Slot B)', code: 'CS101', type: 'Theory', startTime: '10:00', endTime: '10:55', room: 'Room 138', faculty: 'Dr. Ruhul' },
      { id: 'csef-3', subjectName: 'IT Workshop (Slot P)', code: 'CS103', type: 'Practical', startTime: '11:00', endTime: '11:55', room: 'Lab 2', faculty: 'Prof. Srinivasa' },
      { id: 'csef-4', subjectName: 'IT Workshop (Slot P)', code: 'CS103', type: 'Practical', startTime: '12:00', endTime: '12:55', room: 'Lab 2', faculty: 'Prof. Srinivasa' },
      { id: 'csef-5', subjectName: 'ILC', code: 'HS101', type: 'Tutorial', startTime: '14:00', endTime: '14:55', room: 'Room 138', faculty: 'Dr. Aruna' },
      { id: 'csef-6', subjectName: 'ILC', code: 'HS101', type: 'Tutorial', startTime: '15:00', endTime: '15:55', room: 'Room 138', faculty: 'Dr. Aruna' },
      { id: 'csef-7', subjectName: 'Yoga', code: 'CL102', type: 'Practical', startTime: '16:00', endTime: '16:55', room: 'Sports Complex', faculty: 'GF' },
      { id: 'csef-8', subjectName: 'Yoga', code: 'CL102', type: 'Practical', startTime: '17:00', endTime: '17:55', room: 'Sports Complex', faculty: 'GF' },
    ],
  },
];

// ==========================================
// 2. DR. SPM IIIT NAYA RAIPUR — ECE SEM 1 (Room 122)
// ==========================================
export const IIITNR_ECE_SEM1_SUBJECTS: SubjectItem[] = [
  { id: 'ece1-1', code: 'EC101', name: 'Digital Electronics using Verilog', faculty: 'Dr. Maifuz', credits: 4, classesPerWeek: 4, assignmentsCount: 2, filesCount: 5, unitsCompleted: 2, totalUnits: 4, attendancePct: 82 },
  { id: 'ece1-2', code: 'MA102', name: 'Linear Algebra & Matrix Analysis', faculty: 'Dr. Ramakrishna', credits: 4, classesPerWeek: 4, assignmentsCount: 1, filesCount: 4, unitsCompleted: 1, totalUnits: 4, attendancePct: 88 },
  { id: 'ece1-3', code: 'CS101', name: 'Programming with C', faculty: 'Dr. M K Rao', credits: 4, classesPerWeek: 4, assignmentsCount: 1, filesCount: 3, unitsCompleted: 2, totalUnits: 4, attendancePct: 91 },
  { id: 'ece1-4', code: 'MA101', name: 'Calculus', faculty: 'Dr. Jaya Rathod', credits: 4, classesPerWeek: 4, assignmentsCount: 1, filesCount: 4, unitsCompleted: 1, totalUnits: 4, attendancePct: 84 },
  { id: 'ece1-5', code: 'EC102', name: 'Internet of Things', faculty: 'Dr. Lakhindar', credits: 3, classesPerWeek: 4, assignmentsCount: 1, filesCount: 3, unitsCompleted: 1, totalUnits: 3, attendancePct: 89 },
  { id: 'ece1-6', code: 'HS101', name: 'International Language Competency (ILC)', faculty: 'Dr. Aruna', credits: 2, classesPerWeek: 5, assignmentsCount: 1, filesCount: 2, unitsCompleted: 1, totalUnits: 3, attendancePct: 94 },
  { id: 'ece1-7', code: 'EC103', name: 'IT Workshop', faculty: 'Prof. Srinivasa', credits: 2, classesPerWeek: 3, assignmentsCount: 1, filesCount: 2, unitsCompleted: 1, totalUnits: 3, attendancePct: 87 },
  { id: 'ece1-8', code: 'HS102', name: 'Entrepreneurship', faculty: 'Dr. Amit', credits: 2, classesPerWeek: 2, assignmentsCount: 1, filesCount: 1, unitsCompleted: 1, totalUnits: 2, attendancePct: 80 },
  { id: 'ece1-9', code: 'CL101', name: 'Music', faculty: 'Dr. Darash', credits: 1, classesPerWeek: 4, assignmentsCount: 0, filesCount: 1, unitsCompleted: 1, totalUnits: 1, attendancePct: 100 },
  { id: 'ece1-10', code: 'CL102', name: 'Yoga / Sports', faculty: 'GF / Dr. Khilesh Kumar', credits: 1, classesPerWeek: 4, assignmentsCount: 0, filesCount: 1, unitsCompleted: 1, totalUnits: 1, attendancePct: 100 },
];

export const IIITNR_ECE_SEM1_TIMETABLE: DayTimetable[] = [
  {
    day: 'Monday',
    dateStr: 'Room 122',
    classCount: 8,
    isToday: false,
    slots: [
      { id: 'ecem-1', subjectName: 'Music', code: 'CL101', type: 'Theory', startTime: '09:00', endTime: '09:55', room: 'Room 122', faculty: 'Dr. Darash' },
      { id: 'ecem-2', subjectName: 'Music', code: 'CL101', type: 'Theory', startTime: '10:00', endTime: '10:55', room: 'Room 122', faculty: 'Dr. Darash' },
      { id: 'ecem-3', subjectName: 'IT Workshop (Slot H)', code: 'EC103', type: 'Practical', startTime: '11:00', endTime: '11:55', room: 'Lab 1', faculty: 'Prof. Srinivasa' },
      { id: 'ecem-4', subjectName: 'Linear Algebra & Matrix (Slot V)', code: 'MA102', type: 'Theory', startTime: '12:00', endTime: '12:55', room: 'Room 122', faculty: 'Dr. Ramakrishna' },
      { id: 'ecem-5', subjectName: 'ILC', code: 'HS101', type: 'Tutorial', startTime: '14:00', endTime: '14:55', room: 'Room 122', faculty: 'Dr. Aruna' },
      { id: 'ecem-6', subjectName: 'Programming with C (Slot A)', code: 'CS101', type: 'Theory', startTime: '15:00', endTime: '15:55', room: 'Room 122', faculty: 'Dr. M K Rao' },
      { id: 'ecem-7', subjectName: 'ILC / Yoga', code: 'CL102', type: 'Practical', startTime: '16:00', endTime: '16:55', room: 'Room 122', faculty: 'GF' },
      { id: 'ecem-8', subjectName: 'ILC / Yoga', code: 'CL102', type: 'Practical', startTime: '17:00', endTime: '17:55', room: 'Room 122', faculty: 'GF' },
    ],
  },
  {
    day: 'Tuesday',
    dateStr: 'Room 122',
    classCount: 8,
    isToday: false,
    slots: [
      { id: 'ecet-1', subjectName: 'Programming with C (Slot A)', code: 'CS101', type: 'Theory', startTime: '09:00', endTime: '09:55', room: 'Room 122', faculty: 'Dr. M K Rao' },
      { id: 'ecet-2', subjectName: 'Programming with C (Slot A)', code: 'CS101', type: 'Theory', startTime: '10:00', endTime: '10:55', room: 'Room 122', faculty: 'Dr. M K Rao' },
      { id: 'ecet-3', subjectName: 'Linear Algebra (Slot V)', code: 'MA102', type: 'Theory', startTime: '11:00', endTime: '11:55', room: 'Room 122', faculty: 'Dr. Ramakrishna' },
      { id: 'ecet-4', subjectName: 'Calculus (Slot B)', code: 'MA101', type: 'Theory', startTime: '12:00', endTime: '12:55', room: 'Room 122', faculty: 'Dr. Jaya Rathod' },
      { id: 'ecet-5', subjectName: 'IT Workshop (Slot H)', code: 'EC103', type: 'Practical', startTime: '14:00', endTime: '14:55', room: 'Lab 1', faculty: 'Prof. Srinivasa' },
      { id: 'ecet-6', subjectName: 'IT Workshop (Slot H)', code: 'EC103', type: 'Practical', startTime: '15:00', endTime: '15:55', room: 'Lab 1', faculty: 'Prof. Srinivasa' },
      { id: 'ecet-7', subjectName: 'Calculus (Slot B)', code: 'MA101', type: 'Tutorial', startTime: '16:00', endTime: '16:55', room: 'Room 122', faculty: 'Dr. Jaya Rathod' },
      { id: 'ecet-8', subjectName: 'Calculus (Slot B)', code: 'MA101', type: 'Tutorial', startTime: '17:00', endTime: '17:55', room: 'Room 122', faculty: 'Dr. Jaya Rathod' },
    ],
  },
  {
    day: 'Wednesday',
    dateStr: 'Room 122',
    classCount: 8,
    isToday: false,
    slots: [
      { id: 'ecew-1', subjectName: 'ILC', code: 'HS101', type: 'Tutorial', startTime: '09:00', endTime: '09:55', room: 'Room 122', faculty: 'Dr. Aruna' },
      { id: 'ecew-2', subjectName: 'Digital Electronics (Slot G)', code: 'EC101', type: 'Theory', startTime: '10:00', endTime: '10:55', room: 'Room 122', faculty: 'Dr. Maifuz' },
      { id: 'ecew-3', subjectName: 'Entrepreneurship (Slot D)', code: 'HS102', type: 'Theory', startTime: '11:00', endTime: '11:55', room: 'Room 122', faculty: 'Dr. Amit' },
      { id: 'ecew-4', subjectName: 'Entrepreneurship (Slot D)', code: 'HS102', type: 'Theory', startTime: '12:00', endTime: '12:55', room: 'Room 122', faculty: 'Dr. Amit' },
      { id: 'ecew-5', subjectName: 'ILC', code: 'HS101', type: 'Tutorial', startTime: '14:00', endTime: '14:55', room: 'Room 122', faculty: 'Dr. Aruna' },
      { id: 'ecew-6', subjectName: 'ILC', code: 'HS101', type: 'Tutorial', startTime: '15:00', endTime: '15:55', room: 'Room 122', faculty: 'Dr. Aruna' },
      { id: 'ecew-7', subjectName: 'Music', code: 'CL101', type: 'Theory', startTime: '16:00', endTime: '16:55', room: 'Room 122', faculty: 'Dr. Darash' },
      { id: 'ecew-8', subjectName: 'Music', code: 'CL101', type: 'Theory', startTime: '17:00', endTime: '17:55', room: 'Room 122', faculty: 'Dr. Darash' },
    ],
  },
  {
    day: 'Thursday',
    dateStr: 'Room 122',
    classCount: 9,
    isToday: true,
    slots: [
      { id: 'eceth-1', subjectName: 'Digital Electronics (Slot G)', code: 'EC101', type: 'Theory', startTime: '09:00', endTime: '09:55', room: 'Room 122', faculty: 'Dr. Maifuz' },
      { id: 'eceth-2', subjectName: 'Digital Electronics (Slot G)', code: 'EC101', type: 'Theory', startTime: '10:00', endTime: '10:55', room: 'Room 122', faculty: 'Dr. Maifuz' },
      { id: 'eceth-3', subjectName: 'Programming with C (Slot A)', code: 'CS101', type: 'Theory', startTime: '11:00', endTime: '11:55', room: 'Room 122', faculty: 'Dr. M K Rao' },
      { id: 'eceth-4', subjectName: 'ILC', code: 'HS101', type: 'Tutorial', startTime: '12:00', endTime: '12:55', room: 'Room 122', faculty: 'Dr. Aruna' },
      { id: 'eceth-5', subjectName: 'Internet of Things (Slot C)', code: 'EC102', type: 'Theory', startTime: '14:00', endTime: '14:55', room: 'Room 122', faculty: 'Dr. Lakhindar' },
      { id: 'eceth-6', subjectName: 'Internet of Things (Slot C)', code: 'EC102', type: 'Theory', startTime: '15:00', endTime: '15:55', room: 'Room 122', faculty: 'Dr. Lakhindar' },
      { id: 'eceth-7', subjectName: 'Linear Algebra (Slot V)', code: 'MA102', type: 'Theory', startTime: '16:00', endTime: '16:55', room: 'Room 122', faculty: 'Dr. Ramakrishna' },
      { id: 'eceth-8', subjectName: 'Linear Algebra (Slot V)', code: 'MA102', type: 'Theory', startTime: '17:00', endTime: '17:55', room: 'Room 122', faculty: 'Dr. Ramakrishna' },
    ],
  },
  {
    day: 'Friday',
    dateStr: 'Room 122',
    classCount: 8,
    isToday: false,
    slots: [
      { id: 'ecef-1', subjectName: 'Calculus (Slot B)', code: 'MA101', type: 'Theory', startTime: '10:00', endTime: '10:55', room: 'Room 122', faculty: 'Dr. Jaya Rathod' },
      { id: 'ecef-2', subjectName: 'Internet of Things (Slot C)', code: 'EC102', type: 'Theory', startTime: '11:00', endTime: '11:55', room: 'Room 122', faculty: 'Dr. Lakhindar' },
      { id: 'ecef-3', subjectName: 'Internet of Things (Slot C)', code: 'EC102', type: 'Theory', startTime: '12:00', endTime: '12:55', room: 'Room 122', faculty: 'Dr. Lakhindar' },
      { id: 'ecef-4', subjectName: 'ILC', code: 'HS101', type: 'Tutorial', startTime: '14:00', endTime: '14:55', room: 'Room 122', faculty: 'Dr. Aruna' },
      { id: 'ecef-5', subjectName: 'ILC', code: 'HS101', type: 'Tutorial', startTime: '15:00', endTime: '15:55', room: 'Room 122', faculty: 'Dr. Aruna' },
      { id: 'ecef-6', subjectName: 'Yoga', code: 'CL102', type: 'Practical', startTime: '16:00', endTime: '16:55', room: 'Sports Complex', faculty: 'GF' },
      { id: 'ecef-7', subjectName: 'Yoga', code: 'CL102', type: 'Practical', startTime: '17:00', endTime: '17:55', room: 'Sports Complex', faculty: 'GF' },
    ],
  },
];

// Presets registry mapping branch & semester
export const CAMPUS_TIMETABLES_REGISTRY: Record<
  string,
  {
    institution: string;
    roomNo: string;
    effectiveDate: string;
    timetable: DayTimetable[];
    subjects: SubjectItem[];
  }
> = {
  CSE_1: {
    institution: 'Dr. Shyama Prasad Mukherjee International Institute of Information Technology, Naya Raipur',
    roomNo: 'Room No 138',
    effectiveDate: '07/09/2026',
    timetable: IIITNR_CSE_SEM1_TIMETABLE,
    subjects: IIITNR_CSE_SEM1_SUBJECTS,
  },
  ECE_1: {
    institution: 'Dr. Shyama Prasad Mukherjee International Institute of Information Technology, Naya Raipur',
    roomNo: 'Room No 122',
    effectiveDate: '07/09/2026',
    timetable: IIITNR_ECE_SEM1_TIMETABLE,
    subjects: IIITNR_ECE_SEM1_SUBJECTS,
  },
};

// Existing seed data continues below...
export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  id: 'usr_21cse1042',
  name: 'Aarav Mehta',
  avatarText: 'AM',
  rollNumber: '21CSE1042',
  branch: 'B.Tech · Computer Science & Engineering',
  semester: 1,
  section: 'A',
  email: 'aarav.mehta@iiitnr.edu.in',
  collegeName: 'Dr. SPM IIIT Naya Raipur',
  academicYear: '2026 – 2027',
  mentor: 'Dr. Mithilesh',
  avgAttendance: 89,
  syllabusCovered: 45,
  assignmentsSubmitted: '3/6',
  practicalsDone: '2/5',
  openTasksCount: 5,
};

export const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 'evt-1',
    title: 'Robotics Club open build night',
    category: 'Club',
    timingBadge: 'Tomorrow',
    description: 'Open workshop night — bring a project or join an existing build team.',
    dateTimeStr: '16 Oct 2026 · 18:00 – 21:00',
    venue: 'Innovation Lab',
    isInterested: false,
  },
  {
    id: 'evt-2',
    title: 'Workshop: Git & collaborative coding',
    category: 'Workshop',
    timingBadge: 'In 4 days',
    description: 'Hands-on session covering branching, pull requests and review etiquette.',
    dateTimeStr: '19 Oct 2026 · 14:00 – 17:00',
    venue: 'Seminar Hall B',
    isInterested: false,
  },
  {
    id: 'evt-3',
    title: 'HackNorth 2025',
    category: 'Hackathon',
    timingBadge: 'In 7 days',
    description: 'Inter-college hackathon with tracks in AI, sustainability and open innovation.',
    dateTimeStr: '22 Oct 2026 · 09:00, 36 hours',
    venue: 'Innovation Block',
    isInterested: true,
  },
  {
    id: 'evt-4',
    title: 'Seminar: Systems design at scale',
    category: 'Seminar',
    timingBadge: '24 Oct',
    description: 'Industry guest lecture on distributed systems and incident response.',
    dateTimeStr: '24 Oct 2026 · 11:00 – 13:00',
    venue: 'Auditorium',
    isInterested: false,
  },
  {
    id: 'evt-5',
    title: 'Inter-department coding contest',
    category: 'Competition',
    timingBadge: '29 Oct',
    description: 'Three-hour individual contest; top eight qualify for the regional round.',
    dateTimeStr: '29 Oct 2026 · 10:00 – 13:00',
    venue: 'Lab 1 & Lab 3',
    isInterested: false,
  },
  {
    id: 'evt-6',
    title: "Founder's Day holiday",
    category: 'Holiday',
    timingBadge: '2 Nov',
    description: 'No classes or labs. Administrative offices remain closed.',
    dateTimeStr: '2 Nov 2026 · All day',
    venue: 'Campus closed',
    isInterested: false,
  },
];

export const INITIAL_TIMETABLE: DayTimetable[] = IIITNR_CSE_SEM1_TIMETABLE;
export const INITIAL_SUBJECTS: SubjectItem[] = IIITNR_CSE_SEM1_SUBJECTS;

export const INITIAL_FILES: DriveFile[] = [
  { id: 'f-1', name: 'LA — Linear Algebra Matrices Lecture 1.pdf', subject: 'Linear Algebra', category: 'Lectures', size: '3.4 MB', uploadDate: '15 Oct 2026', author: 'Dr. Mithilesh', isStarred: true },
  { id: 'f-2', name: 'C-Programming — Pointer Arithmetic Notes.pdf', subject: 'Programming with C', category: 'Notes', size: '2.1 MB', uploadDate: '14 Oct 2026', author: 'Dr. Ruhul', isStarred: true },
  { id: 'f-3', name: 'Digital Electronics — Verilog HDL Lab Manual.pdf', subject: 'Digital Electronics', category: 'Practicals', size: '5.2 MB', uploadDate: '12 Oct 2026', author: 'Dr. Manoj', isStarred: false },
  { id: 'f-4', name: 'Calculus — Limit Theorems & Continuity.pdf', subject: 'Calculus', category: 'Lectures', size: '4.1 MB', uploadDate: '10 Oct 2026', author: 'Dr. Jaya Rahod', isStarred: false },
];

export const INITIAL_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 'asg-1',
    title: 'C Programming — Pointer Array Dynamic Allocation',
    subject: 'Programming with C',
    status: 'In Progress',
    priority: 'High',
    description: 'Implement dynamic 2D matrix multiplication and string manipulation using malloc and free.',
    faculty: 'Dr. Ruhul',
    issuedDate: '10 Oct 2026',
    dueDate: '17 Oct 2026',
    relativeDue: 'Due in 2 days',
    attachments: ['pointers-assignment.pdf'],
  },
  {
    id: 'asg-2',
    title: 'Linear Algebra — Eigenvalues and Diagonalization',
    subject: 'Linear Algebra',
    status: 'Not Started',
    priority: 'High',
    description: 'Solve problem set 3 on characteristic polynomials, geometric multiplicity and Gram-Schmidt.',
    faculty: 'Dr. Mithilesh',
    issuedDate: '12 Oct 2026',
    dueDate: '19 Oct 2026',
    relativeDue: 'Due in 4 days',
    attachments: ['eigenvalues-sheet.pdf'],
  },
];

export const INITIAL_PRACTICALS: PracticalExperiment[] = [
  {
    id: 'p-1',
    subject: 'Digital Electronics',
    experimentNumber: 3,
    title: '4-Bit Ripple Carry Adder in Verilog HDL',
    labRoom: 'Lab 1',
    faculty: 'Dr. Manoj',
    sessionDate: '15 Oct 2026',
    recordDueDate: '18 Oct 2026',
    relativeDue: 'Due in 3 days',
    tags: ['Verilog Code', 'Simulation Waveforms', 'FPGA Bitstream'],
    completed: false,
  },
  {
    id: 'p-2',
    subject: 'IT Workshop',
    experimentNumber: 2,
    title: 'Linux Shell Scripting & Git Hooks',
    labRoom: 'Lab 2',
    faculty: 'Prof. Srinivasa',
    sessionDate: '13 Oct 2026',
    recordDueDate: '20 Oct 2026',
    relativeDue: 'Due in 5 days',
    tags: ['Bash Script', 'Output Logs'],
    completed: true,
  },
];

export const INITIAL_EXAMS: ExamItem[] = [
  {
    id: 'ex-1',
    title: 'Calculus Quiz 1',
    subject: 'Calculus',
    type: 'Quiz',
    dateStr: '19 Oct 2026',
    timeStr: '09:00 – 09:55',
    room: 'Room 138',
    syllabus: 'Functions, limits and continuity of single variables',
    relativeNotice: 'In 4 days',
    isNextUp: true,
  },
  {
    id: 'ex-2',
    title: 'Mid-Semester Examination',
    subject: 'Linear Algebra & Matrix Analysis',
    type: 'Mid-semester',
    dateStr: '27 Oct 2026',
    timeStr: '10:00 – 12:00',
    room: 'Exam Hall 2',
    syllabus: 'Matrix operations, vector spaces, basis, and dimension',
    relativeNotice: '27 Oct',
  },
];

export const INITIAL_ATTENDANCE: AttendanceSubject[] = [
  { subject: 'Programming with C', attendancePct: 88, totalClasses: 32, attended: 28, missed: 4, statusText: 'You can miss up to 4 classes and stay above 75%.', isWarning: false },
  { subject: 'Calculus', attendancePct: 92, totalClasses: 30, attended: 28, missed: 2, statusText: 'Safe attendance record.', isWarning: false },
  { subject: 'Digital Electronics', attendancePct: 78, totalClasses: 32, attended: 25, missed: 7, statusText: 'Attend upcoming classes to keep above 75%.', isWarning: false },
  { subject: 'Linear Algebra', attendancePct: 85, totalClasses: 28, attended: 24, missed: 4, statusText: 'On track.', isWarning: false },
];

export const INITIAL_NOTICES: CampusNotice[] = [
  {
    id: 'not-1',
    title: 'Autumn Semester 2026-27 Master Timetable Published',
    category: 'Examination',
    dateStr: '15 Oct 2026 · Today',
    summary: 'Class timetable w.e.f. 07/09/2026 for B.Tech I Semester CSE & ECE is now effective.',
    attachmentName: 'IIITNR-Autumn-2026-Timetable.pdf',
    isImportant: true,
    isUnread: true,
  },
];

export const INITIAL_TASKS: AcademicTask[] = [
  { id: 'tsk-1', title: 'Submit Verilog Lab 3 source code', category: 'Practical', priority: 'High', dueDateText: 'Due in 3 days', completed: false },
  { id: 'tsk-2', title: 'Revise Calculus limits for quiz', category: 'Exam prep', priority: 'High', dueDateText: 'Due in 4 days', completed: false },
  { id: 'tsk-3', title: 'Finish C programming pointers worksheet', category: 'Assignment', priority: 'Medium', dueDateText: 'Due in 2 days', completed: false },
];

export const FACULTY_DIRECTORY: FacultyContact[] = [
  { id: 'fac-1', name: 'Dr. Mithilesh', department: 'Mathematics & Computing', cabin: 'Faculty Block Cabin 204', officeHours: 'Mon & Thu, 14:00 – 16:00', email: 'mithilesh@iiitnr.edu.in' },
  { id: 'fac-2', name: 'Dr. Ruhul', department: 'Computer Science', cabin: 'Cabin 308', officeHours: 'Tue & Fri, 11:00 – 12:00', email: 'ruhul@iiitnr.edu.in' },
  { id: 'fac-3', name: 'Dr. Manoj', department: 'Electronics & Comm.', cabin: 'Cabin 112', officeHours: 'Wed, 14:00 – 16:00', email: 'manoj@iiitnr.edu.in' },
  { id: 'fac-4', name: 'Dr. Jaya Rahod', department: 'Mathematics', cabin: 'Cabin 210', officeHours: 'Mon, 11:00 – 13:00', email: 'jaya@iiitnr.edu.in' },
  { id: 'fac-5', name: 'Dr. Abhishek', department: 'Computer Science', cabin: 'Cabin 312', officeHours: 'Thu, 15:00 – 17:00', email: 'abhishek@iiitnr.edu.in' },
  { id: 'fac-6', name: 'Prof. Srinivasa', department: 'Computer Science', cabin: 'Lab 2 In-charge', officeHours: 'Tue, 10:00 – 12:00', email: 'srinivasa@iiitnr.edu.in' },
];

export const LOST_ITEMS: LostItem[] = [
  { id: 'lost-1', item: 'Black Casio fx-991CW Calculator', location: 'Room 138', timeAgo: 'Yesterday', status: 'Found' },
  { id: 'lost-2', item: 'Dell USB-C 65W Laptop Charger', location: 'Lab 1', timeAgo: '2 days ago', status: 'Found' },
];