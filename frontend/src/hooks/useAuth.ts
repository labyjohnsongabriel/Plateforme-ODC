// src/hooks/useAuth.ts
'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';
import { useMessagerieStore } from '@/store/messagerie.store';
import { ROLE_DASHBOARD } from '@/lib/routes';
import { getErrorMessage } from '@/lib/error-handler';
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
} from '@/types/user.types';

/* ============================================================================
   INTERFACES
   ============================================================================ */
interface UseAuthReturn {
  // État
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;

  // Actions
  login: (input: LoginInput) => Promise<AuthResponse>;
  register: (input: RegisterInput) => Promise<AuthResponse>;
  logout: () => void;
  refetchUser: () => Promise<User>;
  goToDashboard: () => void;
  refreshToken: () => Promise<string>;

  // Flags de mutation
  isLoggingIn: boolean;
  isRegistering: boolean;
}

/* ============================================================================
   HOOK
   ============================================================================ */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    user,
    isAuthenticated,
    isHydrated,
    accessToken,
    setAuth,
    setUser,
    setTokens,
    clearAuth,
  } = useAuthStore();

  /* -------------------- LOGIN -------------------- */
  const loginMutation = useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await api.post<{ data: AuthResponse }>(
        '/auth/login',
        input,
      );
      return data.data;
    },
    onSuccess: (data) => {
      setAuth({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      // Invalider la query 'me' pour forcer un refetch
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success(`Bienvenue ${data.user.prenom} !`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  /* -------------------- REGISTER -------------------- */
  const registerMutation = useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { data } = await api.post<{ data: AuthResponse }>(
        '/auth/register',
        input,
      );
      return data.data;
    },
    onSuccess: (data) => {
      setAuth({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Compte créé avec succès');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  /* -------------------- REFRESH TOKEN -------------------- */
  const refreshTokenMutation = useMutation({
    mutationFn: async (): Promise<string> => {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) throw new Error('Aucun refresh token');

      const { data } = await api.post<{
        data: { accessToken: string; refreshToken: string };
      }>('/auth/refresh', { refreshToken });

      setTokens({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
      return data.data.accessToken;
    },
  });

  /* -------------------- LOGOUT -------------------- */
  const logout = useCallback(() => {
    clearAuth();
    useNotificationStore.getState().clear();
    useMessagerieStore.getState().clear();

    // Vider le cache React Query pour éviter les données périmées
    queryClient.clear();

    toast.success('Déconnexion réussie');
    router.push('/connexion');
  }, [clearAuth, router, queryClient]);

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

  /* -------------------- GO TO DASHBOARD -------------------- */
  const goToDashboard = useCallback(() => {
    if (!user) {
      router.push('/connexion');
      return;
    }v
    const target = ROLE_DASHBOARD[user.role.nom] ?? '/';
    router.push(target);
  }, [user, router]);

  /* -------------------- QUERY USER (rafraîchissement auto) -------------------- */
  const userQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get<{ data: User }>('/auth/me');
      return data.data;
    },
    enabled: !!accessToken,
    staleTime: 5 * 60_000,
    retry: false,
  });

  return {
    user: userQuery.data ?? user,
    isAuthenticated,
    isHydrated,
    isLoading: userQuery.isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    refetchUser,
    goToDashboard,
    refreshToken: refreshTokenMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}