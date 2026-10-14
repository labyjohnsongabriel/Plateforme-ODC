// src/app/(admin)/admin/formations/hooks/useFormations.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

/* ============================================================================
   TYPES
   ============================================================================ */

export type Niveau = 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';

export interface Formation {
  id: string;
  titre: string;
  slug: string;
  description: string;
  domaineId: string;
  domaine?: {
    id: string;
    nom: string;
    slug: string;
    couleur?: string;
  };
  niveau: Niveau;
  dureeHeures: number;
  prix?: number;
  nbParticipantsMax?: number;
  objectifs: string[];
  prerequis: string[];
  programme?: string;
  imageUrl?: string;
  estPubliee: boolean;
  actif: boolean;
  miseEnAvant: boolean;
  sessionsCount: number;
  inscriptionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormationsStats {
  total: number;
  published: number;
  draft: number;
  totalInscriptions: number;
  totalSessions: number;
}

export interface FormationFormValues {
  titre: string;
  slug?: string;
  description: string;
  domaineId: string;
  niveau: Niveau;
  dureeHeures: number;
  prix?: number;
  nbParticipantsMax?: number;
  objectifs: string[];
  prerequis: string[];
  programme?: string;
  imageUrl?: string;
  estPubliee: boolean;
  actif: boolean;
  miseEnAvant: boolean;
}

export interface FormationFilters {
  search?: string;
  domaineId?: string;
  niveau?: 'all' | Niveau;
  statut?: 'all' | 'published' | 'draft';
  sortBy?: 'titre' | 'niveau' | 'dureeHeures' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/* ============================================================================
   HELPERS DE NORMALISATION
   ============================================================================ */

/**
 * Convertit une valeur quelconque en tableau de chaînes non vides.
 * Tolère : tableau, string JSON, string séparée par virgules/points-virgules/sauts de ligne.
 */
export function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === 'string')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((v): v is string => typeof v === 'string')
            .map((s) => s.trim())
            .filter(Boolean);
        }
      } catch {
        /* ignore */
      }
    }

    return trimmed
      .split(/[,;\n\r]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
}

/** Extrait une liste depuis différentes formes de réponse API. */
function extractList<T>(response: any): T[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  return [];
}

/** Extrait un objet unique depuis différentes formes de réponse API. */
function extractItem<T>(response: any): T {
  if (response?.data?.data) return response.data.data;
  if (response?.data) return response.data;
  return response;
}

/**
 * Extrait un compteur depuis différentes formes possibles.
 */
function extractCount(raw: any, field: 'sessions' | 'inscriptions'): number {
  if (!raw) return 0;

  const countKeys =
    field === 'sessions'
      ? ['sessionsCount', 'nbSessions', 'totalSessions', 'sessions_count']
      : [
          'inscriptionsCount',
          'nbInscriptions',
          'totalInscriptions',
          'inscriptions_count',
        ];

  for (const key of countKeys) {
    if (typeof raw[key] === 'number') return raw[key];
    if (typeof raw[key] === 'string' && !isNaN(Number(raw[key]))) {
      return Number(raw[key]);
    }
  }

  if (raw?._count && typeof raw._count[field] === 'number') {
    return raw._count[field];
  }

  if (Array.isArray(raw?.[field])) {
    return raw[field].length;
  }

  if (raw?.stats && typeof raw.stats[field] === 'number') {
    return raw.stats[field];
  }

  return 0;
}

/** Normalise une formation. */
function normalizeFormation(raw: any): Formation {
  const domaine = raw?.domaine
    ? {
        id: String(raw.domaine.id ?? raw.domaine._id ?? ''),
        nom: raw.domaine.nom ?? raw.domaine.name ?? '',
        slug: raw.domaine.slug ?? '',
        couleur: raw.domaine.couleur ?? raw.domaine.color ?? '#FF7900',
      }
    : undefined;

  return {
    id: String(raw?.id ?? raw?._id ?? ''),
    titre: raw?.titre ?? raw?.title ?? '',
    slug: raw?.slug ?? '',
    description: raw?.description ?? '',
    domaineId: String(raw?.domaineId ?? raw?.domaine_id ?? ''),
    domaine,
    niveau: raw?.niveau ?? 'DEBUTANT',
    dureeHeures: Number(raw?.dureeHeures ?? raw?.duree ?? 0),
    prix: raw?.prix !== undefined ? Number(raw.prix) : undefined,
    nbParticipantsMax:
      raw?.nbParticipantsMax !== undefined
        ? Number(raw.nbParticipantsMax)
        : undefined,
    objectifs: toArray(raw?.objectifs),
    prerequis: toArray(raw?.prerequis),
    programme: raw?.programme ?? '',
    imageUrl: raw?.imageUrl ?? raw?.image ?? undefined,
    estPubliee: raw?.estPubliee ?? raw?.published ?? false,
    actif: raw?.actif ?? raw?.active ?? true,
    miseEnAvant: raw?.miseEnAvant ?? raw?.featured ?? false,
    sessionsCount: extractCount(raw, 'sessions'),
    inscriptionsCount: extractCount(raw, 'inscriptions'),
    createdAt: raw?.createdAt ?? new Date().toISOString(),
    updatedAt: raw?.updatedAt ?? new Date().toISOString(),
  };
}

/* ============================================================================
   CLÉS DE REQUÊTES
   ============================================================================ */

export const formationKeys = {
  all: ['admin', 'formations'] as const,
  lists: () => [...formationKeys.all, 'list'] as const,
  list: (filters?: FormationFilters) =>
    [...formationKeys.lists(), filters] as const,
  details: () => [...formationKeys.all, 'detail'] as const,
  detail: (id: string) => [...formationKeys.details(), id] as const,
  stats: () => [...formationKeys.all, 'stats'] as const,
};

/* ============================================================================
   QUERIES
   ============================================================================ */

export function useFormations(filters?: FormationFilters) {
  return useQuery({
    queryKey: formationKeys.list(filters),
    queryFn: async (): Promise<Formation[]> => {
      const response = await api.get('/admin/formations', { params: filters });
      return extractList<any>(response).map(normalizeFormation);
    },
    staleTime: 30_000,
    retry: 1,
  });
}

export function useFormation(id: string | undefined) {
  return useQuery({
    queryKey: formationKeys.detail(id ?? ''),
    queryFn: async (): Promise<Formation> => {
      const response = await api.get(`/admin/formations/${id}`);
      return normalizeFormation(extractItem<any>(response));
    },
    enabled: !!id,
    retry: 1,
  });
}

export function useFormationsStats() {
  return useQuery({
    queryKey: formationKeys.stats(),
    queryFn: async (): Promise<FormationsStats> => {
      try {
        const response = await api.get('/admin/formations/stats');
        const raw = extractItem<any>(response) ?? {};
        return {
          total: Number(raw?.total ?? 0),
          published: Number(raw?.published ?? raw?.publiees ?? 0),
          draft: Number(raw?.draft ?? raw?.brouillons ?? 0),
          totalInscriptions: Number(
            raw?.totalInscriptions ?? raw?.inscriptions ?? 0,
          ),
          totalSessions: Number(raw?.totalSessions ?? raw?.sessions ?? 0),
        };
      } catch {
        const response = await api.get('/admin/formations');
        const list = extractList<any>(response).map(normalizeFormation);
        return {
          total: list.length,
          published: list.filter((f) => f.estPubliee).length,
          draft: list.filter((f) => !f.estPubliee).length,
          totalInscriptions: list.reduce(
            (sum, f) => sum + (f.inscriptionsCount ?? 0),
            0,
          ),
          totalSessions: list.reduce(
            (sum, f) => sum + (f.sessionsCount ?? 0),
            0,
          ),
        };
      }
    },
    staleTime: 60_000,
    retry: 0,
  });
}

/* ============================================================================
   MUTATIONS
   ============================================================================ */

export function useCreateFormation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: FormationFormValues) => {
      const response = await api.post('/admin/formations', {
        ...payload,
        objectifs: toArray(payload.objectifs),
        prerequis: toArray(payload.prerequis),
      });
      return normalizeFormation(extractItem<any>(response));
    },
    onSuccess: () => {
      toast.success('Formation créée avec succès');
      qc.invalidateQueries({ queryKey: formationKeys.lists() });
      qc.invalidateQueries({ queryKey: formationKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateFormation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<FormationFormValues>) => {
      const response = await api.put(`/admin/formations/${id}`, {
        ...payload,
        ...(payload.objectifs !== undefined
          ? { objectifs: toArray(payload.objectifs) }
          : {}),
        ...(payload.prerequis !== undefined
          ? { prerequis: toArray(payload.prerequis) }
          : {}),
      });
      return normalizeFormation(extractItem<any>(response));
    },
    onSuccess: () => {
      toast.success('Formation mise à jour');
      qc.invalidateQueries({ queryKey: formationKeys.lists() });
      qc.invalidateQueries({ queryKey: formationKeys.detail(id) });
      qc.invalidateQueries({ queryKey: formationKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useTogglePublishFormation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      estPubliee,
    }: {
      id: string;
      estPubliee: boolean;
    }) => {
      await api.patch(`/admin/formations/${id}/publier`, { estPubliee });
    },
    onSuccess: (_, vars) => {
      toast.success(
        vars.estPubliee ? 'Formation publiée' : 'Formation dépubliée',
      );
      qc.invalidateQueries({ queryKey: formationKeys.lists() });
      qc.invalidateQueries({ queryKey: formationKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteFormation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/formations/${id}`);
    },
    onSuccess: () => {
      toast.success('Formation supprimée');
      qc.invalidateQueries({ queryKey: formationKeys.lists() });
      qc.invalidateQueries({ queryKey: formationKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}