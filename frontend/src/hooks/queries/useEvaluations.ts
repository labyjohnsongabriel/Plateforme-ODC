// src/hooks/queries/useEvaluations.ts
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
  Evaluation,
  EvaluationFilters,
  EvaluationCreateInput,
  PaginatedResponse,
} from '@/types/evaluation.types';

/* ============================================================================
   QUERIES
   ============================================================================ */

export function useEvaluations(filters?: EvaluationFilters) {
  return useQuery({
    queryKey: queryKeys.evaluations.list(filters),
    queryFn: async () => {
      const { data } = await api.get<{
        data: PaginatedResponse<Evaluation>;
      }>('/evaluations', { params: filters });
      return data.data;
    },
    staleTime: 3 * 60_000,
  });
}

export function useEvaluation(id: string) {
  return useQuery({
    queryKey: queryKeys.evaluations.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Evaluation }>(
        `/evaluations/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });
}

export function useEvaluationsByFormation(formationId: string) {
  return useQuery({
    queryKey: queryKeys.evaluations.byFormation(formationId),
    queryFn: async () => {
      const { data } = await api.get<{ data: Evaluation[] }>(
        `/evaluations/formation/${formationId}`,
      );
      return data.data;
    },
    enabled: !!formationId,
  });
}

export function useEvaluationsBySession(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.evaluations.bySession(sessionId),
    queryFn: async () => {
      const { data } = await api.get<{ data: Evaluation[] }>(
        `/evaluations/session/${sessionId}`,
      );
      return data.data;
    },
    enabled: !!sessionId,
  });
}

export function useMyEvaluations() {
  return useQuery({
    queryKey: queryKeys.evaluations.mine,
    queryFn: async () => {
      const { data } = await api.get<{ data: Evaluation[] }>(
        '/evaluations/mes-evaluations',
      );
      return data.data;
    },
  });
}

export function useEvaluationStats(formationId?: string) {
  return useQuery({
    queryKey: queryKeys.evaluations.stats(formationId),
    queryFn: async () => {
      const { data } = await api.get('/evaluations/stats', {
        params: formationId ? { formationId } : undefined,
      });
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useFormationRating(formationId: string) {
  return useQuery({
    queryKey: queryKeys.evaluations.rating(formationId),
    queryFn: async () => {
      const { data } = await api.get(
        `/evaluations/formation/${formationId}/note-moyenne`,
      );
      return data.data;
    },
    enabled: !!formationId,
    staleTime: 10 * 60_000,
  });
}

/* ============================================================================
   MUTATIONS
   ============================================================================ */

export function useCreateEvaluation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: EvaluationCreateInput) => {
      const { data } = await api.post<{ data: Evaluation }>(
        '/evaluations',
        input,
      );
      return data.data;
    },
    onSuccess: () => {
      toast.success('Évaluation envoyée, merci !');
      qc.invalidateQueries({ queryKey: queryKeys.evaluations.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateEvaluation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: Partial<EvaluationCreateInput>;
    }) => {
      const { data } = await api.put(`/evaluations/${id}`, input);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Évaluation mise à jour');
      qc.invalidateQueries({ queryKey: queryKeys.evaluations.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteEvaluation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/evaluations/${id}`);
    },
    onSuccess: () => {
      toast.success('Évaluation supprimée');
      qc.invalidateQueries({ queryKey: queryKeys.evaluations.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function usePublishEvaluation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/evaluations/${id}/publier`);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Évaluation publiée');
      qc.invalidateQueries({ queryKey: queryKeys.evaluations.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useExportEvaluations() {
  return useMutation({
    mutationFn: async ({
      formationId,
      format = 'csv',
    }: {
      formationId: string;
      format?: 'csv' | 'xlsx' | 'pdf';
    }) => {
      const response = await api.get(
        `/evaluations/formation/${formationId}/export`,
        { params: { format }, responseType: 'blob' },
      );
      return response.data as Blob;
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evaluations-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Export téléchargé');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}