// src/lib/api/dashboard.api.ts
import { api } from '@/lib/api';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

export type RoleName =
  | 'ADMINISTRATEUR'
  | 'STAFF_ODC'
  | 'FORMATEUR'
  | 'PARTICIPANT'
  | 'PARTENAIRE';

/* ─── ADMIN ──────────────────────────────────────────────────────────── */
export interface AdminStats {
  kpis: {
    totalUsers: number;
    usersActifs: number;
    totalFormations: number;
    formationsPubliees: number;
    totalSessions: number;
    sessionsOuvertes: number;
    sessionsEnCours: number;
    totalInscriptions: number;
    inscriptionsEnAttente: number;
    inscriptionsAcceptees: number;
    inscriptionsRefusees: number;
    totalAttestations: number;
    totalPartenaires: number;
    totalPresences: number;
    tauxPresenceMoyen: number | null;
  };
  trends: {
    users: number;
    formations: number;
    sessions: number;
    inscriptions: number;
  };
  usersByRole: Array<{ role: string; count: number }>;
  topFormations: Array<{
    id: string;
    titre: string;
    slug: string;
    domaine: string;
    inscriptions: number;
  }>;
  inscriptionsParMois: Array<{ mois: string; count: number }>;
  formationsByDomaine: Array<{ domaine: string; couleur: string; count: number }>;
  sessionsParStatut: Array<{ statut: string; count: number }>;
}

/* ─── STAFF ──────────────────────────────────────────────────────────── */
export interface StaffStats {
  inscriptionsEnAttente: number;
  sessionsActives: number;
  inscriptionsDuJour: number;
  tauxPresenceMoyen: number | null;
  totalSessions: number;
  sessionsOuvertes: number;
  formationsPubliees: number;
  totalPartenaires: number;
  totalInscriptions: number;
  totalUsers: number;
}

/* ─── FORMATEUR ──────────────────────────────────────────────────────── */
export interface FormateurStats {
  totalSessions: number;
  sessionsEnCours: number;
  sessionsTerminees: number;
  sessionsOuvertes: number;
  sessionsAVenir: number;
  totalParticipants: number;
  inscriptionsEnAttente: number;
  tauxPresenceMoyen: number | null;
  prochainesSessions: Array<{
    id: string;
    code: string;
    formation: string;
    dateDebut: string;
    lieu: string;
  }>;
}

/* ─── PARTICIPANT ────────────────────────────────────────────────────── */
export interface ParticipantStats {
  totalInscriptions: number;
  inscriptionsAcceptees: number;
  inscriptionsEnAttente: number;
  inscriptionsRefusees: number;
  inscriptionsEnListeAttente: number;
  inscriptionsAnnulees: number;
  formationsEnCours: number;
  formationsTerminees: number;
  attestationsObtenues: number;
  totalPresences: number;
  tauxPresenceMoyen: number | null;
  prochainesSessions: Array<{
    inscriptionId: string;
    formation: string;
    dateDebut: string;
    statut: string;
    lieu?: string;
  }>;
}

/* ─── PARTENAIRE ─────────────────────────────────────────────────────── */
export interface PartenaireStats {
  chiffres: {
    totalFormations: number;
    totalSessions: number;
    totalParticipants: number;
    totalAttestations: number;
  };
  formationsPubliees: number;
  sessionsPubliques: number;
  parDomaine: Array<{ domaine: string; count: number }>;
}

/* ─── Union discriminée ──────────────────────────────────────────────── */
export type DashboardStats =
  | AdminStats
  | StaffStats
  | FormateurStats
  | ParticipantStats
  | PartenaireStats;

/* ─── Status système ─────────────────────────────────────────────────── */
export interface SystemStatus {
  database: boolean;
  api: boolean;
  uptime: number;
  version: string;
  timestamp: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXTRACTION SÛRE — corrige les 3 formats possibles
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Extrait `data` de la réponse API en tolérant 3 formats :
 *  1. { success, message, data: {...} } → response.data.data
 *  2. { data: {...} }                    → response.data
 *  3. { ... } (objet direct)             → response
 *
 * Retourne `null` si rien n'est extrait OU si l'objet extrait est vide.
 */
function extractData<T>(response: unknown): T | null {
  if (response === null || response === undefined) return null;

  const res = response as Record<string, any>;

  let extracted: any = res;

  // Cas 1 : { data: { data: {...} } }
  if (res.data && typeof res.data === 'object' && 'data' in res.data) {
    extracted = res.data.data;
  }
  // Cas 2 : { data: {...} }
  else if (res.data !== undefined) {
    extracted = res.data;
  }
  // Cas 3 : objet direct
  else {
    extracted = res;
  }

  // Si l'objet extrait est vide → null (évite les valeurs à 0)
  if (
    extracted === null ||
    extracted === undefined ||
    (typeof extracted === 'object' &&
      !Array.isArray(extracted) &&
      Object.keys(extracted).length === 0)
  ) {
    return null;
  }

  return extracted as T;
}

/**
 * Extrait un tableau — gère tous les formats :
 *  - { data: [...] }
 *  - { data: { data: [...] } }
 *  - { data: { sessions: [...] } }
 *  - { sessions: [...] }
 *  - [...]
 */
function extractArray<T>(response: unknown, arrayKeys: string[] = []): T[] {
  if (Array.isArray(response)) return response as T[];
  if (!response || typeof response !== 'object') return [];

  const res = response as Record<string, any>;

  // Cas { data: [...] }
  if (Array.isArray(res.data)) return res.data as T[];

  // Cas { data: { ... } }
  if (res.data && typeof res.data === 'object') {
    const inner = res.data as Record<string, any>;
    if (Array.isArray(inner)) return inner as T[];
    if (Array.isArray(inner.data)) return inner.data as T[];
    for (const key of arrayKeys) {
      if (Array.isArray(inner[key])) return inner[key] as T[];
    }
  }

  // Cas { sessions: [...] } ou autre clé directe
  for (const key of arrayKeys) {
    if (Array.isArray(res[key])) return res[key] as T[];
  }

  return [];
}

/**
 * Vérifie qu'un objet contient au moins une clé connue.
 * Évite de retourner `{}` qui casse le rendu.
 */
function hasStatsKeys(obj: unknown, keys: string[]): boolean {
  if (!obj || typeof obj !== 'object') return false;
  return keys.some((k) => k in (obj as Record<string, unknown>));
}

/* ═══════════════════════════════════════════════════════════════════════════
   KEYS DE VALIDATION
   ═══════════════════════════════════════════════════════════════════════════ */

const FORMATEUR_KEYS = [
  'totalSessions',
  'sessionsEnCours',
  'totalParticipants',
  'tauxPresenceMoyen',
];

const ADMIN_KEYS = ['kpis', 'trends', 'topFormations'];

const STAFF_KEYS = [
  'inscriptionsEnAttente',
  'sessionsActives',
  'inscriptionsDuJour',
];

const PARTICIPANT_KEYS = [
  'totalInscriptions',
  'inscriptionsAcceptees',
  'formationsEnCours',
];

const PARTENAIRE_KEYS = ['chiffres', 'formationsPubliees', 'parDomaine'];

/* ═══════════════════════════════════════════════════════════════════════════
   API — URLs CORRIGÉES pour matcher le backend
   ═══════════════════════════════════════════════════════════════════════════
   Backend (src/routes/dashboard.routes.ts) :
     - GET /api/dashboard/me
     - GET /api/dashboard/admin
     - GET /api/dashboard/staff
     - GET /api/dashboard/formateur
     - GET /api/dashboard/participant
     - GET /api/dashboard/partenaire
     - GET /api/dashboard/top-formations
     - GET /api/dashboard/status
   ============================================================================ */

export const dashboardApi = {
  /* ─────────────────────────────────────────────────────────────────────────
     ✅ ENDPOINT UNIFIÉ — /dashboard/me
     Retourne les stats du rôle courant. Le type dépend du rôle connecté.
     ───────────────────────────────────────────────────────────────────────── */
  async getMyStats<T extends DashboardStats = DashboardStats>(
    signal?: AbortSignal,
  ): Promise<T | null> {
    const { data } = await api.get('/dashboard/me', { signal });
    const extracted = extractData<T>(data);

    if (!extracted) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[dashboardApi] getMyStats: no data extracted', data);
      }
      return null;
    }

    return extracted;
  },

  /* ─────────────────────────────────────────────────────────────────────────
     ENDPOINTS PAR RÔLE — URLs corrigées
     ───────────────────────────────────────────────────────────────────────── */

  async getAdminStats(signal?: AbortSignal): Promise<AdminStats | null> {
    const { data } = await api.get('/dashboard/admin', { signal });
    const extracted = extractData<AdminStats>(data);

    if (!hasStatsKeys(extracted, ADMIN_KEYS)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[dashboardApi] getAdminStats: invalid payload', extracted);
      }
      return null;
    }

    return extracted;
  },

  async getStaffStats(signal?: AbortSignal): Promise<StaffStats | null> {
    const { data } = await api.get('/dashboard/staff', { signal });
    const extracted = extractData<StaffStats>(data);

    if (!hasStatsKeys(extracted, STAFF_KEYS)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[dashboardApi] getStaffStats: invalid payload', extracted);
      }
      return null;
    }

    return extracted;
  },

  async getFormateurStats(signal?: AbortSignal): Promise<FormateurStats | null> {
    const { data } = await api.get('/dashboard/formateur', { signal });
    const extracted = extractData<FormateurStats>(data);

    if (!hasStatsKeys(extracted, FORMATEUR_KEYS)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[dashboardApi] getFormateurStats: invalid payload', extracted);
      }
      return null;
    }

    return extracted;
  },

  async getParticipantStats(
    signal?: AbortSignal,
  ): Promise<ParticipantStats | null> {
    const { data } = await api.get('/dashboard/participant', { signal });
    const extracted = extractData<ParticipantStats>(data);

    if (!hasStatsKeys(extracted, PARTICIPANT_KEYS)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[dashboardApi] getParticipantStats: invalid payload', extracted);
      }
      return null;
    }

    return extracted;
  },

  async getPartenaireStats(
    signal?: AbortSignal,
  ): Promise<PartenaireStats | null> {
    const { data } = await api.get('/dashboard/partenaire', { signal });
    const extracted = extractData<PartenaireStats>(data);

    if (!hasStatsKeys(extracted, PARTENAIRE_KEYS)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[dashboardApi] getPartenaireStats: invalid payload', extracted);
      }
      return null;
    }

    return extracted;
  },

  /* ─────────────────────────────────────────────────────────────────────────
     TOP FORMATIONS (admin) — URL corrigée
     ───────────────────────────────────────────────────────────────────────── */
  async getTopFormations(
    limit = 5,
    signal?: AbortSignal,
  ): Promise<AdminStats['topFormations']> {
    const { data } = await api.get('/dashboard/top-formations', {
      params: { limit },
      signal,
    });
    return extractArray<AdminStats['topFormations'][number]>(data, [
      'topFormations',
      'formations',
    ]);
  },

  /* ─────────────────────────────────────────────────────────────────────────
     STATUS SYSTÈME (admin) — URL corrigée
     ───────────────────────────────────────────────────────────────────────── */
  async getSystemStatus(signal?: AbortSignal): Promise<SystemStatus | null> {
    const { data } = await api.get('/dashboard/status', { signal });
    return extractData<SystemStatus>(data);
  },

  /* ─────────────────────────────────────────────────────────────────────────
     SESSIONS & PARTICIPANTS FORMATEUR — helpers centralisés
     ───────────────────────────────────────────────────────────────────────── */

  /**
   * Sessions du formateur connecté.
   * ⚠️ Vérifiez la route backend réelle : /formateur/sessions ou /sessions/me ?
   */
  async getMySessions<T = unknown>(signal?: AbortSignal): Promise<T[]> {
    const { data } = await api.get('/formateur/sessions', { signal });
    return extractArray<T>(data, ['sessions', 'data', 'items']);
  },

  /**
   * Détail d'une session.
   */
  async getSession<T = unknown>(
    sessionId: string,
    signal?: AbortSignal,
  ): Promise<T | null> {
    const { data } = await api.get(`/formateur/sessions/${sessionId}`, { signal });
    return extractData<T>(data);
  },

  /**
   * Participants d'une session.
   */
  async getSessionParticipants<T = unknown>(
    sessionId: string,
    signal?: AbortSignal,
  ): Promise<T[]> {
    const { data } = await api.get(
      `/formateur/sessions/${sessionId}/participants`,
      { signal },
    );
    return extractArray<T>(data, ['participants', 'data', 'items']);
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPATIBILITÉ — helpers legacy (dépréciés)
   ═══════════════════════════════════════════════════════════════════════════ */

/** @deprecated Utilisez `dashboardApi.getMyStats()` */
export const getStats = dashboardApi.getMyStats;

/** @deprecated Non implémenté côté backend */
export const getChartData = async (_period?: string) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[dashboardApi] getChartData is not implemented');
  }
  return null;
};

/** @deprecated Non implémenté côté backend */
export const getRecentActivity = async () => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[dashboardApi] getRecentActivity is not implemented');
  }
  return [];
};