'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useAuthStore } from '@/store/auth.store';
import type { User } from '@/types/user.types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  /* Sélecteurs individuels — plus robuste que la déstructuration */
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isHydrated,
    isLoading: !isHydrated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext doit être utilisé dans <AuthProvider>');
  }
  return ctx;
}