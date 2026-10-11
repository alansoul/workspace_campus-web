// src/features/auth/hooks/useAuthSession.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserSession, LoginPayload } from '../types/auth.types';
import { authService } from '../services/auth.service';

export interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Fallback prevents runtime crashes if called during early hydration
const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  refreshSession: async () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchSession = async () => {
    try {
      const res = await authService.getCurrentSession();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    authService
      .getCurrentSession()
      .then((res) => {
        if (isSubscribed) setUser(res.user);
      })
      .catch(() => {
        if (isSubscribed) setUser(null);
      })
      .finally(() => {
        if (isSubscribed) setIsLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  const login = async (payload: LoginPayload) => {
    const res = await authService.login(payload);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshSession: fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthSession(): AuthContextType {
  const context = useContext(AuthContext);
  return context ?? defaultAuthContext;
}

export default useAuthSession;