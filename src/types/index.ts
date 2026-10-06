export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
  universityId: string;
  universityName?: string;
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  semester: number;
  branch: string;
  fileUrl: string;
  author: { fullName: string };
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  client: { fullName: string };
}