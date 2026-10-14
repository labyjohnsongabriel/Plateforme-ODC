'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

/* ============================================================================
   TYPES LOCAUX
   ============================================================================ */

export interface Domaine {
  id: string;
  nom: string;
  slug: string;
  description?: string;
  couleur: string;
  icone?: string;
  imageUrl?: string;
  actif: boolean;
  estPubliee: boolean;
  ordreAffichage: number;
  formationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DomainesStats {
  total: number;
  published: number;
  draft: number;
  totalFormations: number;
}

export interface DomaineFormValues {
  nom: string;
  slug?: string;
  description?: string;
  couleur: string;
  icone?: string;
  actif: boolean;
  estPubliee: boolean;
  ordreAffichage: number;
}

export interface DomaineFilters {
  search?: string;
  statut?: 'all' | 'published' | 'draft' | 'archived';
  sortBy?: 'nom' | 'formations' | 'ordre' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/* ============================================================================
   HELPERS DE NORMALISATION
   ============================================================================ */

/**
 * Extrait le tableau depuis différentes formes de réponse API.
 * Tolère : { data: [...] }, { data: { data: [...] } }, [...]
 */
function extractList<T>(response: any): T[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  return [];
}

/**
 * Extrait un objet unique depuis différentes formes de réponse API.
 */
function extractItem<T>(response: any): T {
  if (response?.data?.data) return response.data.data;
  if (response?.data) return response.data;
  return response;
}

/**
 * Normalise un domaine (champs optionnels, valeurs par défaut).
 */
function normalizeDomaine(raw: any): Domaine {
  return {
    id: String(raw?.id ?? raw?._id ?? ''),
    nom: raw?.nom ?? raw?.name ?? '',
    slug: raw?.slug ?? '',
    description: raw?.description ?? '',
    couleur: raw?.couleur ?? raw?.color ?? '#FF7900',
    icone: raw?.icone ?? raw?.icon ?? '',
    imageUrl: raw?.imageUrl ?? raw?.image ?? undefined,
    actif: raw?.actif ?? raw?.active ?? true,
    estPubliee: raw?.estPubliee ?? raw?.published ?? false,
    ordreAffichage: raw?.ordreAffichage ?? raw?.order ?? 0,
    formationsCount:
      raw?.formationsCount ??
      raw?._count?.formations ??
      raw?.formations?.length ??
      0,
    createdAt: raw?.createdAt ?? new Date().toISOString(),
    updatedAt: raw?.updatedAt ?? new Date().toISOString(),
  };
}

/* ============================================================================
   CLÉS DE REQUÊTES
   ============================================================================ */

export const domaineKeys = {
  all: ['admin', 'domaines'] as const,
  lists: () => [...domaineKeys.all, 'list'] as const,
  list: (filters?: DomaineFilters) =>
    [...domaineKeys.lists(), filters] as const,
  details: () => [...domaineKeys.all, 'detail'] as const,
  detail: (id: string) => [...domaineKeys.details(), id] as const,
  stats: () => [...domaineKeys.all, 'stats'] as const,
};

/* ============================================================================
   QUERIES
   ============================================================================ */

export function useDomaines(filters?: DomaineFilters) {
  return useQuery({
    queryKey: domaineKeys.list(filters),
    queryFn: async (): Promise<Domaine[]> => {
      const response = await api.get('/admin/domaines', { params: filters });
      const list = extractList<any>(response);
      return list.map(normalizeDomaine);
    },
    staleTime: 30_000,
    retry: 1,
  });
}

export function useDomaine(id: string | undefined) {
  return useQuery({
    queryKey: domaineKeys.detail(id ?? ''),
    queryFn: async (): Promise<Domaine> => {
      const response = await api.get(`/admin/domaines/${id}`);
      const item = extractItem<any>(response);
      return normalizeDomaine(item);
    },
    enabled: !!id,
    retry: 1,
  });
}

export function useDomainesStats() {
  return useQuery({
    queryKey: domaineKeys.stats(),
    queryFn: async (): Promise<DomainesStats> => {
      try {
        const response = await api.get('/admin/domaines/stats');
        const raw = extractItem<any>(response) ?? {};

        return {
          total: raw?.total ?? 0,
          published: raw?.published ?? raw?.publies ?? 0,
          draft: raw?.draft ?? raw?.brouillons ?? 0,
          totalFormations:
            raw?.totalFormations ?? raw?.formations ?? 0,
        };
      } catch {
        /* Fallback : dériver les stats depuis la liste si l'endpoint n'existe pas */
        const response = await api.get('/admin/domaines');
        const list = extractList<any>(response).map(normalizeDomaine);

        return {
          total: list.length,
          published: list.filter((d) => d.estPubliee).length,
          draft: list.filter((d) => !d.estPubliee).length,
          totalFormations: list.reduce(
            (sum, d) => sum + (d.formationsCount ?? 0),
            0,
          ),
        };
      }
    },
    staleTime: 60_000,
    retry: 0, // Ne pas retry car on a déjà un fallback
  });
}

/* ============================================================================
   MUTATIONS
   ============================================================================ */

export function useCreateDomaine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DomaineFormValues) => {
      const response = await api.post('/admin/domaines', payload);
      return extractItem<Domaine>(response);
    },
    onSuccess: () => {
      toast.success('Domaine créé avec succès');
      qc.invalidateQueries({ queryKey: domaineKeys.lists() });
      qc.invalidateQueries({ queryKey: domaineKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateDomaine(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<DomaineFormValues>) => {
      const response = await api.put(`/admin/domaines/${id}`, payload);
      return extractItem<Domaine>(response);
    },
    onSuccess: () => {
      toast.success('Domaine mis à jour');
      qc.invalidateQueries({ queryKey: domaineKeys.lists() });
      qc.invalidateQueries({ queryKey: domaineKeys.detail(id) });
      qc.invalidateQueries({ queryKey: domaineKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useTogglePublishDomaine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      estPubliee,
    }: {
      id: string;
      estPubliee: boolean;
    }) => {
      await api.patch(`/admin/domaines/${id}/publier`, { estPubliee });
    },
    onSuccess: (_, vars) => {
      toast.success(vars.estPubliee ? 'Domaine publié' : 'Domaine dépublié');
      qc.invalidateQueries({ queryKey: domaineKeys.lists() });
      qc.invalidateQueries({ queryKey: domaineKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteDomaine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/domaines/${id}`);
    },
    onSuccess: () => {
      toast.success('Domaine supprimé');
      qc.invalidateQueries({ queryKey: domaineKeys.lists() });
      qc.invalidateQueries({ queryKey: domaineKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}