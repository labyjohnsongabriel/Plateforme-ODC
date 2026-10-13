// src/hooks/queries/useDomaines.ts
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
  Domaine,
  DomaineCreateInput,
  DomaineUpdateInput,
} from '@/types/domaine.types';

/* ============================================================================
   QUERIES PUBLIQUES (sans auth) — ⭐ utilisées par FormationFilters
   ============================================================================ */

/**
 * ⭐ Liste PUBLIQUE des domaines (pour les filtres du catalogue).
 * Endpoint : /public/domaines
 */
export function useDomainesPublic(
  options?: Omit<UseQueryOptions<Domaine[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['domaines', 'public'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Domaine[] }>('/public/domaines');
      return data.data;
    },
    staleTime: 10 * 60_000,
    retry: 1,
    ...options,
  });
}

/**
 * ⭐ Détail PUBLIC d'un domaine par slug.
 */
export function useDomainePublic(slug: string) {
  return useQuery({
    queryKey: ['domaines', 'public', 'detail', slug],
    queryFn: async () => {
      const { data } = await api.get<{ data: Domaine }>(
        `/public/domaines/${slug}`,
      );
      return data.data;
    },
    enabled: !!slug,
    staleTime: 10 * 60_000,
  });
}

/* ============================================================================
   QUERIES PRIVÉES (back-office)
   ============================================================================ */

/**
 * Liste complète des domaines (back-office).
 */
export function useDomaines(
  options?: Omit<UseQueryOptions<Domaine[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: queryKeys.domaines.list,
    queryFn: async () => {
      const { data } = await api.get<{ data: Domaine[] }>('/domaines');
      return data.data;
    },
    staleTime: 10 * 60_000,
    ...options,
  });
}

/**
 * Détail d'un domaine par ID.
 */
export function useDomaine(
  id: string,
  options?: Omit<UseQueryOptions<Domaine>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: queryKeys.domaines.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Domaine }>(`/domaines/${id}`);
      return data.data;
    },
    enabled: !!id,
    staleTime: 10 * 60_000,
    ...options,
  });
}

/**
 * Détail d'un domaine par slug (back-office).
 */
export function useDomaineBySlug(slug: string) {
  return useQuery({
    queryKey: ['domaines', 'slug', slug],
    queryFn: async () => {
      const { data } = await api.get<{ data: Domaine }>(
        `/domaines/slug/${slug}`,
      );
      return data.data;
    },
    enabled: !!slug,
    staleTime: 10 * 60_000,
  });
}

/**
 * Statistiques par domaine.
 */
export function useDomainesStats() {
  return useQuery({
    queryKey: ['domaines', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/domaines/stats');
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

/**
 * Domaines avec compteur de formations.
 */
export function useDomainesWithCount() {
  return useQuery({
    queryKey: ['domaines', 'with-count'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Domaine[] }>(
        '/domaines/avec-compteur',
      );
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

/* ============================================================================
   MUTATIONS
   ============================================================================ */

export function useCreateDomaine(
  options?: UseMutationOptions<Domaine, Error, DomaineCreateInput>,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: DomaineCreateInput) => {
      const { data } = await api.post<{ data: Domaine }>('/domaines', input);
      return data.data;
    },
    onSuccess: () => {
      toast.success('Domaine créé');
      qc.invalidateQueries({ queryKey: queryKeys.domaines.all });
      qc.invalidateQueries({ queryKey: ['domaines', 'public'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
    ...options,
  });
}

export function useUpdateDomaine(
  options?: UseMutationOptions<
    Domaine,
    Error,
    { id: string; input: DomaineUpdateInput }
  >,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }) => {
      const { data } = await api.put<{ data: Domaine }>(
        `/domaines/${id}`,
        input,
      );
      return data.data;
    },
    onSuccess: (domaine) => {
      toast.success('Domaine mis à jour');
      qc.invalidateQueries({ queryKey: queryKeys.domaines.all });
      qc.invalidateQueries({ queryKey: ['domaines', 'public'] });
      qc.setQueryData(queryKeys.domaines.detail(domaine.id), domaine);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
    ...options,
  });
}

export function useDeleteDomaine(
  options?: UseMutationOptions<void, Error, string>,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/domaines/${id}`);
    },
    onSuccess: () => {
      toast.success('Domaine supprimé');
      qc.invalidateQueries({ queryKey: queryKeys.domaines.all });
      qc.invalidateQueries({ queryKey: ['domaines', 'public'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
    ...options,
  });
}

export function useToggleDomaineActif() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, actif }: { id: string; actif: boolean }) => {
      const { data } = await api.put(`/domaines/${id}/actif`, { actif });
      return data.data;
    },
    onSuccess: (_, { actif }) => {
      toast.success(actif ? 'Domaine activé' : 'Domaine désactivé');
      qc.invalidateQueries({ queryKey: queryKeys.domaines.all });
      qc.invalidateQueries({ queryKey: ['domaines', 'public'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useReorderDomaines() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const { data } = await api.put('/domaines/reorder', { orderedIds });
      return data.data;
    },
    onSuccess: () => {
      toast.success('Ordre mis à jour');
      qc.invalidateQueries({ queryKey: queryKeys.domaines.all });
      qc.invalidateQueries({ queryKey: ['domaines', 'public'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}