// src/hooks/queries/useUsers.ts
'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/error-handler';
import type {
  User,
  UserFilters,
  UserCreateInput,
  UserUpdateInput,
  PaginatedResponse,
} from '@/types/user.types';

/* ============================================================================
   QUERIES
   ============================================================================ */

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: async () => {
      const { data } = await api.get<{ data: PaginatedResponse<User> }>(
        '/users',
        { params: filters },
      );
      return data.data;
    },
    staleTime: 3 * 60_000,
  });
}

export function useInfiniteUsers(filters?: UserFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.users.infinite(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get<{ data: PaginatedResponse<User> }>(
        '/users',
        { params: { ...filters, page: pageParam } },
      );
      return data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: User }>(`/users/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: async () => {
      const { data } = await api.get<{ data: User }>('/auth/me');
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useUsersByRole(role: string, limit = 50) {
  return useQuery({
    queryKey: queryKeys.users.byRole(role),
    queryFn: async () => {
      const { data } = await api.get<{ data: User[] }>(
        `/users/role/${role}`,
        { params: { limit } },
      );
      return data.data;
    },
    enabled: !!role,
  });
}

export function useUsersStats() {
  return useQuery({
    queryKey: queryKeys.users.stats,
    queryFn: async () => {
      const { data } = await api.get('/users/stats');
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

/* ============================================================================
   MUTATIONS
   ============================================================================ */

export function useCreateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: UserCreateInput) => {
      const { data } = await api.post<{ data: User }>('/users', input);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Utilisateur créé');
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UserUpdateInput;
    }) => {
      const { data } = await api.put<{ data: User }>(`/users/${id}`, input);
      return data.data;
    },
    onSuccess: (user) => {
      toast.success('Utilisateur mis à jour');
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
      qc.setQueryData(queryKeys.users.detail(user.id), user);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      toast.success('Utilisateur supprimé');
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useActivateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/users/${id}/activer`);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Compte activé');
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/users/${id}/desactiver`);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Compte désactivé');
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useChangeUserRole() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { data } = await api.put(`/users/${id}/role`, { role });
      return data.data;
    },
    onSuccess: () => {
      toast.success('Rôle modifié');
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('photo', file);
      const { data } = await api.post('/users/me/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      toast.success('Photo mise à jour');
      qc.invalidateQueries({ queryKey: queryKeys.users.me });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<UserUpdateInput>) => {
      const { data } = await api.put<{ data: User }>('/users/me', input);
      return data.data;
    },
    onSuccess: (user) => {
      toast.success('Profil mis à jour');
      qc.setQueryData(queryKeys.users.me, user);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}