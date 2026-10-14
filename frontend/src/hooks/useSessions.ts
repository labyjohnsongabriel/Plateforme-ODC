// src/app/(admin)/admin/sessions/hooks/useSessions.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

/* ============================================================================
   TYPES
   ============================================================================ */

export type StatutSession =
  | 'PLANIFIEE'
  | 'OUVERTE'
  | 'EN_COURS'
  | 'TERMINEE'
  | 'ANNULEE';

export const STATUTS_SESSION: readonly StatutSession[] = [
  'PLANIFIEE',
  'OUVERTE',
  'EN_COURS',
  'TERMINEE',
  'ANNULEE',
] as const;

export const STATUTS_SESSION_LABELS: Record<StatutSession, string> = {
  PLANIFIEE: 'Planifiée',
  OUVERTE: 'Ouverte',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
};

export interface Session {
  id: string;
  codeSession: string;
  formationId: string;
  formation?: { id: string; titre: string; slug: string };
  formateurId?: string;
  formateur?: { id: string; prenom: string; nom: string; email: string };
  dateDebut: string;
  dateFin: string;
  lieu?: string;
  lienVisio?: string;
  capacite: number;
  statut: StatutSession;
  notes?: string;
  imageUrl?: string;
  estPubliee: boolean;
  presenceOuverte: boolean;
  dateOuvertureInscriptions?: string;
  dateFermetureInscriptions?: string;
  inscriptionsCount: number;
  presencesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SessionsStats {
  total: number;
  planifiees: number;
  ouvertes: number;
  enCours: number;
  terminees: number;
  annulees: number;
  totalInscriptions: number;
}

export interface SessionFormValues {
  formationId: string;
  formateurId?: string;
  codeSession?: string;
  dateDebut: string;
  dateFin: string;
  lieu?: string;
  lienVisio?: string;
  capacite: number;
  statut: StatutSession;
  notes?: string;
  imageUrl?: string;
  estPubliee: boolean;
  dateOuvertureInscriptions?: string;
  dateFermetureInscriptions?: string;
}

export interface SessionFilters {
  search?: string;
  statut?: 'all' | StatutSession;
  formationId?: string;
  formateurId?: string;
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
  if (Array.isArray(response?.results)) return response.results;
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

function extractCount(raw: any, field: 'inscriptions' | 'presences'): number {
  if (!raw) return 0;

  const keys =
    field === 'inscriptions'
      ? ['inscriptionsCount', 'nbInscriptions', 'totalInscriptions']
      : ['presencesCount', 'nbPresences', 'totalPresences'];

  for (const key of keys) {
    if (typeof raw[key] === 'number') return raw[key];
  }

  if (raw?._count && typeof raw._count[field] === 'number') {
    return raw._count[field];
  }

  if (Array.isArray(raw?.[field])) return raw[field].length;

  return 0;
}

function normalizeSession(raw: any): Session {
  return {
    id: String(raw?.id ?? raw?._id ?? ''),
    codeSession: raw?.codeSession ?? '',
    formationId: String(raw?.formationId ?? raw?.formation_id ?? ''),
    formation: raw?.formation
      ? {
          id: String(raw.formation.id ?? raw.formation._id ?? ''),
          titre: raw.formation.titre ?? '',
          slug: raw.formation.slug ?? '',
        }
      : undefined,
    formateurId: raw?.formateurId
      ? String(raw.formateurId)
      : raw?.formateur_id
        ? String(raw.formateur_id)
        : undefined,
    formateur: raw?.formateur
      ? {
          id: String(raw.formateur.id ?? ''),
          prenom: raw.formateur.prenom ?? '',
          nom: raw.formateur.nom ?? '',
          email: raw.formateur.email ?? '',
        }
      : undefined,
    dateDebut: raw?.dateDebut ?? '',
    dateFin: raw?.dateFin ?? '',
    lieu: raw?.lieu ?? '',
    lienVisio: raw?.lienVisio ?? '',
    capacite: Number(raw?.capacite ?? 0),
    statut: (raw?.statut as StatutSession) ?? 'PLANIFIEE',
    notes: raw?.notes ?? '',
    imageUrl: raw?.imageUrl ?? undefined,
    estPubliee: raw?.estPubliee ?? false,
    presenceOuverte: raw?.presenceOuverte ?? false,
    dateOuvertureInscriptions: raw?.dateOuvertureInscriptions ?? undefined,
    dateFermetureInscriptions: raw?.dateFermetureInscriptions ?? undefined,
    inscriptionsCount: extractCount(raw, 'inscriptions'),
    presencesCount: extractCount(raw, 'presences'),
    createdAt: raw?.createdAt ?? new Date().toISOString(),
    updatedAt: raw?.updatedAt ?? new Date().toISOString(),
  };
}

function cleanFilters(filters?: SessionFilters): Record<string, any> {
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
    if (Array.isArray(value) && value.length === 0) return;
    cleaned[key] = value;
  });

  return cleaned;
}

/* ============================================================================
   CLÉS DE REQUÊTES
   ============================================================================ */

export const sessionKeys = {
  all: ['admin', 'sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: (filters?: SessionFilters) =>
    [...sessionKeys.lists(), filters] as const,
  details: () => [...sessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
  stats: () => [...sessionKeys.all, 'stats'] as const,
  options: () => [...sessionKeys.all, 'options'] as const,
};

/* ============================================================================
   QUERIES
   ============================================================================ */

export function useSessions(filters?: SessionFilters) {
  return useQuery({
    queryKey: sessionKeys.list(filters),
    queryFn: async () => {
      const params = cleanFilters(filters);
      const response = await api.get('/admin/sessions', { params });
      return {
        data: extractList<any>(response).map(normalizeSession),
        pagination: extractPagination(response),
      };
    },
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useSession(id: string | undefined) {
  return useQuery({
    queryKey: sessionKeys.detail(id ?? ''),
    queryFn: async (): Promise<Session> => {
      const response = await api.get(`/admin/sessions/${id}`);
      return normalizeSession(extractItem<any>(response));
    },
    enabled: !!id,
    retry: 1,
  });
}

export function useSessionsStats() {
  return useQuery({
    queryKey: sessionKeys.stats(),
    queryFn: async (): Promise<SessionsStats> => {
      try {
        const response = await api.get('/admin/sessions/stats');
        const raw = extractItem<any>(response) ?? {};
        return {
          total: Number(raw?.total ?? 0),
          planifiees: Number(raw?.planifiees ?? 0),
          ouvertes: Number(raw?.ouvertes ?? 0),
          enCours: Number(raw?.enCours ?? 0),
          terminees: Number(raw?.terminees ?? 0),
          annulees: Number(raw?.annulees ?? 0),
          totalInscriptions: Number(raw?.totalInscriptions ?? 0),
        };
      } catch {
        // ✅ Fallback silencieux : dériver depuis la liste
        try {
          const response = await api.get('/admin/sessions');
          const list = extractList<any>(response).map(normalizeSession);
          return {
            total: list.length,
            planifiees: list.filter((s) => s.statut === 'PLANIFIEE').length,
            ouvertes: list.filter((s) => s.statut === 'OUVERTE').length,
            enCours: list.filter((s) => s.statut === 'EN_COURS').length,
            terminees: list.filter((s) => s.statut === 'TERMINEE').length,
            annulees: list.filter((s) => s.statut === 'ANNULEE').length,
            totalInscriptions: list.reduce(
              (sum, s) => sum + s.inscriptionsCount,
              0,
            ),
          };
        } catch {
          return {
            total: 0,
            planifiees: 0,
            ouvertes: 0,
            enCours: 0,
            terminees: 0,
            annulees: 0,
            totalInscriptions: 0,
          };
        }
      }
    },
    staleTime: 60_000,
    retry: 0,
    refetchOnWindowFocus: false,
  });
}

/* ============================================================================
   MUTATIONS — ⭐ PUT pour toutes les actions
   ============================================================================ */

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SessionFormValues) => {
      const response = await api.post('/admin/sessions', payload);
      return normalizeSession(extractItem<any>(response));
    },
    onSuccess: () => {
      toast.success('Session créée avec succès');
      qc.invalidateQueries({ queryKey: sessionKeys.lists() });
      qc.invalidateQueries({ queryKey: sessionKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/** ⭐ Mise à jour — PUT /admin/sessions/:id */
export function useUpdateSession(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<SessionFormValues>) => {
      const response = await api.put(`/admin/sessions/${id}`, payload);
      return normalizeSession(extractItem<any>(response));
    },
    onSuccess: () => {
      toast.success('Session mise à jour');
      qc.invalidateQueries({ queryKey: sessionKeys.lists() });
      qc.invalidateQueries({ queryKey: sessionKeys.detail(id) });
      qc.invalidateQueries({ queryKey: sessionKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/** ⭐ Changer le statut — PUT /admin/sessions/:id/statut */
export function useChangeSessionStatut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      statut,
    }: {
      id: string;
      statut: StatutSession;
    }) => {
      const response = await api.put(`/admin/sessions/${id}/statut`, {
        statut,
      });
      return normalizeSession(extractItem<any>(response));
    },
    onSuccess: (_, vars) => {
      toast.success('Statut mis à jour');
      qc.invalidateQueries({ queryKey: sessionKeys.lists() });
      qc.invalidateQueries({ queryKey: sessionKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: sessionKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/**
 * ⭐ Ouvrir / fermer la présence
 * Route backend : PUT /admin/sessions/:id/ouvrir-presence
 */
export function useTogglePresenceSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ouverte,
    }: {
      id: string;
      ouverte: boolean;
    }) => {
      // ✅ Route exacte du backend : /ouvrir-presence
      const response = await api.put(
        `/admin/sessions/${id}/ouvrir-presence`,
        { ouverte },
      );
      return normalizeSession(extractItem<any>(response));
    },
    onSuccess: (_, vars) => {
      toast.success(vars.ouverte ? 'Présence ouverte' : 'Présence fermée');
      qc.invalidateQueries({ queryKey: sessionKeys.lists() });
      qc.invalidateQueries({ queryKey: sessionKeys.detail(vars.id) });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/**
 * ⭐ Publier / dépublier une session
 * Route backend : PUT /admin/sessions/:id/publier
 */
export function useTogglePublishSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      estPubliee,
    }: {
      id: string;
      estPubliee: boolean;
    }) => {
      const response = await api.put(`/admin/sessions/${id}/publier`, {
        estPubliee,
      });
      return normalizeSession(extractItem<any>(response));
    },
    onSuccess: (_, vars) => {
      toast.success(vars.estPubliee ? 'Session publiée' : 'Session dépubliée');
      qc.invalidateQueries({ queryKey: sessionKeys.lists() });
      qc.invalidateQueries({ queryKey: sessionKeys.detail(vars.id) });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/** ⭐ Supprimer une session — DELETE /admin/sessions/:id */
export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/sessions/${id}`);
    },
    onSuccess: () => {
      toast.success('Session supprimée');
      qc.invalidateQueries({ queryKey: sessionKeys.lists() });
      qc.invalidateQueries({ queryKey: sessionKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}