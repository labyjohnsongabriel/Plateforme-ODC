// src/lib/evaluations/participant-detail.ts

import {
  Question, QuestionType, ParticipantEvaluation,
  isQuestionType,
} from './types';

export { QUESTION_TYPE_VALUES } from './types';

export type Reponse =
  | { type: 'QCM'; optionId: string }
  | { type: 'QCM_MULTIPLE'; optionIds: string[] }
  | { type: 'VRAI_FAUX'; valeur: boolean }
  | { type: 'TEXTE_COURT'; texte: string }
  | { type: 'TEXTE_LONG'; texte: string }
  | { type: 'CODE'; texte: string }
  | { type: 'FICHIER'; fichierUrl: string; nomFichier: string };

export interface MaSoumission {
  id: string;
  soumisAt: string;
  statut: string;
  noteObtenue?: number | null;
  noteMaxSnapshot?: number | null;
  pourcentage?: number | null;
  commentaire?: string | null;
  feedbackFormateur?: string | null;
  corrigeAt?: string | null;
  reponsesParQuestion?: Record<string, Reponse>;
}

export interface ParticipantEvaluationDetail extends ParticipantEvaluation {
  questions: Question[];
  maSoumission?: MaSoumission | null;
}

export const QUESTION_TYPE_LABEL: Record<string, string> = {
  QCM: 'Choix unique',
  QCM_MULTIPLE: 'Choix multiple',
  VRAI_FAUX: 'Vrai / Faux',
  TEXTE_COURT: 'Réponse courte',
  TEXTE_LONG: 'Réponse longue',
  CODE: 'Code',
  FICHIER: 'Fichier',
};

export function isAnswered(r?: Reponse): boolean {
  if (!r) return false;
  switch (r.type) {
    case 'QCM': return !!r.optionId;
    case 'QCM_MULTIPLE': return r.optionIds.length > 0;
    case 'VRAI_FAUX': return typeof r.valeur === 'boolean';
    case 'TEXTE_COURT':
    case 'TEXTE_LONG':
    case 'CODE': return r.texte.trim().length > 0;
    case 'FICHIER': return !!r.fichierUrl;
  }
}

export function normalizeQuestion(raw: any): Question {
  return {
    id: raw.id,
    type: (isQuestionType(raw.type) ? raw.type : 'QCM') as QuestionType,
    enonce: raw.enonce ?? '',
    points: Number(raw.points ?? 1),
    obligatoire: Boolean(raw.obligatoire),
    ordre: Number(raw.ordre ?? 0),
    bonneReponse: raw.bonneReponse ?? raw.bonne_reponse ?? null,
    explication: raw.explication ?? null,
    options: (raw.options ?? raw.question_options ?? []).map((o: any) => ({
      id: o.id,
      label: o.label ?? '',
      correct: Boolean(o.correct),
      ordre: Number(o.ordre ?? 0),
      explication: o.explication ?? null,
    })),
  };
}

export function normalizeMaSoumission(raw: any): MaSoumission | null {
  if (!raw) return null;
  return {
    id: raw.id,
    soumisAt: raw.soumisAt ?? raw.soumis_at ?? raw.createdAt ?? raw.created_at,
    statut: raw.statut ?? 'SOUMISE',
    noteObtenue: raw.noteObtenue != null ? Number(raw.noteObtenue)
      : raw.note_obtenue != null ? Number(raw.note_obtenue) : null,
    noteMaxSnapshot: raw.noteMaxSnapshot != null ? Number(raw.noteMaxSnapshot)
      : raw.note_max_snapshot != null ? Number(raw.note_max_snapshot) : null,
    pourcentage: raw.pourcentage != null ? Number(raw.pourcentage) : null,
    commentaire: raw.commentaire ?? null,
    feedbackFormateur: raw.feedbackFormateur ?? raw.feedback_formateur ?? null,
    corrigeAt: raw.corrigeAt ?? raw.corrige_at ?? null,
    reponsesParQuestion:
      raw.reponsesParQuestion ?? raw.reponses_par_question ?? {},
  };
}