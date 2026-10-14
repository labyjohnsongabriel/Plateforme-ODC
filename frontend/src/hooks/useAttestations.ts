// src/app/(admin)/admin/attestations/hooks/useAttestations.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface Attestation {
  id: string;
  numero: string;
  participantId: string;
  participant?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    photoUrl?: string;
  };
  sessionId: string;
  session?: {
    id: string;
    codeSession: string;
    dateDebut: string;
    dateFin: string;
    formation?: {
      id: string;
      titre: string;
      dureeHeures: number;
    };
  };
  noteFinale?: number;
  tauxPresence?: number;
  dateEmission: string;
  dateExpiration?: string;
  valide: boolean;
  urlPdf?: string;
  hashVerification?: string;
  motifInvalidation?: string;
}

export interface AttestationsStats {
  total: number;
  valides: number;
  invalides: number;
  ceMois: number;
}

export interface AttestationFilters {
  sessionId?: string;
  formationId?: string;
  participantId?: string;
  valide?: 'all' | 'true' | 'false';
  search?: string;
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  limit?: number;
}

/* ============================================================================
   TYPES — GÉNÉRATION
   ============================================================================ */

export interface EligibilityCriteria {
  presenceMin: number;      // Ex: 75 (%)
  noteMin: number;          // Ex: 10 (sur 20)
  selectionValidee: boolean; // Doit être sélectionné
  inscriptionValidee: boolean;
}

export interface EligibleParticipant {
  participantId: string;
  participant: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    photoUrl?: string;
  };
  tauxPresence: number;
  noteFinale?: number;
  eligible: boolean;
  raisons: string[];        // Raisons d'inéligibilité
  dejaGeneree: boolean;     // Une attestation existe déjà ?
  attestationId?: string;
}

export interface SessionPreview {
  session: {
    id: string;
    codeSession: string;
    dateDebut: string;
    dateFin: string;
    statut: string;
    formation: {
      id: string;
      titre: string;
      dureeHeures: number;
    };
  };
  criteres: EligibilityCriteria;
  participants: EligibleParticipant[];
  stats: {
    total: number;
    eligibles: number;
    ineligibles: number;
    dejaGenerees: number;
  };
}

export interface GenerationResult {
  generes: number;
  ignores: number;
  erreurs: number;
  attestations: Array<{
    id: string;
    numero: string;
    participantId: string;
    participantNom: string;
  }>;
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
      limit: 20,
      total: 0,
      totalPages: 1,
    }
  );
}

function normalizeAttestation(raw: any): Attestation {
  return {
    id: String(raw?.id ?? raw?._id ?? ''),
    numero: raw?.numero ?? '',
    participantId: String(raw?.participantId ?? ''),
    participant: raw?.participant
      ? {
          id: String(raw.participant.id ?? ''),
          nom: raw.participant.nom ?? '',
          prenom: raw.participant.prenom ?? '',
          email: raw.participant.email ?? '',
          photoUrl: raw.participant.photoUrl ?? undefined,
        }
      : undefined,
    sessionId: String(raw?.sessionId ?? ''),
    session: raw?.session
      ? {
          id: String(raw.session.id ?? ''),
          codeSession: raw.session.codeSession ?? '',
          dateDebut: raw.session.dateDebut ?? '',
          dateFin: raw.session.dateFin ?? '',
          formation: raw.session.formation
            ? {
                id: String(raw.session.formation.id ?? ''),
                titre: raw.session.formation.titre ?? '',
                dureeHeures: Number(raw.session.formation.dureeHeures ?? 0),
              }
            : undefined,
        }
      : undefined,
    noteFinale:
      raw?.noteFinale !== undefined ? Number(raw.noteFinale) : undefined,
    tauxPresence:
      raw?.tauxPresence !== undefined ? Number(raw.tauxPresence) : undefined,
    dateEmission: raw?.dateEmission ?? new Date().toISOString(),
    dateExpiration: raw?.dateExpiration ?? undefined,
    valide: raw?.valide ?? true,
    urlPdf: raw?.urlPdf ?? undefined,
    hashVerification: raw?.hashVerification ?? undefined,
    motifInvalidation: raw?.motifInvalidation ?? undefined,
  };
}

function cleanFilters(filters?: AttestationFilters): Record<string, any> {
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

export const attestationKeys = {
  all: ['admin', 'attestations'] as const,
  lists: () => [...attestationKeys.all, 'list'] as const,
  list: (filters?: AttestationFilters) =>
    [...attestationKeys.lists(), filters] as const,
  detail: (id: string) => [...attestationKeys.all, 'detail', id] as const,
  stats: () => [...attestationKeys.all, 'stats'] as const,
  preview: (sessionId: string, criteria?: EligibilityCriteria) =>
    [...attestationKeys.all, 'preview', sessionId, criteria] as const,
};

/* ============================================================================
   QUERIES
   ============================================================================ */

export function useAttestations(filters?: AttestationFilters) {
  return useQuery({
    queryKey: attestationKeys.list(filters),
    queryFn: async () => {
      const params = cleanFilters(filters);
      const response = await api.get('/admin/attestations', { params });
      return {
        data: extractList<any>(response).map(normalizeAttestation),
        pagination: extractPagination(response),
      };
    },
    staleTime: 30_000,
    retry: 1,
  });
}

export function useAttestation(id: string | undefined) {
  return useQuery({
    queryKey: attestationKeys.detail(id ?? ''),
    queryFn: async (): Promise<Attestation> => {
      const response = await api.get(`/admin/attestations/${id}`);
      return normalizeAttestation(extractItem<any>(response));
    },
    enabled: !!id,
  });
}

export function useAttestationsStats() {
  return useQuery({
    queryKey: attestationKeys.stats(),
    queryFn: async (): Promise<AttestationsStats> => {
      try {
        const response = await api.get('/admin/attestations/stats');
        const raw = extractItem<any>(response) ?? {};
        return {
          total: Number(raw?.total ?? 0),
          valides: Number(raw?.valides ?? 0),
          invalides: Number(raw?.invalides ?? 0),
          ceMois: Number(raw?.ceMois ?? 0),
        };
      } catch {
        return { total: 0, valides: 0, invalides: 0, ceMois: 0 };
      }
    },
    staleTime: 60_000,
    retry: 0,
  });
}

/**
 * ⭐ Aperçu des participants éligibles AVANT génération
 */
export function useSessionPreview(
  sessionId: string | undefined,
  criteria?: EligibilityCriteria,
  enabled = false,
) {
  return useQuery({
    queryKey: attestationKeys.preview(sessionId ?? '', criteria),
    queryFn: async (): Promise<SessionPreview> => {
      const response = await api.get(
        `/admin/attestations/preview-session/${sessionId}`,
        { params: criteria },
      );
      return extractItem<SessionPreview>(response);
    },
    enabled: enabled && !!sessionId,
    staleTime: 30_000,
  });
}

/* ============================================================================
   MUTATIONS
   ============================================================================ */

/**
 * ⭐ Générer les attestations pour une session
 */
export function useGenerateAttestations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      criteria,
    }: {
      sessionId: string;
      criteria?: EligibilityCriteria;
    }): Promise<GenerationResult> => {
      const response = await api.post(
        `/admin/attestations/generer-session/${sessionId}`,
        criteria ?? {},
      );
      return extractItem<GenerationResult>(response);
    },
    onSuccess: (data) => {
      if (data.generes > 0) {
        toast.success(
          `${data.generes} attestation${data.generes > 1 ? 's' : ''} générée${data.generes > 1 ? 's' : ''}`,
        );
      }
      if (data.ignores > 0) {
        toast.info(
          `${data.ignores} participant${data.ignores > 1 ? 's' : ''} ignoré${data.ignores > 1 ? 's' : ''}`,
        );
      }
      if (data.erreurs > 0) {
        toast.warning(
          `${data.erreurs} erreur${data.erreurs > 1 ? 's' : ''} lors de la génération`,
        );
      }
      qc.invalidateQueries({ queryKey: attestationKeys.lists() });
      qc.invalidateQueries({ queryKey: attestationKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/**
 * ⭐ Générer une attestation pour un participant spécifique
 */
export function useGenerateOneAttestation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      participantId,
    }: {
      sessionId: string;
      participantId: string;
    }): Promise<Attestation> => {
      const response = await api.post(
        `/admin/attestations/generer-une/${sessionId}/${participantId}`,
      );
      return normalizeAttestation(extractItem<any>(response));
    },
    onSuccess: () => {
      toast.success('Attestation générée');
      qc.invalidateQueries({ queryKey: attestationKeys.lists() });
      qc.invalidateQueries({ queryKey: attestationKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/**
 * ⭐ Invalider une attestation
 */
export function useInvalidateAttestation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      motif,
    }: {
      id: string;
      motif: string;
    }) => {
      const response = await api.put(`/admin/attestations/${id}/invalider`, {
        motif,
      });
      return normalizeAttestation(extractItem<any>(response));
    },
    onSuccess: () => {
      toast.success('Attestation invalidée');
      qc.invalidateQueries({ queryKey: attestationKeys.lists() });
      qc.invalidateQueries({ queryKey: attestationKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/**
 * ⭐ Réactiver une attestation
 */
export function useReactivateAttestation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.put(`/admin/attestations/${id}/reactiver`);
      return normalizeAttestation(extractItem<any>(response));
    },
    onSuccess: () => {
      toast.success('Attestation réactivée');
      qc.invalidateQueries({ queryKey: attestationKeys.lists() });
      qc.invalidateQueries({ queryKey: attestationKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/**
 * ⭐ Télécharger une attestation PDF
 */
export function useDownloadAttestation() {
  return useMutation({
    mutationFn: async ({
      id,
      numero,
    }: {
      id: string;
      numero: string;
    }) => {
      const response = await api.get(
        `/admin/attestations/${id}/telecharger`,
        { responseType: 'blob' },
      );

      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `attestation-${numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    },
    onSuccess: () => {
      toast.success('Téléchargement démarré');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}