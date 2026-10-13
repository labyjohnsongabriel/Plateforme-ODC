// src/hooks/queries/useSessions.ts
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
  Session,
  SessionFilters,
  SessionCreateInput,
  SessionUpdateInput,
  PaginatedResponse,
} from '@/types/session.types';

/* ============================================================================
   QUERIES PUBLIQUES (sans auth) — ⭐ utilisées par SessionsList
   ============================================================================ */

/**
 * ⭐ Liste PUBLIQUE des sessions (calendrier public).
 * Endpoint : /public/sessions
 */
export function useSessionsPublic(filters?: SessionFilters) {
  return useQuery({
    queryKey: queryKeys.sessions.public(filters),
    queryFn: async () => {
      const { data } = await api.get<{
        data: PaginatedResponse<Session> | Session[];
      }>('/public/sessions', { params: filters });

      // Normalisation : accepte tableau OU objet paginé
      const payload = data.data;

      if (Array.isArray(payload)) {
        return {
          data: payload,
          pagination: {
            page: 1,
            limit: payload.length,
            total: payload.length,
            totalPages: 1,
          },
        } as PaginatedResponse<Session>;
      }

      return payload;
    },
    staleTime: 3 * 60_000,
    retry: 1,
  });
}

/**
 * ⭐ Liste PUBLIQUE infinie des sessions.
 */
export function useInfiniteSessionsPublic(filters?: SessionFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.sessions.publicInfinite(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get<{
        data: PaginatedResponse<Session>;
      }>('/public/sessions', {
        params: { ...filters, page: pageParam },
      });
      return data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
    staleTime: 3 * 60_000,
  });
}

/**
 * ⭐ Détail PUBLIC d'une session par code.
 */
export function useSessionPublic(codeSession: string) {
  return useQuery({
    queryKey: queryKeys.sessions.publicDetail(codeSession),
    queryFn: async () => {
      const { data } = await api.get<{ data: Session }>(
        `/public/sessions/${codeSession}`,
      );
      return data.data;
    },
    enabled: !!codeSession,
    staleTime: 3 * 60_000,
  });
}

/**
 * ⭐ Prochaines sessions publiques (homepage, widgets).
 */
export function useUpcomingSessionsPublic(limit = 6) {
  return useQuery({
    queryKey: queryKeys.sessions.publicUpcoming(limit),
    queryFn: async () => {
      const { data } = await api.get<{ data: Session[] }>(
        '/public/sessions/a-venir',
        { params: { limit } },
      );
      return data.data;
    },
    staleTime: 2 * 60_000,
  });
}

/**
 * ⭐ Sessions publiques d'une formation.
 */
export function useSessionsPublicByFormation(formationSlug: string) {
  return useQuery({
    queryKey: queryKeys.sessions.publicByFormation(formationSlug),
    queryFn: async () => {
      const { data } = await api.get<{ data: Session[] }>(
        `/public/sessions/formation/${formationSlug}`,
      );
      return data.data;
    },
    enabled: !!formationSlug,
    staleTime: 3 * 60_000,
  });
}

/* ============================================================================
   QUERIES PRIVÉES (back-office)
   ============================================================================ */

export function useSessions(filters?: SessionFilters) {
  return useQuery({
    queryKey: queryKeys.sessions.list(filters),
    queryFn: async () => {
      const { data } = await api.get<{ data: PaginatedResponse<Session> }>(
        '/sessions',
        { params: filters },
      );
      return data.data;
    },
    staleTime: 3 * 60_000,
  });
}

export function useInfiniteSessions(filters?: SessionFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.sessions.infinite(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get<{ data: PaginatedResponse<Session> }>(
        '/sessions',
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

export function useSession(codeSession: string) {
  return useQuery({
    queryKey: queryKeys.sessions.detail(codeSession),
    queryFn: async () => {
      const { data } = await api.get<{ data: Session }>(
        `/sessions/${codeSession}`,
      );
      return data.data;
    },
    enabled: !!codeSession,
    staleTime: 3 * 60_000,
  });
}

export function useSessionsByFormation(formationId: string) {
  return useQuery({
    queryKey: queryKeys.sessions.byFormation(formationId),
    queryFn: async () => {
      const { data } = await api.get<{ data: Session[] }>(
        `/sessions/formation/${formationId}`,
      );
      return data.data;
    },
    enabled: !!formationId,
  });
}

export function useUpcomingSessions(limit = 10) {
  return useQuery({
    queryKey: queryKeys.sessions.upcoming(limit),
    queryFn: async () => {
      const { data } = await api.get<{ data: Session[] }>(
        '/sessions/a-venir',
        { params: { limit } },
      );
      return data.data;
    },
    staleTime: 2 * 60_000,
  });
}

export function useSessionParticipants(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.sessions.participants(sessionId),
    queryFn: async () => {
      const { data } = await api.get(`/sessions/${sessionId}/participants`);
      return data.data;
    },
    enabled: !!sessionId,
  });
}

export function useSessionStats(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.sessions.stats(sessionId),
    queryFn: async () => {
      const { data } = await api.get(`/sessions/${sessionId}/stats`);
      return data.data;
    },
    enabled: !!sessionId,
  });
}

/* ============================================================================
   MUTATIONS
   ============================================================================ */

export function useCreateSession() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: SessionCreateInput) => {
      const { data } = await api.post<{ data: Session }>('/sessions', input);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Session créée');
      qc.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: SessionUpdateInput;
    }) => {
      const { data } = await api.put<{ data: Session }>(
        `/sessions/${id}`,
        input,
      );
      return data.data;
    },
    onSuccess: (session) => {
      toast.success('Session mise à jour');
      qc.invalidateQueries({ queryKey: queryKeys.sessions.all });
      qc.setQueryData(
        queryKeys.sessions.detail(session.codeSession),
        session,
      );
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sessions/${id}`);
    },
    onSuccess: () => {
      toast.success('Session supprimée');
      qc.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useOpenSession() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/sessions/${id}/ouvrir`);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Inscriptions ouvertes');
      qc.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useCloseSession() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/sessions/${id}/fermer`);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Inscriptions fermées');
      qc.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useCancelSession() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, motif }: { id: string; motif?: string }) => {
      const { data } = await api.put(`/sessions/${id}/annuler`, { motif });
      return data.data;
    },
    onSuccess: () => {
      toast.success('Session annulée');
      qc.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useGenerateSessionCode() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.get('/sessions/generer-code');
      return data.data.code as string;
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDuplicateSession() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/sessions/${id}/dupliquer`);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Session dupliquée');
      qc.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}