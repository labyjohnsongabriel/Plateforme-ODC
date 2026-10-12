// src/hooks/queries/usePartenaires.ts
'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/error-handler';
import type {
  Partenaire,
  PartenaireFilters,
  PartenaireCreateInput,
  PartenaireUpdateInput,
  PaginatedResponse,
} from '@/types/partenaire.types';

/* ============================================================================
   QUERIES PUBLIQUES (sans auth) — ⭐ utilisées par PartenairesGrid
   ============================================================================ */

/**
 * ⭐ Liste PUBLIQUE des partenaires (annuaire public).
 * Endpoint : /public/partenaires
 */
export function usePartenairesPublic(
  filters?: PartenaireFilters,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Partenaire> | Partenaire[]>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: ['partenaires', 'public', filters],
    queryFn: async () => {
      const { data } = await api.get<{
        data: PaginatedResponse<Partenaire> | Partenaire[];
      }>('/public/partenaires', { params: filters });

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
        } as PaginatedResponse<Partenaire>;
      }

      return payload;
    },
    staleTime: 10 * 60_000,
    retry: 1,
    ...options,
  });
}

/**
 * ⭐ Détail PUBLIC d'un partenaire.
 */
export function usePartenairePublic(idOrSlug: string) {
  return useQuery({
    queryKey: ['partenaires', 'public', 'detail', idOrSlug],
    queryFn: async () => {
      const { data } = await api.get<{ data: Partenaire }>(
        `/public/partenaires/${idOrSlug}`,
      );
      return data.data;
    },
    enabled: !!idOrSlug,
    staleTime: 10 * 60_000,
  });
}

/**
 * ⭐ Partenaires mis en avant.
 */
export function usePartenairesPublicFeatured(limit = 6) {
  return useQuery({
    queryKey: ['partenaires', 'public', 'featured', limit],
    queryFn: async () => {
      const { data } = await api.get<{ data: Partenaire[] }>(
        '/public/partenaires/mis-en-avant',
        { params: { limit } },
      );
      return data.data;
    },
    staleTime: 10 * 60_000,
  });
}

/* ============================================================================
   QUERIES PRIVÉES (back-office / partenaire)
   ============================================================================ */

export function usePartenaires(filters?: PartenaireFilters) {
  return useQuery({
    queryKey: queryKeys.partenaires.list(filters),
    queryFn: async () => {
      const { data } = await api.get<{
        data: PaginatedResponse<Partenaire>;
      }>('/partenaires', { params: filters });
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function usePartenaire(id: string) {
  return useQuery({
    queryKey: queryKeys.partenaires.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Partenaire }>(
        `/partenaires/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Fiche du partenaire connecté (espace partenaire).
 */
export function useMyFichePartenaire() {
  return useQuery({
    queryKey: queryKeys.partenaires.fiche,
    queryFn: async () => {
      const { data } = await api.get<{ data: Partenaire }>(
        '/partenaire/fiche',
      );
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function usePartenairesStats() {
  return useQuery({
    queryKey: queryKeys.partenaires.stats,
    queryFn: async () => {
      const { data } = await api.get('/partenaires/stats');
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

/* ============================================================================
   MUTATIONS
   ============================================================================ */

export function useCreatePartenaire(
  options?: UseMutationOptions<Partenaire, Error, PartenaireCreateInput>,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: PartenaireCreateInput) => {
      const { data } = await api.post<{ data: Partenaire }>(
        '/partenaires',
        input,
      );
      return data.data;
    },
    onSuccess: () => {
      toast.success('Partenaire créé');
      qc.invalidateQueries({ queryKey: queryKeys.partenaires.all });
      qc.invalidateQueries({ queryKey: ['partenaires', 'public'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
    ...options,
  });
}

export function useUpdatePartenaire(
  options?: UseMutationOptions<
    Partenaire,
    Error,
    { id: string; input: PartenaireUpdateInput }
  >,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }) => {
      const { data } = await api.put<{ data: Partenaire }>(
        `/partenaires/${id}`,
        input,
      );
      return data.data;
    },
    onSuccess: (partenaire) => {
      toast.success('Partenaire mis à jour');
      qc.invalidateQueries({ queryKey: queryKeys.partenaires.all });
      qc.invalidateQueries({ queryKey: ['partenaires', 'public'] });
      qc.setQueryData(
        queryKeys.partenaires.detail(partenaire.id),
        partenaire,
      );
    },
    onError: (e) => toast.error(getErrorMessage(e)),
    ...options,
  });
}

/**
 * Mise à jour de la fiche du partenaire connecté.
 */
export function useUpdateMyFichePartenaire() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: PartenaireUpdateInput) => {
      const { data } = await api.put<{ data: Partenaire }>(
        '/partenaire/fiche',
        input,
      );
      return data.data;
    },
    onSuccess: () => {
      toast.success('Fiche mise à jour');
      qc.invalidateQueries({ queryKey: queryKeys.partenaires.fiche });
      qc.invalidateQueries({ queryKey: ['partenaires', 'public'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeletePartenaire(
  options?: UseMutationOptions<void, Error, string>,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/partenaires/${id}`);
    },
    onSuccess: () => {
      toast.success('Partenaire supprimé');
      qc.invalidateQueries({ queryKey: queryKeys.partenaires.all });
      qc.invalidateQueries({ queryKey: ['partenaires', 'public'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
    ...options,
  });
}

export function usePublishPartenaire() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, publier }: { id: string; publier: boolean }) => {
      const { data } = await api.put(`/partenaires/${id}/publication`, {
        publier,
      });
      return data.data;
    },
    onSuccess: (_, { publier }) => {
      toast.success(publier ? 'Partenaire publié' : 'Partenaire dépublié');
      qc.invalidateQueries({ queryKey: queryKeys.partenaires.all });
      qc.invalidateQueries({ queryKey: ['partenaires', 'public'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUploadPartenaireLogo() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const fd = new FormData();
      fd.append('logo', file);
      const { data } = await api.post(`/partenaires/${id}/logo`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      toast.success('Logo mis à jour');
      qc.invalidateQueries({ queryKey: queryKeys.partenaires.all });
      qc.invalidateQueries({ queryKey: queryKeys.partenaires.fiche });
      qc.invalidateQueries({ queryKey: ['partenaires', 'public'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}