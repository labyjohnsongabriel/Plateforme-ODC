// src/hooks/queries/useAttestations.ts
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
  Attestation,
  AttestationFilters,
  PaginatedResponse,
} from '@/types/attestation.types';

/* ============================================================================
   QUERIES
   ============================================================================ */

export function useAttestations(filters?: AttestationFilters) {
  return useQuery({
    queryKey: queryKeys.attestations.list(filters),
    queryFn: async () => {
      const { data } = await api.get<{
        data: PaginatedResponse<Attestation>;
      }>('/attestations', { params: filters });
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useAttestation(id: string) {
  return useQuery({
    queryKey: queryKeys.attestations.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Attestation }>(
        `/attestations/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });
}

export function useMyAttestations() {
  return useQuery({
    queryKey: queryKeys.attestations.mine,
    queryFn: async () => {
      const { data } = await api.get<{ data: Attestation[] }>(
        '/attestations/mes-attestations',
      );
      return data.data;
    },
  });
}

export function useAttestationByCode(code: string) {
  return useQuery({
    queryKey: queryKeys.attestations.byCode(code),
    queryFn: async () => {
      const { data } = await api.get<{ data: Attestation }>(
        `/attestations/verifier/${code}`,
      );
      return data.data;
    },
    enabled: !!code,
  });
}

export function useAttestationsBySession(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.attestations.bySession(sessionId),
    queryFn: async () => {
      const { data } = await api.get<{ data: Attestation[] }>(
        `/attestations/session/${sessionId}`,
      );
      return data.data;
    },
    enabled: !!sessionId,
  });
}

export function useAttestationsStats() {
  return useQuery({
    queryKey: queryKeys.attestations.stats,
    queryFn: async () => {
      const { data } = await api.get('/attestations/stats');
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

/* ============================================================================
   MUTATIONS
   ============================================================================ */

export function useGenerateAttestation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      inscriptionId,
      templateId,
    }: {
      inscriptionId: string;
      templateId?: string;
    }) => {
      const { data } = await api.post<{ data: Attestation }>(
        '/attestations/generer',
        { inscriptionId, templateId },
      );
      return data.data;
    },
    onSuccess: () => {
      toast.success('Attestation générée');
      qc.invalidateQueries({ queryKey: queryKeys.attestations.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useGenerateBulkAttestations() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await api.post(
        `/attestations/session/${sessionId}/generer-toutes`,
      );
      return data.data;
    },
    onSuccess: (data) => {
      toast.success(`${data.count ?? 0} attestation(s) générée(s)`);
      qc.invalidateQueries({ queryKey: queryKeys.attestations.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDownloadAttestation() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.get(`/attestations/${id}/telecharger`, {
        responseType: 'blob',
      });
      return response.data as Blob;
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attestation-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Attestation téléchargée');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useRevokeAttestation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, motif }: { id: string; motif?: string }) => {
      const { data } = await api.put(`/attestations/${id}/revoquer`, { motif });
      return data.data;
    },
    onSuccess: () => {
      toast.success('Attestation révoquée');
      qc.invalidateQueries({ queryKey: queryKeys.attestations.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useSendAttestationByEmail() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/attestations/${id}/envoyer-email`);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Attestation envoyée par email');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useVerifyAttestation() {
  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await api.post('/attestations/verifier', { code });
      return data.data;
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}