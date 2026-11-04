'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
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

  // Stable session refresher for manual calls
  const refreshSession = useCallback(async () => {
    try {
      const res = await authService.getCurrentSession();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Safe async hydration on mount
  useEffect(() => {
    let isSubscribed = true;

    async function initializeSession() {
      try {
        const res = await authService.getCurrentSession();
        if (isSubscribed) {
          setUser(res.user);
        }
      } catch {
        if (isSubscribed) {
          setUser(null);
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    initializeSession();

    return () => {
      isSubscribed = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authService.login(payload);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors during sign-out cleanup
    } finally {
      setUser(null);

      if (typeof document !== 'undefined') {
        document.cookie =
          'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie =
          'account_type=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }

      if (typeof window !== 'undefined') {
        // Clear cached academic data, timetable caches, and MCP credentials from localStorage
        const keysToRemove = Object.keys(localStorage).filter(
          (key) => key.startsWith('campus_') || key.startsWith('mcp_') || key.startsWith('auth_'),
        );
        keysToRemove.forEach((key) => localStorage.removeItem(key));

        const currentPath = window.location.pathname;

        // Smart landing pages (/chat, /academics, /freelance) stay on that path to show public landing UI
        if (
          currentPath.startsWith('/chat') ||
          currentPath.startsWith('/academics') ||
          currentPath.startsWith('/freelance')
        ) {
          router.replace(currentPath);
          router.refresh();
        } else {
          // Private pages preserve the return target URL when sending user to login
          const redirectTarget = encodeURIComponent(
            currentPath + window.location.search,
          );
          router.replace(`/login?redirect=${redirectTarget}`);
          router.refresh();
        }
      } else {
        router.replace('/login');
      }
    }
  }, [router]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshSession,
    }),
    [user, isLoading, login, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthSession(): AuthContextType {
  const context = useContext(AuthContext);
  return context ?? defaultAuthContext;
}

export default useAuthSession;