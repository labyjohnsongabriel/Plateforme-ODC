// src/lib/evaluations/participant.ts

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES & ENUMS
   ═══════════════════════════════════════════════════════════════════════════ */

// ✅ CORRECTION : Utilisation d'un enum (valeur runtime) et non d'un type
export enum EvaluationStatus {
  DISPONIBLE = 'DISPONIBLE',
  EN_COURS = 'EN_COURS',
  SOUMISE = 'SOUMISE',
  A_VENIR = 'A_VENIR',
  EXPIREE = 'EXPIREE',
}

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
  dateDebut?: string | null; // ✅ AJOUT
  dateFin?: string | null;   // ✅ AJOUT
  dureeMinutes?: number | null;
  estPubliee: boolean;
  sessionId: string;
  createurId?: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Infos calculées côté API / Soumission
  noteObtenue?: number | null;
  soumise: boolean;
  demarree: boolean;
  maSoumissionId?: string | null;
  soumisAt?: string | null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   NORMALISATION (API -> UI)
   ═══════════════════════════════════════════════════════════════════════════ */

/** Normalise la réponse brute de l'API (snake_case → camelCase) */
export function normalizeEvaluations(raw: any): ParticipantEvaluation[] {
  if (!raw) return [];
  
  const list = Array.isArray(raw) ? raw : raw?.data ?? raw?.items ?? [];
  if (!Array.isArray(list)) return [];

  return list
    .map(normalizeEvaluation)
    .filter((e): e is ParticipantEvaluation => e !== null);
}

export function normalizeEvaluation(e: any): ParticipantEvaluation | null {
  if (!e || typeof e !== 'object') return null;
  const id = e.id ?? e.evaluationId ?? e._id;
  if (!id) return null;

  const num = (val: unknown, fallback: number) => 
    typeof val === 'number' && Number.isFinite(val) ? val : fallback;
    
  const str = (val: unknown): string | null => 
    typeof val === 'string' && val.trim() !== '' ? val : null;

  return {
    id: String(id),
    titre: e.titre ?? e.title ?? 'Sans titre',
    type: String(e.type ?? e.evaluationType ?? 'QUIZ').toUpperCase(),
    description: str(e.description),
    consignes: str(e.consignes),
    noteMax: Number(e.noteMax ?? e.note_max ?? 20),
    noteMinPassage: Number(e.noteMinPassage ?? e.note_min_passage ?? 10),
    coefficient: Number(e.coefficient ?? 1),
    dateEvaluation: e.dateEvaluation ?? e.date_evaluation ?? null,
    dateDebut: e.dateDebut ?? e.date_debut ?? e.startDate ?? null,
    dateFin: e.dateFin ?? e.date_fin ?? e.endDate ?? null,
    dureeMinutes: e.dureeMinutes != null ? Number(e.dureeMinutes) : (e.duree_minutes != null ? Number(e.duree_minutes) : null),
    estPubliee: Boolean(e.estPubliee ?? e.publiee ?? e.published ?? false),
    sessionId: e.sessionId ?? e.session_id,
    createurId: e.createurId ?? e.createur_id ?? null,
    createdAt: e.createdAt ?? e.created_at,
    updatedAt: e.updatedAt ?? e.updated_at,
    
    noteObtenue: e.noteObtenue != null ? Number(e.noteObtenue) : (e.note_obtenue != null ? Number(e.note_obtenue) : null),
    soumise: Boolean(e.soumise ?? e.dejaSoumise ?? e.submitted ?? e.maSoumissionId),
    demarree: Boolean(e.demarree ?? e.started ?? e.dateDebutReponse),
    maSoumissionId: e.maSoumissionId ?? e.ma_soumission_id ?? null,
    soumisAt: e.soumisAt ?? e.soumis_at ?? null,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOGIQUE MÉTIER
   ═══════════════════════════════════════════════════════════════════════════ */

export function computeStatus(e: ParticipantEvaluation): EvaluationStatus {
  // 1. Si déjà soumise, c'est prioritaire
  if (e.soumise || e.maSoumissionId || e.soumisAt) {
    return EvaluationStatus.SOUMISE;
  }

  // 2. Si non publiée, on ne devrait même pas la voir (filtré en amont), mais par sécurité :
  if (!e.estPubliee) {
    return EvaluationStatus.A_VENIR;
  }

  const now = Date.now();
  
  // 3. Vérification de la fenêtre temporelle explicite (Date début / Date fin)
  const dateDebut = e.dateDebut ? Date.parse(e.dateDebut) : NaN;
  const dateFin = e.dateFin ? Date.parse(e.dateFin) : NaN;

  if (!Number.isNaN(dateDebut) && now < dateDebut) {
    return EvaluationStatus.A_VENIR;
  }
  
  if (!Number.isNaN(dateFin) && now > dateFin) {
    return EvaluationStatus.EXPIREE;
  }

  // 4. Fallback : Si le backend n'a pas fourni dateDebut/dateFin, on utilise l'ancienne méthode (dateEvaluation + duree)
  if (e.dateEvaluation && Number.isNaN(dateDebut) && Number.isNaN(dateFin)) {
    const d = new Date(e.dateEvaluation).getTime();
    if (!Number.isNaN(d)) {
      if (now < d) return EvaluationStatus.A_VENIR;
      
      const end = e.dureeMinutes ? d + e.dureeMinutes * 60_000 : null;
      if (end && now > end) return EvaluationStatus.EXPIREE;
    }
  }

  // 5. Si le participant a commencé mais pas encore soumis
  if (e.demarree) {
    return EvaluationStatus.EN_COURS;
  }

  // 6. Par défaut, elle est disponible
  return EvaluationStatus.DISPONIBLE;
}

// ✅ AJOUT : Cette fonction manquait, causant "undefined is not a function"
export function isPublished(e: ParticipantEvaluation): boolean {
  return e?.estPubliee !== false;
}

export function sortEvaluations(list: ParticipantEvaluation[]) {
  // Priorité d'action pour le participant
  const weight: Record<EvaluationStatus, number> = {
    [EvaluationStatus.EN_COURS]: 0,     // À reprendre en priorité
    [EvaluationStatus.DISPONIBLE]: 1,   // À faire
    [EvaluationStatus.A_VENIR]: 2,      // Bloqué temporairement
    [EvaluationStatus.EXPIREE]: 3,      // Raté
    [EvaluationStatus.SOUMISE]: 4,      // Terminé
  };

  return [...list].sort((a, b) => {
    const wa = weight[computeStatus(a)];
    const wb = weight[computeStatus(b)];
    if (wa !== wb) return wa - wb;
    // À poids égal, on trie par date d'évaluation (les plus récentes d'abord)
    return (b.dateEvaluation ?? '').localeCompare(a.dateEvaluation ?? '');
  });
}