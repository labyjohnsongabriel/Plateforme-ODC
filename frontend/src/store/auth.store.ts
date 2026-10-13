// src/store/auth.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/user.types';
import type { RoleName } from '@/types/role.types';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface AuthState {
  /* -------------------- ÉTAT -------------------- */
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  /* -------------------- ACTIONS -------------------- */
  setAuth: (payload: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User | null) => void;
  updateUser: (patch: Partial<User>) => void;
  clearAuth: () => void;
  markHydrated: () => void;

  /* -------------------- HELPERS -------------------- */
  hasRole: (roles: RoleName | RoleName[]) => boolean;
  isRole: (role: RoleName) => boolean;
  hasToken: () => boolean;
}

/* ============================================================================
   STORE
   ============================================================================ */

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      /* -------------------- ÉTAT INITIAL -------------------- */
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,

      /* -------------------- ACTIONS -------------------- */

      /**
       * ⭐ Action principale appelée après login/register.
       */
      setAuth: ({ user, accessToken, refreshToken }) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      updateUser: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : null,
        })),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      markHydrated: () => set({ isHydrated: true }),

      /* -------------------- HELPERS -------------------- */

      hasRole: (roles) => {
        const { user } = get();
        if (!user?.role?.nom) return false;
        const list = Array.isArray(roles) ? roles : [roles];
        return list.includes(user.role.nom as RoleName);
      },

      isRole: (role) => get().user?.role?.nom === role,

      hasToken: () => !!get().accessToken,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
      version: 1,
    },
  ),
);

/* ============================================================================
   HELPERS HORS REACT
   ============================================================================ */

export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function getCurrentUser(): User | null {
  return useAuthStore.getState().user;
}

export function isAuthenticated(): boolean {
  return useAuthStore.getState().isAuthenticated;
}

export function clearAuthState(): void {
  useAuthStore.getState().clearAuth();
}