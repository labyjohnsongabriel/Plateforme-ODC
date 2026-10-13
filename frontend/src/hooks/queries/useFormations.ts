// src/hooks/queries/useFormations.ts
'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/error-handler';
import type {
  Formation,
  FormationFilters,
  FormationCreateInput,
  FormationUpdateInput,
  PaginatedResponse,
} from '@/types/formation.types';

/* ============================================================================
   QUERIES PUBLIQUES (sans auth)
   ============================================================================ */

/**
 * ⭐ Liste PUBLIQUE des formations (endpoint /public/formations).
 * Utilisée par FormationGrid sur le site public.
 */
export function useFormationsPublic(filters?: FormationFilters) {
  return useQuery({
    queryKey: ['formations', 'public', filters],
    queryFn: async () => {
      const { data } = await api.get<{
        data: PaginatedResponse<Formation> | Formation[];
      }>('/public/formations', { params: filters });

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
        } as PaginatedResponse<Formation>;
      }

      return payload;
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

/**
 * ⭐ Liste PUBLIQUE infinie (scroll infini sur le catalogue).
 */
export function useInfiniteFormationsPublic(filters?: FormationFilters) {
  return useInfiniteQuery({
    queryKey: ['formations', 'public', 'infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get<{
        data: PaginatedResponse<Formation>;
      }>('/public/formations', {
        params: { ...filters, page: pageParam },
      });
      return data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
    staleTime: 5 * 60_000,
  });
}

/**
 * ⭐ Détail PUBLIC d'une formation par slug.
 */
export function useFormationPublic(slug: string) {
  return useQuery({
    queryKey: ['formations', 'public', 'detail', slug],
    queryFn: async () => {
      const { data } = await api.get<{ data: Formation }>(
        `/public/formations/${slug}`,
      );
      return data.data;
    },
    enabled: !!slug,
    staleTime: 5 * 60_000,
  });
}

/**
 * ⭐ Formations publiques mises en avant.
 */
export function useFormationsPublicFeatured(limit = 6) {
  return useQuery({
    queryKey: ['formations', 'public', 'featured', limit],
    queryFn: async () => {
      const { data } = await api.get<{ data: Formation[] }>(
        '/public/formations/mises-en-avant',
        { params: { limit } },
      );
      return data.data;
    },
    staleTime: 10 * 60_000,
  });
}

/**
 * ⭐ Domaines disponibles publiquement (pour les filtres).
 */
export function useDomainesPublic() {
  return useQuery({
    queryKey: ['domaines', 'public'],
    queryFn: async () => {
      const { data } = await api.get<{ data: any[] }>('/public/domaines');
      return data.data;
    },
    staleTime: 10 * 60_000,
  });
}

/* ============================================================================
   QUERIES PRIVÉES (avec auth)
   ============================================================================ */

/**
 * Liste paginée des formations avec filtres (back-office).
 */
export function useFormations(
  filters?: FormationFilters,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Formation>>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: queryKeys.formations.list(filters),
    queryFn: async () => {
      const { data } = await api.get<{ data: PaginatedResponse<Formation> }>(
        '/formations',
        { params: filters },
      );
      return data.data;
    },
    staleTime: 5 * 60_000,
    ...options,
  });
}

/**
 * Liste infinie (back-office).
 */
export function useInfiniteFormations(filters?: FormationFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.formations.infinite(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get<{ data: PaginatedResponse<Formation> }>(
        '/formations',
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

/**
 * Détail d'une formation par slug (back-office).
 */
export function useFormation(
  slug: string,
  options?: Omit<UseQueryOptions<Formation>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: queryKeys.formations.detail(slug),
    queryFn: async () => {
      const { data } = await api.get<{ data: Formation }>(
        `/formations/${slug}`,
      );
      return data.data;
    },
    enabled: !!slug,
    staleTime: 5 * 60_000,
    ...options,
  });
}

/**
 * Formations mises en avant (back-office).
 */
export function useFeaturedFormations(limit = 6) {
  return useQuery({
    queryKey: queryKeys.formations.featured(limit),
    queryFn: async () => {
      const { data } = await api.get<{ data: Formation[] }>(
        '/formations/mises-en-avant',
        { params: { limit } },
      );
      return data.data;
    },
    staleTime: 10 * 60_000,
  });
}

/**
 * Formations par domaine (back-office).
 */
export function useFormationsByDomaine(domaineId: string, limit = 10) {
  return useQuery({
    queryKey: queryKeys.formations.byDomaine(domaineId),
    queryFn: async () => {
      const { data } = await api.get<{ data: Formation[] }>(
        `/formations/domaine/${domaineId}`,
        { params: { limit } },
      );
      return data.data;
    },
    enabled: !!domaineId,
  });
}

/**
 * Statistiques formations (back-office).
 */
export function useFormationsStats() {
  return useQuery({
    queryKey: queryKeys.formations.stats,
    queryFn: async () => {
      const { data } = await api.get('/formations/stats');
      return data.data;
    },
    staleTime: 10 * 60_000,
  });
}

/* ============================================================================
   MUTATIONS
   ============================================================================ */

export function useCreateFormation(
  options?: UseMutationOptions<Formation, Error, FormationCreateInput>,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: FormationCreateInput) => {
      const { data } = await api.post<{ data: Formation }>(
        '/formations',
        input,
      );
      return data.data;
    },
    onSuccess: (formation) => {
      toast.success('Formation créée avec succès');
      qc.invalidateQueries({ queryKey: queryKeys.formations.all });
      qc.invalidateQueries({ queryKey: ['formations', 'public'] });
      qc.setQueryData(
        queryKeys.formations.detail(formation.slug),
        formation,
      );
    },
    onError: (e) => toast.error(getErrorMessage(e)),
    ...options,
  });
}

export function useUpdateFormation(
  options?: UseMutationOptions<
    Formation,
    Error,
    { id: string; input: FormationUpdateInput }
  >,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }) => {
      const { data } = await api.put<{ data: Formation }>(
        `/formations/${id}`,
        input,
      );
      return data.data;
    },
    onSuccess: (formation) => {
      toast.success('Formation mise à jour');
      qc.invalidateQueries({ queryKey: queryKeys.formations.all });
      qc.invalidateQueries({ queryKey: ['formations', 'public'] });
      qc.setQueryData(
        queryKeys.formations.detail(formation.slug),
        formation,
      );
    },
    onError: (e) => toast.error(getErrorMessage(e)),
    ...options,
  });
}

export function useDeleteFormation(
  options?: UseMutationOptions<void, Error, string>,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/formations/${id}`);
    },
    onSuccess: () => {
      toast.success('Formation supprimée');
      qc.invalidateQueries({ queryKey: queryKeys.formations.all });
      qc.invalidateQueries({ queryKey: ['formations', 'public'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
    ...options,
  });
}

export function usePublishFormation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, publier }: { id: string; publier: boolean }) => {
      const { data } = await api.put(`/formations/${id}/publication`, {
        publier,
      });
      return data.data;
    },
    onSuccess: (_, { publier }) => {
      toast.success(publier ? 'Formation publiée' : 'Formation dépubliée');
      qc.invalidateQueries({ queryKey: queryKeys.formations.all });
      qc.invalidateQueries({ queryKey: ['formations', 'public'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useToggleMiseEnAvant() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      miseEnAvant,
    }: {
      id: string;
      miseEnAvant: boolean;
    }) => {
      const { data } = await api.put(`/formations/${id}/mise-en-avant`, {
        miseEnAvant,
      });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.formations.all });
      qc.invalidateQueries({ queryKey: ['formations', 'public'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUploadFormationImage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post(`/formations/${id}/image`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      toast.success('Image téléversée');
      qc.invalidateQueries({ queryKey: queryKeys.formations.all });
      qc.invalidateQueries({ queryKey: ['formations', 'public'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}