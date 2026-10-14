// src/contexts/AuthContext.tsx
'use client';

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-handler';

/* ⭐ CORRECTION : import de ROUTES_FLAT et ROUTES_ALIAS */
import {
  ROUTES,
  ROUTES_ALIAS,
  ROUTES_FLAT,
  getDashboardRoute,
} from '@/lib/routes';

import type { User } from '@/types/user.types';
import type { RoleName } from '@/types/role.types';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface RegisterInput {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  motDePasse: string;
  roleNom: 'PARTICIPANT' | 'PARTENAIRE';
}

export interface LoginInput {
  email: string;
  motDePasse: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthContextValue {
  /* État */
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;

  /* Actions */
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
  refetchUser: () => Promise<User>;
  goToDashboard: () => void;

  /* Helpers */
  hasRole: (roles: RoleName | RoleName[]) => boolean;
  isRole: (role: RoleName) => boolean;
  can: (permission: string) => boolean;
}

/* ============================================================================
   CONTEXT
   ============================================================================ */

const AuthContext = createContext<AuthContextValue | null>(null);

/* ============================================================================
   PROVIDER
   ============================================================================ */

interface AuthProviderProps {
  children: ReactNode;
  autoRedirect?: boolean;
}

export function AuthProvider({
  children,
  autoRedirect = false,
}: AuthProviderProps) {
  const router = useRouter();

  /* -------------------- SÉLECTEURS ZUSTAND -------------------- */
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  /* -------------------- LOGIN -------------------- */
  const login = useCallback(
    async (input: LoginInput): Promise<User> => {
      try {
        const { data } = await api.post<{ data: AuthResponse }>(
          '/auth/login',
          input,
        );

        const { user, accessToken, refreshToken } = data.data;

        setAuth({ user, accessToken, refreshToken });

        toast.success(`Bienvenue ${user.prenom} !`);

        if (autoRedirect) {
          router.push(getDashboardRoute(user.role?.nom));
        }

        return user;
      } catch (error) {
        toast.error(getErrorMessage(error));
        throw error;
      }
    },
    [setAuth, router, autoRedirect],
  );

  /* -------------------- REGISTER -------------------- */
  const register = useCallback(
    async (input: RegisterInput): Promise<User> => {
      try {
        const { data } = await api.post<{ data: AuthResponse }>(
          '/auth/register',
          input,
        );

        const { user, accessToken, refreshToken } = data.data;

        setAuth({ user, accessToken, refreshToken });

        toast.success('Compte créé avec succès ! Bienvenue 🎉');

        if (autoRedirect) {
          router.push(getDashboardRoute(user.role?.nom));
        }

        return user;
      } catch (error) {
        toast.error(getErrorMessage(error));
        throw error;
      }
    },
    [setAuth, router, autoRedirect],
  );

  /* -------------------- LOGOUT ⭐ CORRIGÉ -------------------- */
  const logout = useCallback(() => {
    clearAuth();
    toast.success('Déconnexion réussie');

    // ⭐⭐⭐ CORRECTION : utiliser ROUTES_FLAT.LOGIN
    router.push(ROUTES_FLAT.LOGIN);

    // Alternative : router.push(ROUTES_ALIAS.AUTH.LOGIN)
    // Alternative : router.push(ROUTES.auth.connexion)
  }, [clearAuth, router]);

  /* -------------------- REFETCH USER -------------------- */
  const refetchUser = useCallback(async (): Promise<User> => {
    try {
      const { data } = await api.get<{ data: User }>('/auth/me');
      setUser(data.data);
      return data.data;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  }, [setUser]);

  /* -------------------- GO TO DASHBOARD ⭐ CORRIGÉ -------------------- */
  const goToDashboard = useCallback(() => {
    if (!user) {
      // ⭐⭐⭐ CORRECTION : utiliser ROUTES_FLAT.LOGIN
      router.push(ROUTES_FLAT.LOGIN);
      return;
    }
    router.push(getDashboardRoute(user.role?.nom));
  }, [user, router]);

  /* -------------------- HAS ROLE -------------------- */
  const hasRole = useCallback(
    (roles: RoleName | RoleName[]): boolean => {
      if (!user?.role?.nom) return false;
      const list = Array.isArray(roles) ? roles : [roles];
      return list.includes(user.role.nom as RoleName);
    },
    [user],
  );

  /* -------------------- IS ROLE -------------------- */
  const isRole = useCallback(
    (role: RoleName): boolean => user?.role?.nom === role,
    [user],
  );

  /* -------------------- CAN -------------------- */
  const can = useCallback(
    (permission: string): boolean => {
      if (!user?.role) return false;
      const permissions =
        (user.role.permissions as any[])?.map((p) => p.code) ?? [];
      if (permissions.includes('*')) return true;
      return permissions.includes(permission);
    },
    [user],
  );

  /* -------------------- VÉRIFICATION SESSION AU MONTAGE -------------------- */
  useEffect(() => {
    if (!isHydrated) return;

    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) return;

    (async () => {
      try {
        const { data } = await api.get<{ data: User }>('/auth/me');
        setUser(data.data);
      } catch (error: any) {
        if (error?.response?.status === 401) {
          clearAuth();
        }
      }
    })();
  }, [isHydrated, setUser, clearAuth]);

  /* -------------------- VALEUR MÉMOÏSÉE -------------------- */
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isHydrated,
      isLoading: !isHydrated,

      login,
      register,
      logout,
      refetchUser,
      goToDashboard,

      hasRole,
      isRole,
      can,
    }),
    [
      user,
      isAuthenticated,
      isHydrated,
      login,
      register,
      logout,
      refetchUser,
      goToDashboard,
      hasRole,
      isRole,
      can,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ============================================================================
   HOOKS
   ============================================================================ */

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      "useAuthContext doit être utilisé à l'intérieur de <AuthProvider>",
    );
  }
  return ctx;
}

/** Alias */
export const useAuth = useAuthContext;

/* ============================================================================
   HOOKS DÉRIVÉS
   ============================================================================ */

export function useIsAuthenticated(): boolean {
  const { isAuthenticated, isHydrated } = useAuthContext();
  return isAuthenticated && isHydrated;
}

export function useCurrentRole(): RoleName | undefined {
  const { user } = useAuthContext();
  return user?.role?.nom as RoleName | undefined;
}

export function useHasRole(roles: RoleName | RoleName[]): boolean {
  const { hasRole } = useAuthContext();
  return hasRole(roles);
}

export function useCan(permission: string): boolean {
  const { can } = useAuthContext();
  return can(permission);
}