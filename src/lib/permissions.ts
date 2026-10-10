// src/lib/permissions.ts
import { UserSession } from '@/features/auth/types/auth.types';

export const Permissions = {
  // Institutional only (requires claimed university)
  canAccessAcademics: (user: UserSession | null): boolean => {
    return user?.accountType === 'INSTITUTIONAL' && !!user.universityId;
  },

  // Open to both Institutional and Individual Gmail users
  canAccessFreelance: (user: UserSession | null): boolean => {
    return !!user;
  },

  // University channels require institutional domain; public lounge open to all
  canAccessCampusChat: (user: UserSession | null): boolean => {
    return user?.accountType === 'INSTITUTIONAL';
  },

  // Institutional Governance Console: Campus admin or platform super admin
  canAccessAdminConsole: (user: UserSession | null): boolean => {
    return (
      user?.accountType === 'INSTITUTIONAL' &&
      (user.role === 'CAMPUS_ADMIN' || user.role === 'SUPER_ADMIN')
    );
  },
};