// src/lib/sessions.ts
import { api } from '@/lib/api';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

export interface SessionOption {
  id: string;
  codeSession: string;
  formationTitre: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  raw?: any;
}

export interface LoadSessionsOptions {
  includeArchived?: boolean;
  limit?: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXTRACTION ROBUSTE
   ═══════════════════════════════════════════════════════════════════════════ */

export function extractSessionsPayload(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;

  const candidates = ['data', 'sessions', 'items', 'results', 'rows'];

  for (const key of candidates) {
    if (Array.isArray(raw[key])) return raw[key];
  }

  if (raw.data && typeof raw.data === 'object') {
    for (const key of candidates) {
      if (Array.isArray(raw.data[key])) return raw.data[key];
    }
  }

  return [];
}

/* ═══════════════════════════════════════════════════════════════════════════
   NORMALISATION
   ═══════════════════════════════════════════════════════════════════════════ */

export function normalizeSession(s: any): SessionOption {
  const formation = s?.formation ?? s?.formationData ?? {};
  return {
    id: String(s?.id ?? s?._id ?? s?.sessionId ?? s?.session_id ?? '').trim(),
    codeSession: String(
      s?.codeSession ?? s?.code_session ?? s?.code ?? '',
    ).trim(),
    formationTitre: String(
      s?.formationTitre ??
        s?.formation_titre ??
        formation.titre ??
        formation.title ??
        formation.nom ??
        '',
    ).trim(),
    dateDebut: s?.dateDebut ?? s?.date_debut ?? undefined,
    dateFin: s?.dateFin ?? s?.date_fin ?? undefined,
    statut: s?.statut ?? s?.status ?? undefined,
    raw: s,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITAIRES
   ═══════════════════════════════════════════════════════════════════════════ */

export function isValidUuid(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function isValidSessionId(value: string | null | undefined): boolean {
  if (!value) return false;
  const v = String(value).trim();
  return v.length > 0 && v.length < 128;
}

/* ═══════════════════════════════════════════════════════════════════════════
   DEDUPE + TRI
   ═══════════════════════════════════════════════════════════════════════════ */

export function dedupeAndSortSessions(list: SessionOption[]): SessionOption[] {
  const seen = new Set<string>();
  const unique: SessionOption[] = [];

  for (const s of list) {
    if (!s.id || seen.has(s.id)) continue;
    seen.add(s.id);
    unique.push(s);
  }

  unique.sort((a, b) => {
    const da = a.dateDebut ? new Date(a.dateDebut).getTime() : 0;
    const db = b.dateDebut ? new Date(b.dateDebut).getTime() : 0;
    if (db !== da) return db - da;
    return (a.codeSession || '').localeCompare(b.codeSession || '');
  });

  return unique;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ⭐ LOADER PROFESSIONNEL
   ═══════════════════════════════════════════════════════════════════════════ */

export async function loadSessionsForEvaluation(
  opts: LoadSessionsOptions = {},
): Promise<SessionOption[]> {
  const { includeArchived = true, limit = 100 } = opts;

  const attempts: Array<() => Promise<any>> = [
    () =>
      api.get('/formateur/sessions', {
        params: { limit, includeArchived },
      }),
    () =>
      api.get('/sessions', {
        params: { limit, includeArchived },
      }),
  ];

  let lastError: unknown = null;

  for (const attempt of attempts) {
    try {
      const res = await attempt();
      const raw = res.data?.data ?? res.data;
      const extracted = extractSessionsPayload(raw);
      const normalized = extracted
        .map(normalizeSession)
        .filter((s) => isValidSessionId(s.id));

      if (normalized.length > 0) {
        return dedupeAndSortSessions(normalized);
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) throw lastError;
  return [];
}

/* ═══════════════════════════════════════════════════════════════════════════
   ⭐ HELPERS UI
   ═══════════════════════════════════════════════════════════════════════════ */

export function formatSessionLabel(s: SessionOption): string {
  const parts: string[] = [];
  if (s.codeSession) parts.push(s.codeSession);
  if (s.formationTitre) parts.push(`— ${s.formationTitre}`);
  return parts.join(' ') || `Session ${s.id.slice(0, 8)}`;
}

export function formatSessionPeriod(s: SessionOption): string {
  const fmt = (d?: string) => {
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  };
  const a = fmt(s.dateDebut);
  const b = fmt(s.dateFin);
  if (a && b) return `${a} → ${b}`;
  if (a) return `Début ${a}`;
  if (b) return `Fin ${b}`;
  return '';
}

export function getSessionStatusBadge(
  statut?: string,
): { label: string; className: string } | null {
  if (!statut) return null;
  const s = statut.toUpperCase();
  const map: Record<string, { label: string; className: string }> = {
    OUVERTE: {
      label: 'Ouverte',
      className:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    },
    EN_COURS: {
      label: 'En cours',
      className:
        'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    },
    PLANIFIEE: {
      label: 'Planifiée',
      className:
        'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    },
    TERMINEE: {
      label: 'Terminée',
      className:
        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    },
    ARCHIVEE: {
      label: 'Archivée',
      className:
        'bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400',
    },
  };
  return (
    map[s] ?? { label: statut, className: 'bg-muted text-muted-foreground' }
  );
}