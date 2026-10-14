// src/app/(admin)/admin/partenaires/hooks/usePartenaires.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface Partenaire {
  id: string;
  nom: string;
  slug: string;
  secteur?: string;
  description?: string;
  contactEmail?: string;
  contactTel?: string;
  siteWeb?: string;
  logoUrl?: string;
  actif: boolean;
  estPubliee: boolean;
  ordreAffichage: number;
  formationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PartenairesStats {
  total: number;
  published: number;
  draft: number;
  actifs: number;
  parSecteur: Array<{ secteur: string; count: number }>;
}

export interface PartenaireFormValues {
  nom: string;
  slug?: string;
  secteur?: string;
  description?: string;
  contactEmail?: string;
  contactTel?: string;
  siteWeb?: string;
  logoUrl?: string;
  actif: boolean;
  estPubliee: boolean;
  ordreAffichage: number;
}

export interface PartenaireFilters {
  search?: string;
  secteur?: string;
  statut?: 'all' | 'published' | 'draft';
  actif?: 'all' | 'yes' | 'no';
  sortBy?: 'nom' | 'ordre' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/* ============================================================================
   HELPERS
   ============================================================================ */

function extractList<T>(response: any): T[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

function extractItem<T>(response: any): T {
  if (response?.data?.data) return response.data.data;
  if (response?.data) return response.data;
  return response;
}

function extractPagination(response: any) {
  return (
    response?.pagination ??
    response?.data?.pagination ?? {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    }
  );
}

function normalizePartenaire(raw: any): Partenaire {
  return {
    id: String(raw?.id ?? raw?._id ?? ''),
    nom: raw?.nom ?? raw?.name ?? '',
    slug: raw?.slug ?? '',
    secteur: raw?.secteur ?? '',
    description: raw?.description ?? '',
    contactEmail: raw?.contactEmail ?? raw?.email ?? '',
    contactTel: raw?.contactTel ?? raw?.telephone ?? '',
    siteWeb: raw?.siteWeb ?? raw?.website ?? '',
    logoUrl: raw?.logoUrl ?? raw?.logo ?? undefined,
    actif: raw?.actif ?? raw?.active ?? true,
    estPubliee: raw?.estPubliee ?? raw?.published ?? false,
    ordreAffichage: Number(raw?.ordreAffichage ?? raw?.order ?? 0),
    formationsCount: Number(
      raw?.formationsCount ?? raw?._count?.formations ?? 0,
    ),
    createdAt: raw?.createdAt ?? new Date().toISOString(),
    updatedAt: raw?.updatedAt ?? new Date().toISOString(),
  };
}

function cleanFilters(filters?: PartenaireFilters): Record<string, any> {
  if (!filters) return {};

  const cleaned: Record<string, any> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value === 'all' ||
      value === '' ||
      value === undefined ||
      value === null
    ) {
      return;
    }
    cleaned[key] = value;
  });

  return cleaned;
}

/* ============================================================================
   CLÉS
   ============================================================================ */

export const partenaireKeys = {
  all: ['admin', 'partenaires'] as const,
  lists: () => [...partenaireKeys.all, 'list'] as const,
  list: (filters?: PartenaireFilters) =>
    [...partenaireKeys.lists(), filters] as const,
  details: () => [...partenaireKeys.all, 'detail'] as const,
  detail: (id: string) => [...partenaireKeys.details(), id] as const,
  stats: () => [...partenaireKeys.all, 'stats'] as const,
  secteurs: () => [...partenaireKeys.all, 'secteurs'] as const,
};

/* ============================================================================
   QUERIES
   ============================================================================ */

export function usePartenaires(filters?: PartenaireFilters) {
  return useQuery({
    queryKey: partenaireKeys.list(filters),
    queryFn: async () => {
      const params = cleanFilters(filters);
      const response = await api.get('/admin/partenaires', { params });
      return {
        data: extractList<any>(response).map(normalizePartenaire),
        pagination: extractPagination(response),
      };
    },
    staleTime: 30_000,
    retry: 1,
  });
}

export function usePartenaire(id: string | undefined) {
  return useQuery({
    queryKey: partenaireKeys.detail(id ?? ''),
    queryFn: async (): Promise<Partenaire> => {
      const response = await api.get(`/admin/partenaires/${id}`);
      return normalizePartenaire(extractItem<any>(response));
    },
    enabled: !!id,
    retry: 1,
  });
}

export function usePartenairesStats() {
  return useQuery({
    queryKey: partenaireKeys.stats(),
    queryFn: async (): Promise<PartenairesStats> => {
      try {
        const response = await api.get('/admin/partenaires/stats');
        const raw = extractItem<any>(response) ?? {};
        return {
          total: Number(raw?.total ?? 0),
          published: Number(raw?.published ?? 0),
          draft: Number(raw?.draft ?? 0),
          actifs: Number(raw?.actifs ?? 0),
          parSecteur: Array.isArray(raw?.parSecteur) ? raw.parSecteur : [],
        };
      } catch {
        // Fallback
        try {
          const response = await api.get('/admin/partenaires');
          const list = extractList<any>(response).map(normalizePartenaire);
          const secteurs = list.reduce(
            (acc, p) => {
              const s = p.secteur || 'Non classé';
              acc[s] = (acc[s] ?? 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          );
          return {
            total: list.length,
            published: list.filter((p) => p.estPubliee).length,
            draft: list.filter((p) => !p.estPubliee).length,
            actifs: list.filter((p) => p.actif).length,
            parSecteur: Object.entries(secteurs).map(([secteur, count]) => ({
              secteur,
              count,
            })),
          };
        } catch {
          return {
            total: 0,
            published: 0,
            draft: 0,
            actifs: 0,
            parSecteur: [],
          };
        }
      }
    },
    staleTime: 60_000,
    retry: 0,
  });
}

/* ============================================================================
   MUTATIONS
   ============================================================================ */

export function useCreatePartenaire() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PartenaireFormValues) => {
      const response = await api.post('/admin/partenaires', payload);
      return normalizePartenaire(extractItem<any>(response));
    },
    onSuccess: () => {
      toast.success('Partenaire créé avec succès');
      qc.invalidateQueries({ queryKey: partenaireKeys.lists() });
      qc.invalidateQueries({ queryKey: partenaireKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdatePartenaire(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<PartenaireFormValues>) => {
      const response = await api.put(`/admin/partenaires/${id}`, payload);
      return normalizePartenaire(extractItem<any>(response));
    },
    onSuccess: () => {
      toast.success('Partenaire mis à jour');
      qc.invalidateQueries({ queryKey: partenaireKeys.lists() });
      qc.invalidateQueries({ queryKey: partenaireKeys.detail(id) });
      qc.invalidateQueries({ queryKey: partenaireKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useTogglePublishPartenaire() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      estPubliee,
    }: {
      id: string;
      estPubliee: boolean;
    }) => {
      const response = await api.put(`/admin/partenaires/${id}/publier`, {
        estPubliee,
      });
      return normalizePartenaire(extractItem<any>(response));
    },
    onSuccess: (_, vars) => {
      toast.success(
        vars.estPubliee ? 'Partenaire publié' : 'Partenaire dépublié',
      );
      qc.invalidateQueries({ queryKey: partenaireKeys.lists() });
      qc.invalidateQueries({ queryKey: partenaireKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUploadLogoPartenaire(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('logo', file);
      const response = await api.post(
        `/admin/partenaires/${id}/logo`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return response.data?.data?.logoUrl ?? response.data?.logoUrl;
    },
    onSuccess: () => {
      toast.success('Logo mis à jour');
      qc.invalidateQueries({ queryKey: partenaireKeys.detail(id) });
      qc.invalidateQueries({ queryKey: partenaireKeys.lists() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeletePartenaire() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/partenaires/${id}`);
    },
    onSuccess: () => {
      toast.success('Partenaire supprimé');
      qc.invalidateQueries({ queryKey: partenaireKeys.lists() });
      qc.invalidateQueries({ queryKey: partenaireKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}