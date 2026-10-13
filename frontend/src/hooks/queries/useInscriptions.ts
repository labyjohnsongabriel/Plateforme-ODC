// src/hooks/queries/useInscriptions.ts
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
  Inscription,
  InscriptionFilters,
  InscriptionCreateInput,
  PaginatedResponse,
} from '@/types/inscription.types';

/* ============================================================================
   QUERIES
   ============================================================================ */

export function useInscriptions(filters?: InscriptionFilters) {
  return useQuery({
    queryKey: queryKeys.inscriptions.list(filters),
    queryFn: async () => {
      const { data } = await api.get<{
        data: PaginatedResponse<Inscription>;
      }>('/inscriptions', { params: filters });
      return data.data;
    },
    staleTime: 2 * 60_000,
  });
}

export function useInscription(id: string) {
  return useQuery({
    queryKey: queryKeys.inscriptions.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Inscription }>(
        `/inscriptions/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });
}

export function useMyInscriptions() {
  return useQuery({
    queryKey: queryKeys.inscriptions.mine,
    queryFn: async () => {
      const { data } = await api.get<{ data: Inscription[] }>(
        '/inscriptions/mes-inscriptions',
      );
      return data.data;
    },
  });
}

export function useInscriptionsBySession(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.inscriptions.bySession(sessionId),
    queryFn: async () => {
      const { data } = await api.get<{ data: Inscription[] }>(
        `/inscriptions/session/${sessionId}`,
      );
      return data.data;
    },
    enabled: !!sessionId,
  });
}

export function useInscriptionsByUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.inscriptions.byUser(userId),
    queryFn: async () => {
      const { data } = await api.get<{ data: Inscription[] }>(
        `/inscriptions/user/${userId}`,
      );
      return data.data;
    },
    enabled: !!userId,
  });
}

export function useInscriptionsStats(sessionId?: string) {
  return useQuery({
    queryKey: queryKeys.inscriptions.stats(sessionId),
    queryFn: async () => {
      const { data } = await api.get('/inscriptions/stats', {
        params: sessionId ? { sessionId } : undefined,
      });
      return data.data;
    },
  });
}

/* ============================================================================
   MUTATIONS
   ============================================================================ */

export function useCreateInscription() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: InscriptionCreateInput) => {
      const { data } = await api.post<{ data: Inscription }>(
        '/inscriptions',
        input,
      );
      return data.data;
    },
    onSuccess: () => {
      toast.success('Inscription enregistrée');
      qc.invalidateQueries({ queryKey: queryKeys.inscriptions.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useCancelInscription() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, motif }: { id: string; motif?: string }) => {
      await api.put(`/inscriptions/${id}/annuler`, { motif });
    },
    onSuccess: () => {
      toast.success('Inscription annulée');
      qc.invalidateQueries({ queryKey: queryKeys.inscriptions.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useAcceptInscription() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/inscriptions/${id}/accepter`);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Inscription acceptée');
      qc.invalidateQueries({ queryKey: queryKeys.inscriptions.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useRejectInscription() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, motif }: { id: string; motif?: string }) => {
      const { data } = await api.put(`/inscriptions/${id}/refuser`, { motif });
      return data.data;
    },
    onSuccess: () => {
      toast.success('Inscription refusée');
      qc.invalidateQueries({ queryKey: queryKeys.inscriptions.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useBulkAcceptInscriptions() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { data } = await api.put('/inscriptions/bulk/accepter', { ids });
      return data.data;
    },
    onSuccess: (_, ids) => {
      toast.success(`${ids.length} inscription(s) acceptée(s)`);
      qc.invalidateQueries({ queryKey: queryKeys.inscriptions.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useBulkRejectInscriptions() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, motif }: { ids: string[]; motif?: string }) => {
      const { data } = await api.put('/inscriptions/bulk/refuser', {
        ids,
        motif,
      });
      return data.data;
    },
    onSuccess: (_, { ids }) => {
      toast.success(`${ids.length} inscription(s) refusée(s)`);
      qc.invalidateQueries({ queryKey: queryKeys.inscriptions.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useAddToWaitlist() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/inscriptions/${id}/liste-attente`);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Ajouté à la liste d\'attente');
      qc.invalidateQueries({ queryKey: queryKeys.inscriptions.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useExportInscriptions() {
  return useMutation({
    mutationFn: async ({
      sessionId,
      format = 'csv',
    }: {
      sessionId: string;
      format?: 'csv' | 'xlsx' | 'pdf';
    }) => {
      const response = await api.get(
        `/inscriptions/session/${sessionId}/export`,
        { params: { format }, responseType: 'blob' },
      );
      return response.data as Blob;
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inscriptions-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Export téléchargé');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}