// src/hooks/queries/usePresences.ts
'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/error-handler';
import type {
  Presence,
  PresenceFilters,
  PresenceBulkInput,
  PresenceStatus,
} from '@/types/presence.types';

/* ============================================================================
   QUERIES
   ============================================================================ */

export function usePresences(filters?: PresenceFilters) {
  return useQuery({
    queryKey: queryKeys.presences.list(filters),
    queryFn: async () => {
      const { data } = await api.get('/presences', { params: filters });
      return data.data;
    },
    staleTime: 60_000,
  });
}

export function usePresence(id: string) {
  return useQuery({
    queryKey: queryKeys.presences.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Presence }>(`/presences/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function usePresencesBySession(
  sessionId: string,
  date?: string,
) {
  return useQuery({
    queryKey: queryKeys.presences.bySession(sessionId, date),
    queryFn: async () => {
      const { data } = await api.get<{ data: Presence[] }>(
        `/presences/session/${sessionId}`,
        { params: date ? { date } : undefined },
      );
      return data.data;
    },
    enabled: !!sessionId,
    refetchInterval: 30_000,
  });
}

export function useMyPresences() {
  return useQuery({
    queryKey: queryKeys.presences.mine,
    queryFn: async () => {
      const { data } = await api.get<{ data: Presence[] }>(
        '/presences/mes-presences',
      );
      return data.data;
    },
  });
}

export function useSessionAttendanceRate(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.presences.attendanceRate(sessionId),
    queryFn: async () => {
      const { data } = await api.get(
        `/presences/session/${sessionId}/taux-presence`,
      );
      return data.data;
    },
    enabled: !!sessionId,
  });
}

export function usePresencesStats(sessionId?: string) {
  return useQuery({
    queryKey: queryKeys.presences.stats(sessionId),
    queryFn: async () => {
      const { data } = await api.get('/presences/stats', {
        params: sessionId ? { sessionId } : undefined,
      });
      return data.data;
    },
  });
}

/* ============================================================================
   MUTATIONS
   ============================================================================ */

export function useMarkPresence() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      inscriptionId,
      statut,
      commentaire,
    }: {
      inscriptionId: string;
      statut: PresenceStatus;
      commentaire?: string;
    }) => {
      const { data } = await api.post('/presences', {
        inscriptionId,
        statut,
        commentaire,
      });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.presences.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useBulkMarkPresence() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: PresenceBulkInput) => {
      const { data } = await api.post('/presences/bulk', input);
      return data.data;
    },
    onSuccess: (data) => {
      toast.success(
        `${data.count ?? 0} présence(s) enregistrée(s)`,
      );
      qc.invalidateQueries({ queryKey: queryKeys.presences.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdatePresence() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      statut,
      commentaire,
    }: {
      id: string;
      statut?: PresenceStatus;
      commentaire?: string;
    }) => {
      const { data } = await api.put(`/presences/${id}`, {
        statut,
        commentaire,
      });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.presences.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeletePresence() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/presences/${id}`);
    },
    onSuccess: () => {
      toast.success('Présence supprimée');
      qc.invalidateQueries({ queryKey: queryKeys.presences.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useExportPresences() {
  return useMutation({
    mutationFn: async ({
      sessionId,
      format = 'csv',
    }: {
      sessionId: string;
      format?: 'csv' | 'xlsx' | 'pdf';
    }) => {
      const response = await api.get(
        `/presences/session/${sessionId}/export`,
        { params: { format }, responseType: 'blob' },
      );
      return response.data as Blob;
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presences-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Export téléchargé');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}