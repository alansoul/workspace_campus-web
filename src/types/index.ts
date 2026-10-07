export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  branch?: string;
  role: 'STUDENT' | 'FACULTY' | 'CLUB_HEAD' | 'ADMIN' | 'SUPER_ADMIN';
  universityId: string;
  universityName?: string;
  isEmailVerified: boolean;
}

export interface DomainResolution {
  allowed: boolean;
  domain?: string;
  error?: string;
  university?: {
    id: string;
    name: string;
    shortCode: string;
    logoUrl?: string;
  };
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  semester: number;
  branch: string;
  fileUrl: string;
  downloads: number;
  authorId: string;
  author: { fullName: string };
  createdAt: string;
}

export interface Question {
  id: string;
  title: string;
  subject: string;
  description: string;
  authorId: string;
  author: { fullName: string };
  createdAt: string;
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  clientId: string;
  client: { fullName: string };
  createdAt: string;
}