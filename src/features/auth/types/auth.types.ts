// src/features/auth/types/auth.types.ts
export type AccountType = 'INSTITUTIONAL' | 'INDIVIDUAL';

export type UserRole =
  | 'STUDENT'
  | 'FACULTY'
  | 'CAMPUS_ADMIN'
  | 'SUPER_ADMIN'
  | 'INDIVIDUAL';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  accountType: AccountType;
  avatarUrl?: string;
  universityId?: string | null;
  universityName?: string | null;
  universityDomain?: string | null;
}

export interface DomainResolution {
  isRegistered: boolean;
  universityId?: string;
  universityName?: string;
  logoUrl?: string;
  requiresOtp?: boolean;
}

export interface LoginPayload {
  email: string;
  password?: string;
  otp?: string;
}

export interface AuthResponse {
  user: UserSession;
  token?: string;
}