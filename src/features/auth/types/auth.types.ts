export type AccountType = 'INSTITUTIONAL' | 'INDIVIDUAL';

export type UserRole =
  | 'STUDENT'
  | 'FACULTY'
  | 'ADMIN'
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
  institutionalEmail?: string | null;
}

export interface DomainResolution {
  isRegistered: boolean;
  universityId?: string;
  universityName?: string;
  isGmail?: boolean;
  isUniversity?: boolean;
  logoUrl?: string;
  requiresOtp?: boolean;
  errorMessage?: string;
  allowed?: boolean;
  domain?: string;
  university?: {
    id: string;
    name: string;
    shortCode?: string;
    logoUrl?: string | null;
  } | null;
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