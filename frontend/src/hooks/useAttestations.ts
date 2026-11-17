// src/app/(admin)/admin/attestations/hooks/useAttestations.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';

/* ============================================================================
   TYPES — DOMAINE
   ============================================================================ */

export interface Attestation {
  id: string;
  numero: string;
  hash?: string;
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
    statut?: string;
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
  fichierUrl?: string;
  qrCodeUrl?: string;
  hashVerification?: string;
  motifInvalidation?: string;
  telechargee?: boolean;
  dateTelechargement?: string;
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
  presenceMin: number;
  noteMin: number;
  selectionValidee: boolean;
  inscriptionValidee: boolean;
}

export const DEFAULT_CRITERIA: EligibilityCriteria = {
  presenceMin: 75,
  noteMin: 10,
  selectionValidee: true,
  inscriptionValidee: true,
};

export interface EligibleParticipant {
  participantId: string;
  participant: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    photoUrl?: string;
  };
  estSelectionne: boolean;
  dateSelection?: string | null;
  tauxPresence: number;
  presencesPresentes: number;
  presencesRetards: number;
  presencesAbsentes: number;
  presencesExcusees: number;
  totalSeances: number;
  noteFinale?: number;
  eligible: boolean;
  raisons: string[];
  dejaGeneree: boolean;
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
  details?: {
    participantsTotal: number;
    participantsEligibles: number;
    participantsIgnores: number;
    dejaGenerees: number;
  };
}

/* ============================================================================
   HELPERS — ERREUR
   ============================================================================ */

function getErrorMessage(error: any): string {
  if (!error) return 'Erreur inconnue';

  if (error.response) {
    const { status, data } = error.response;
    const msg = data?.message ?? data?.error ?? '';
    if (status === 401) return 'Session expirée, veuillez vous reconnecter';
    if (status === 403) return msg || 'Accès refusé';
    if (status === 404) return msg || 'Ressource introuvable';
    if (status === 409) return msg || 'Conflit : donnée déjà existante';
    if (status === 500) return msg || 'Erreur serveur';
    return msg || `Erreur ${status}`;
  }

  if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
    return "❌ Le serveur backend n'est pas accessible. Vérifiez qu'il est démarré.";
  }

  if (error.code === 'ECONNABORTED') {
    return '⏱️ Le serveur met trop de temps à répondre';
  }

  return error.message ?? 'Erreur inconnue';
}

/* ============================================================================
   HELPERS — EXTRACTION
   ============================================================================ */

function extractList<T>(response: any): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.data?.items)) return response.data.items;
  return [];
}

function extractItem<T>(response: any): T {
  if (!response) return response;
  if (response.data?.data !== undefined) return response.data.data;
  if (response.data !== undefined) return response.data;
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

/* ============================================================================
   HELPERS — NORMALISATION
   ============================================================================ */

function normalizeAttestation(raw: any): Attestation {
  return {
    id: String(raw?.id ?? raw?._id ?? ''),
    numero: raw?.numero ?? '',
    hash: raw?.hash ?? undefined,
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
          statut: raw.session.statut ?? undefined,
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
      raw?.noteFinale !== undefined && raw?.noteFinale !== null
        ? Number(raw.noteFinale)
        : undefined,
    tauxPresence:
      raw?.tauxPresence !== undefined && raw?.tauxPresence !== null
        ? Number(raw.tauxPresence)
        : undefined,
    dateEmission: raw?.dateEmission ?? new Date().toISOString(),
    dateExpiration: raw?.dateExpiration ?? undefined,
    valide: raw?.valide ?? true,
    fichierUrl: raw?.fichierUrl ?? raw?.urlPdf ?? undefined,
    qrCodeUrl: raw?.qrCodeUrl ?? undefined,
    hashVerification: raw?.hashVerification ?? raw?.hash ?? undefined,
    motifInvalidation: raw?.motifInvalidation ?? undefined,
    telechargee: raw?.telechargee ?? undefined,
    dateTelechargement: raw?.dateTelechargement ?? undefined,
  };
}

function normalizeParticipant(raw: any): EligibleParticipant {
  const dateSelection = raw?.dateSelection ?? raw?.date_selection ?? null;

  return {
    participantId: String(raw?.participantId ?? raw?.participant?.id ?? ''),
    participant: {
      id: String(raw?.participant?.id ?? raw?.participantId ?? ''),
      nom: raw?.participant?.nom ?? '',
      prenom: raw?.participant?.prenom ?? '',
      email: raw?.participant?.email ?? '',
      photoUrl: raw?.participant?.photoUrl ?? undefined,
    },
    estSelectionne: Boolean(
      raw?.estSelectionne ?? (dateSelection !== null && dateSelection !== undefined),
    ),
    dateSelection,
    tauxPresence: Number(raw?.tauxPresence ?? 0),
    presencesPresentes: Number(raw?.presencesPresentes ?? 0),
    presencesRetards: Number(raw?.presencesRetards ?? 0),
    presencesAbsentes: Number(raw?.presencesAbsentes ?? 0),
    presencesExcusees: Number(raw?.presencesExcusees ?? 0),
    totalSeances: Number(raw?.totalSeances ?? 0),
    noteFinale:
      raw?.noteFinale !== undefined && raw?.noteFinale !== null
        ? Number(raw.noteFinale)
        : undefined,
    eligible: Boolean(raw?.eligible),
    raisons: Array.isArray(raw?.raisons) ? raw.raisons.map(String) : [],
    dejaGeneree: Boolean(raw?.dejaGeneree),
    attestationId: raw?.attestationId ?? undefined,
  };
}

function cleanFilters(filters?: AttestationFilters): Record<string, any> {
  if (!filters) return {};
  const cleaned: Record<string, any> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value === 'all' || value === '' || value === undefined || value === null) {
      return;
    }
    cleaned[key] = value;
  });
  return cleaned;
}

function serializeCriteria(criteria: EligibilityCriteria): Record<string, string> {
  return {
    presenceMin: String(criteria.presenceMin),
    noteMin: String(criteria.noteMin),
    selectionValidee: criteria.selectionValidee ? 'true' : 'false',
    inscriptionValidee: criteria.inscriptionValidee ? 'true' : 'false',
  };
}

function isValidUuid(v: string | null | undefined): boolean {
  if (!v) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

function useAttestationApiPrefix(): '/admin' | '/staff' {
  const pathname = usePathname();
  return pathname.startsWith('/staff/') ? '/staff' : '/admin';
}

/* ============================================================================
   CLÉS QUERY
   ============================================================================ */

export const attestationKeys = {
  all: ['admin', 'attestations'] as const,
  lists: () => [...attestationKeys.all, 'list'] as const,
  list: (filters?: AttestationFilters) => [...attestationKeys.lists(), filters] as const,
  detail: (id: string) => [...attestationKeys.all, 'detail', id] as const,
  stats: () => [...attestationKeys.all, 'stats'] as const,
  preview: (sessionId: string, criteria?: EligibilityCriteria) =>
    [...attestationKeys.all, 'preview', sessionId, criteria] as const,
};

/* ============================================================================
   QUERIES
   ============================================================================ */

export function useAttestations(filters?: AttestationFilters) {
  const apiPrefix = useAttestationApiPrefix();

  return useQuery({
    queryKey: attestationKeys.list(filters),
    queryFn: async () => {
      const params = cleanFilters(filters);
      const response = await api.get(`${apiPrefix}/attestations`, { params });
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
  const apiPrefix = useAttestationApiPrefix();

  return useQuery({
    queryKey: attestationKeys.detail(id ?? ''),
    queryFn: async (): Promise<Attestation> => {
      const response = await api.get(`${apiPrefix}/attestations/${id}`);
      return normalizeAttestation(extractItem<any>(response));
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useAttestationsStats() {
  const apiPrefix = useAttestationApiPrefix();

  return useQuery({
    queryKey: attestationKeys.stats(),
    queryFn: async (): Promise<AttestationsStats> => {
      const response = await api.get(`${apiPrefix}/attestations/stats`);
      const raw = extractItem<any>(response) ?? {};
      return {
        total: Number(raw?.total ?? 0),
        valides: Number(raw?.valides ?? 0),
        invalides: Number(raw?.invalides ?? 0),
        ceMois: Number(raw?.ceMois ?? 0),
      };
    },
    staleTime: 60_000,
    retry: 1,
  });
}

/**
 * ⭐ Aperçu des participants éligibles AVANT génération
 * GET /api/admin/attestations/preview-session/:sessionId
 */
export function useSessionPreview(
  sessionId: string | undefined,
  criteria: EligibilityCriteria = DEFAULT_CRITERIA,
  enabled = false,
) {
  const apiPrefix = useAttestationApiPrefix();

  return useQuery({
    queryKey: attestationKeys.preview(sessionId ?? '', criteria),
    queryFn: async (): Promise<SessionPreview> => {
      if (!isValidUuid(sessionId)) {
        throw new Error('sessionId invalide');
      }

      const response = await api.get(
        `${apiPrefix}/attestations/preview-session/${sessionId}`,
        { params: serializeCriteria(criteria) },
      );

      const raw = extractItem<any>(response) ?? {};

      return {
        session: raw.session,
        criteres: raw.criteres ?? criteria,
        participants: Array.isArray(raw.participants)
          ? raw.participants.map(normalizeParticipant)
          : [],
        stats: {
          total: Number(raw.stats?.total ?? 0),
          eligibles: Number(raw.stats?.eligibles ?? 0),
          ineligibles: Number(raw.stats?.ineligibles ?? 0),
          dejaGenerees: Number(raw.stats?.dejaGenerees ?? 0),
        },
      };
    },
    enabled: enabled && !!sessionId && isValidUuid(sessionId),
    staleTime: 30_000,
    retry: (failureCount, error: any) => {
      if (error?.code === 'ERR_NETWORK') return false;
      if (error?.response?.status === 404) return false;
      return failureCount < 1;
    },
    placeholderData: (prev) => prev,
  });
}

/* ============================================================================
   MUTATIONS
   ⚠️ URLs alignées sur le BACKEND réel (admin.routes.ts)
   ============================================================================ */

/**
 * ⭐ Générer les attestations en batch pour une session
 * ✅ BACKEND : POST /api/admin/attestations/generer-session/:sessionId
 */
export function useGenerateAttestations() {
  const apiPrefix = useAttestationApiPrefix();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      criteria,
    }: {
      sessionId: string;
      criteria?: EligibilityCriteria;
    }): Promise<GenerationResult> => {
      if (!isValidUuid(sessionId)) {
        throw new Error('sessionId invalide : UUID requis');
      }

      const response = await api.post(
        `${apiPrefix}/attestations/generer-session/${sessionId}`,
        criteria ?? {},
        { timeout: 60_000 },
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
      if (data.generes === 0 && data.ignores === 0 && data.erreurs === 0) {
        toast.info('Aucune attestation à générer');
      }
      qc.invalidateQueries({ queryKey: attestationKeys.lists() });
      qc.invalidateQueries({ queryKey: attestationKeys.stats() });
      qc.invalidateQueries({ queryKey: attestationKeys.all });
    },
    onError: (e) => {
      toast.error(getErrorMessage(e), { duration: 8000 });
    },
  });
}

/**
 * ⭐ Générer une seule attestation
 * ✅ BACKEND : POST /api/admin/attestations/generer-une
 */
export function useGenerateOneAttestation() {
  const apiPrefix = useAttestationApiPrefix();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      participantId,
    }: {
      sessionId: string;
      participantId: string;
    }): Promise<Attestation> => {
      if (!isValidUuid(sessionId) || !isValidUuid(participantId)) {
        throw new Error('sessionId ou participantId invalide');
      }

      const action = apiPrefix === '/staff' ? 'generer' : 'generer-une';
      const response = await api.post(`${apiPrefix}/attestations/${action}`, {
        sessionId,
        participantId,
      });

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
 * ✅ BACKEND : PUT /api/admin/attestations/:id/invalider
 */
export function useInvalidateAttestation() {
  const apiPrefix = useAttestationApiPrefix();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      motif,
    }: {
      id: string;
      motif: string;
    }): Promise<Attestation> => {
      const response = await api.put(`${apiPrefix}/attestations/${id}/invalider`, {
        motif,
      });
      return normalizeAttestation(extractItem<any>(response));
    },
    onSuccess: (data) => {
      toast.success('Attestation invalidée');
      if (data?.id) {
        qc.invalidateQueries({ queryKey: attestationKeys.detail(data.id) });
      }
      qc.invalidateQueries({ queryKey: attestationKeys.lists() });
      qc.invalidateQueries({ queryKey: attestationKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/**
 * ⭐ Réactiver une attestation
 * ✅ BACKEND : PUT /api/admin/attestations/:id/reactiver
 */
export function useReactivateAttestation() {
  const apiPrefix = useAttestationApiPrefix();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Attestation> => {
      const response = await api.put(`${apiPrefix}/attestations/${id}/reactiver`);
      return normalizeAttestation(extractItem<any>(response));
    },
    onSuccess: (data) => {
      toast.success('Attestation réactivée');
      if (data?.id) {
        qc.invalidateQueries({ queryKey: attestationKeys.detail(data.id) });
      }
      qc.invalidateQueries({ queryKey: attestationKeys.lists() });
      qc.invalidateQueries({ queryKey: attestationKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/**
 * ⭐ Télécharger le PDF
 * ✅ BACKEND : GET /api/admin/attestations/:id/telecharger
 */
export function useDownloadAttestation() {
  const apiPrefix = useAttestationApiPrefix();

  return useMutation({
    mutationFn: async ({
      id,
      numero,
    }: {
      id: string;
      numero: string;
    }): Promise<boolean> => {
      const response = await api.get(`${apiPrefix}/attestations/${id}/telecharger`, {
        responseType: 'blob',
      });

      const contentDisposition = response.headers?.['content-disposition'];
      let filename = `attestation-${numero}.pdf`;
      if (contentDisposition) {
        const match = /filename\*?=(?:UTF-8'')?["']?([^;"']+)/i.exec(contentDisposition);
        if (match?.[1]) {
          try {
            filename = decodeURIComponent(match[1]);
          } catch {
            filename = match[1];
          }
        }
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);

      return true;
    },
    onSuccess: () => {
      toast.success('Téléchargement démarré');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
