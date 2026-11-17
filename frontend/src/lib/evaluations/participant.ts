// lib/evaluations/participant.ts

export type EvaluationStatus =
  | 'DISPONIBLE' | 'EN_COURS' | 'SOUMISE' | 'A_VENIR' | 'EXPIREE';

export interface ParticipantEvaluation {
  id: string;
  titre: string;
  type: string;
  description?: string | null;
  consignes?: string | null;
  noteMax: number;
  noteMinPassage: number;
  coefficient: number;
  dateEvaluation?: string | null;
  dureeMinutes?: number | null;
  publiee: boolean;
  sessionId: string;
  createurId?: string | null;
  createdAt: string;
  updatedAt: string;
  // Infos calculées côté API
  noteObtenue?: number | null;
  maSoumissionId?: string | null;
  soumisAt?: string | null;
}

/** Normalise la réponse brute de l'API (snake_case → camelCase) */
export function normalizeEvaluations(raw: any): ParticipantEvaluation[] {
  const list = Array.isArray(raw) ? raw : raw?.data ?? [];
  return list.map(normalizeEvaluation);
}

export function normalizeEvaluation(e: any): ParticipantEvaluation {
  return {
    id: e.id,
    titre: e.titre,
    type: (e.type ?? 'QUIZ').toUpperCase(),
    description: e.description ?? null,
    consignes: e.consignes ?? null,
    noteMax: Number(e.noteMax ?? e.note_max ?? 20),
    noteMinPassage: Number(e.noteMinPassage ?? e.note_min_passage ?? 10),
    coefficient: Number(e.coefficient ?? 1),
    dateEvaluation: e.dateEvaluation ?? e.date_evaluation ?? null,
    dureeMinutes:
      e.dureeMinutes != null
        ? Number(e.dureeMinutes)
        : e.duree_minutes != null
          ? Number(e.duree_minutes)
          : null,
    publiee: Boolean(e.publiee),
    sessionId: e.sessionId ?? e.session_id,
    createurId: e.createurId ?? e.createur_id ?? null,
    createdAt: e.createdAt ?? e.created_at,
    updatedAt: e.updatedAt ?? e.updated_at,
    noteObtenue:
      e.noteObtenue != null
        ? Number(e.noteObtenue)
        : e.note_obtenue != null
          ? Number(e.note_obtenue)
          : null,
    maSoumissionId: e.maSoumissionId ?? e.ma_soumission_id ?? null,
    soumisAt: e.soumisAt ?? e.soumis_at ?? null,
  };
}

export function computeStatus(e: ParticipantEvaluation): EvaluationStatus {
  if (e.maSoumissionId) return 'SOUMISE';
  if (!e.publiee) return 'A_VENIR';
  if (e.dateEvaluation) {
    const d = new Date(e.dateEvaluation);
    const now = new Date();
    const end = e.dureeMinutes
      ? new Date(d.getTime() + e.dureeMinutes * 60_000)
      : null;
    if (d > now) return 'A_VENIR';
    if (end && end < now) return 'EXPIREE';
    if (d <= now && (!end || end >= now)) return 'DISPONIBLE';
  }
  return 'DISPONIBLE';
}

export function sortEvaluations(list: ParticipantEvaluation[]) {
  const weight: Record<EvaluationStatus, number> = {
    DISPONIBLE: 0,
    EN_COURS: 1,
    A_VENIR: 2,
    SOUMISE: 3,
    EXPIREE: 4,
  };
  return [...list].sort((a, b) => {
    const wa = weight[computeStatus(a)];
    const wb = weight[computeStatus(b)];
    if (wa !== wb) return wa - wb;
    return (b.dateEvaluation ?? '').localeCompare(a.dateEvaluation ?? '');
  });
}