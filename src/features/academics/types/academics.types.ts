export type AcademicTab =
  | 'dashboard'
  | 'timetable'
  | 'calendar'
  | 'subjects'
  | 'drive'
  | 'assignments'
  | 'practicals'
  | 'exams'
  | 'attendance'
  | 'notices'
  | 'events'
  | 'tasks'
  | 'resources'
  | 'profile'
  | 'plugins';

  export interface McpConnector {
  id: string;
  name: string;
  icon: string;
  developer: string;
  category: 'Communication' | 'Productivity' | 'Development' | 'Academic LMS';
  description: string;
  capabilities: string[];
  samplePrompts: string[];
  isConnected: boolean;
  connectedAccount?: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sourceConnector?: string;
}

export type EventCategory =
  | 'All'
  | 'Workshop'
  | 'Hackathon'
  | 'Competition'
  | 'Seminar'
  | 'Club'
  | 'Cultural'
  | 'Holiday';

export type AssignmentStatus = 'All' | 'Not Started' | 'In Progress' | 'Submitted' | 'Overdue';
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type ClassType = 'Theory' | 'Practical' | 'Tutorial';

// Replace StudentProfile in src/features/academics/types/academics.types.ts:

export interface StudentProfile {
  id: string;
  name: string;
  avatarText: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  rollNumber: string;
  branch: string;
  semester: number;
  section: string;
  email: string;
  personalEmail?: string;
  collegeName: string;
  academicYear: string;
  batch?: string;
  mentor: string;
  cgpa?: string;
  skills?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  avgAttendance: number;
  syllabusCovered: number;
  assignmentsSubmitted: string;
  practicalsDone: string;
  openTasksCount: number;
}

export interface ScheduleSlot {
  id: string;
  subjectName: string;
  code: string;
  type: ClassType;
  startTime: string;
  endTime: string;
  room: string;
  faculty: string;
  isToday?: boolean;
}

export interface DayTimetable {
  day: string;
  dateStr: string;
  classCount: number;
  isToday: boolean;
  slots: ScheduleSlot[];
}

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
  faculty: string;
  credits: number;
  classesPerWeek: number;
  assignmentsCount: number;
  filesCount: number;
  unitsCompleted: number;
  totalUnits: number;
  attendancePct: number;
}

export interface DriveFile {
  id: string;
  name: string;
  subject: string;
  category: 'Lectures' | 'Notes' | 'Assignments' | 'Practicals' | 'Question Papers';
  size: string;
  uploadDate: string;
  author: string;
  isStarred: boolean;
  fileUrl?: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  subject: string;
  status: 'Not Started' | 'In Progress' | 'Submitted' | 'Overdue';
  priority: PriorityLevel;
  description: string;
  faculty: string;
  issuedDate: string;
  dueDate: string;
  relativeDue: string;
  attachments: string[];
}

export interface PracticalExperiment {
  id: string;
  subject: string;
  experimentNumber: number;
  title: string;
  labRoom: string;
  faculty: string;
  sessionDate: string;
  recordDueDate: string;
  relativeDue: string;
  tags: string[];
  completed: boolean;
}

export interface ExamItem {
  id: string;
  title: string;
  subject: string;
  type: 'Quiz' | 'Mid-semester' | 'Practical' | 'Internal assessment' | 'End-semester';
  dateStr: string;
  timeStr: string;
  room: string;
  syllabus: string;
  relativeNotice: string;
  isNextUp?: boolean;
}

export interface AttendanceSubject {
  subject: string;
  attendancePct: number;
  totalClasses: number;
  attended: number;
  missed: number;
  statusText: string;
  isWarning: boolean;
}

export interface CampusNotice {
  id: string;
  title: string;
  category: 'Examination' | 'Administration' | 'Clubs' | 'Academic' | 'Hostel';
  dateStr: string;
  summary: string;
  attachmentName?: string;
  isImportant?: boolean;
  isUnread?: boolean;
}

export interface CampusEvent {
  id: string;
  title: string;
  category: EventCategory;
  timingBadge: string;
  description: string;
  dateTimeStr: string;
  venue: string;
  isInterested: boolean;
}

export interface AcademicTask {
  id: string;
  title: string;
  category: 'Assignment' | 'Exam prep' | 'Practical' | 'Personal' | 'Reminder';
  priority: PriorityLevel;
  dueDateText: string;
  completed: boolean;
}

export interface FacultyContact {
  id: string;
  name: string;
  department: string;
  cabin: string;
  officeHours: string;
  email: string;
}

export interface LostItem {
  id: string;
  item: string;
  location: string;
  timeAgo: string;
  status: 'Found' | 'Lost';
}