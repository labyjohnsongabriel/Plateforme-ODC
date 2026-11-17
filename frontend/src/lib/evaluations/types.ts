// src/lib/evaluations/types.ts

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES PRINCIPAUX
   ═══════════════════════════════════════════════════════════════════════════ */

export type EvaluationType =
  | 'PRE_TEST' | 'POST_TEST' | 'QUIZ'
  | 'PROJET' | 'EXAMEN' | 'TP' | 'ORAL';

export const EVALUATION_TYPE_VALUES: readonly EvaluationType[] = [
  'PRE_TEST', 'POST_TEST', 'QUIZ', 'PROJET', 'EXAMEN', 'TP', 'ORAL',
] as const;

export const DEFAULT_EVALUATION_TYPE: EvaluationType = 'QUIZ';

export function isEvaluationType(value: unknown): value is EvaluationType {
  return (
    typeof value === 'string' &&
    (EVALUATION_TYPE_VALUES as readonly string[]).includes(value)
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   OPTIONS D'AFFICHAGE
   ═══════════════════════════════════════════════════════════════════════════ */

export interface EvaluationTypeOption {
  value: EvaluationType;
  label: string;
  icon: string;
  hasQuestions: boolean;
  hasRubric: boolean;
}

export const EVALUATION_TYPES: readonly EvaluationTypeOption[] = [
  { value: 'PRE_TEST',  label: 'Pré-test',          icon: '📋', hasQuestions: true,  hasRubric: false },
  { value: 'POST_TEST', label: 'Post-test',         icon: '📊', hasQuestions: true,  hasRubric: false },
  { value: 'QUIZ',      label: 'Quiz',              icon: '❓', hasQuestions: true,  hasRubric: false },
  { value: 'PROJET',    label: 'Projet',            icon: '🛠️', hasQuestions: false, hasRubric: true  },
  { value: 'EXAMEN',    label: 'Examen',            icon: '📝', hasQuestions: true,  hasRubric: false },
  { value: 'TP',        label: 'Travaux pratiques', icon: '⚙️', hasQuestions: false, hasRubric: true  },
  { value: 'ORAL',      label: 'Oral',              icon: '🎤', hasQuestions: false, hasRubric: true  },
] as const;

export function getTypeLabel(type: EvaluationType | string | null | undefined): string {
  if (!type) return '—';
  return EVALUATION_TYPES.find((t) => t.value === type)?.label ?? String(type);
}

export function getTypeIcon(type: EvaluationType | string | null | undefined): string {
  if (!type) return '📋';
  return EVALUATION_TYPES.find((t) => t.value === type)?.icon ?? '📋';
}

/* ═══════════════════════════════════════════════════════════════════════════
   QUESTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

export type QuestionType =
  | 'QCM'
  | 'QCM_MULTIPLE'
  | 'VRAI_FAUX'
  | 'TEXTE_COURT'
  | 'TEXTE_LONG'
  | 'CODE'
  | 'FICHIER';

export const QUESTION_TYPE_VALUES: readonly QuestionType[] = [
  'QCM', 'QCM_MULTIPLE', 'VRAI_FAUX', 'TEXTE_COURT', 'TEXTE_LONG', 'CODE', 'FICHIER',
] as const;

export function isQuestionType(value: unknown): value is QuestionType {
  return (
    typeof value === 'string' &&
    (QUESTION_TYPE_VALUES as readonly string[]).includes(value)
  );
}

export interface QuestionOption {
  id: string;
  label: string;
  correct: boolean;
  ordre?: number;
  explication?: string | null;
}

export interface Question {
  id: string;
  type: QuestionType;
  enonce: string;
  points: number;
  obligatoire: boolean;
  ordre: number;
  bonneReponse?: string | null;
  explication?: string | null;
  options: QuestionOption[];
}

export const QUESTION_TYPES: readonly { value: QuestionType; label: string }[] = [
  { value: 'QCM',          label: 'Choix unique (QCM)' },
  { value: 'QCM_MULTIPLE', label: 'Choix multiple' },
  { value: 'VRAI_FAUX',    label: 'Vrai / Faux' },
  { value: 'TEXTE_COURT',  label: 'Réponse courte' },
  { value: 'TEXTE_LONG',   label: 'Réponse longue' },
  { value: 'CODE',         label: 'Code / script' },
  { value: 'FICHIER',      label: 'Fichier à déposer' },
] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   GRILLE D'ÉVALUATION (RUBRIC)
   ═══════════════════════════════════════════════════════════════════════════ */

export interface RubricCriterion {
  id: string;
  label: string;
  description: string;
  poids: number;
  noteMax: number;
  ordre?: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG MÉTIER PAR TYPE
   ═══════════════════════════════════════════════════════════════════════════ */

export type ExtraField = 'livrables' | 'critereOral' | 'outils';

export interface TypeConfig {
  showCoefficient: boolean;
  showDuree: boolean;
  showConsignes: boolean;
  showDate: boolean;
  showQuestions: boolean;
  showRubric: boolean;
  defaultNoteMax: number;
  defaultNoteMinPassage: number;
  defaultCoefficient: number;
  defaultDureeMinutes: number;
  descriptionHint: string;
  consignesHint: string;
  extraFields?: readonly ExtraField[];
}

export const TYPE_CONFIG: Readonly<Record<EvaluationType, TypeConfig>> = {
  PRE_TEST: {
    showCoefficient: false, showDuree: true, showConsignes: true, showDate: true,
    showQuestions: true, showRubric: false,
    defaultNoteMax: 20, defaultNoteMinPassage: 10, defaultCoefficient: 1, defaultDureeMinutes: 30,
    descriptionHint: 'Objectifs diagnostiqués par ce pré-test',
    consignesHint: 'Instructions données avant le début du test',
  },
  POST_TEST: {
    showCoefficient: true, showDuree: true, showConsignes: true, showDate: true,
    showQuestions: true, showRubric: false,
    defaultNoteMax: 20, defaultNoteMinPassage: 10, defaultCoefficient: 1, defaultDureeMinutes: 30,
    descriptionHint: 'Compétences acquises mesurées par ce post-test',
    consignesHint: 'Instructions données avant le début du test',
  },
  QUIZ: {
    showCoefficient: true, showDuree: true, showConsignes: true, showDate: true,
    showQuestions: true, showRubric: false,
    defaultNoteMax: 20, defaultNoteMinPassage: 10, defaultCoefficient: 1, defaultDureeMinutes: 15,
    descriptionHint: 'Thème et objectif pédagogique du quiz',
    consignesHint: 'Nombre de questions, tentatives, règles',
  },
  PROJET: {
    showCoefficient: true, showDuree: false, showConsignes: true, showDate: true,
    showQuestions: false, showRubric: true,
    defaultNoteMax: 20, defaultNoteMinPassage: 10, defaultCoefficient: 2, defaultDureeMinutes: 0,
    descriptionHint: 'Contexte et objectifs du projet',
    consignesHint: "Livrables attendus, critères d'évaluation, échéances",
    extraFields: ['livrables'],
  },
  EXAMEN: {
    showCoefficient: true, showDuree: true, showConsignes: true, showDate: true,
    showQuestions: true, showRubric: false,
    defaultNoteMax: 20, defaultNoteMinPassage: 10, defaultCoefficient: 3, defaultDureeMinutes: 120,
    descriptionHint: "Programme couvert par l'examen",
    consignesHint: 'Documents autorisés, format, règles',
  },
  TP: {
    showCoefficient: true, showDuree: true, showConsignes: true, showDate: true,
    showQuestions: false, showRubric: true,
    defaultNoteMax: 20, defaultNoteMinPassage: 10, defaultCoefficient: 1.5, defaultDureeMinutes: 90,
    descriptionHint: 'Compétences pratiques évaluées',
    consignesHint: 'Matériel, environnement, consignes de sécurité',
    extraFields: ['outils'],
  },
  ORAL: {
    showCoefficient: true, showDuree: true, showConsignes: true, showDate: true,
    showQuestions: false, showRubric: true,
    defaultNoteMax: 20, defaultNoteMinPassage: 10, defaultCoefficient: 2, defaultDureeMinutes: 15,
    descriptionHint: 'Sujet de la présentation orale',
    consignesHint: "Durée, support, critères d'évaluation",
    extraFields: ['critereOral'],
  },
};

export function getTypeConfig(
  type: EvaluationType | string | null | undefined,
): TypeConfig {
  const safeType: EvaluationType = isEvaluationType(type)
    ? type
    : DEFAULT_EVALUATION_TYPE;
  return TYPE_CONFIG[safeType];
}

export function typeHasField(
  type: EvaluationType | string | null | undefined,
  field: ExtraField,
): boolean {
  return !!getTypeConfig(type).extraFields?.includes(field);
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS DE GÉNÉRATION D'ID
   ═══════════════════════════════════════════════════════════════════════════ */

let _uid = 0;

export function genId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `tmp_${prefix}_${crypto.randomUUID()}`;
  }
  _uid += 1;
  return `tmp_${prefix}_${Date.now()}_${_uid}`;
}

export function isTempId(id: string | null | undefined): boolean {
  return !!id && id.startsWith('tmp_');
}

/* ═══════════════════════════════════════════════════════════════════════════
   FACTORIES
   ═══════════════════════════════════════════════════════════════════════════ */

export function newOption(label = '', correct = false, ordre = 0): QuestionOption {
  return { id: genId('o'), label, correct, ordre };
}

export function newQuestion(
  type: QuestionType = 'QCM',
  points = 1,
  ordre = 0,
): Question {
  let options: QuestionOption[] = [];
  if (type === 'VRAI_FAUX') {
    options = [newOption('Vrai', true, 0), newOption('Faux', false, 1)];
  } else if (type === 'QCM' || type === 'QCM_MULTIPLE') {
    options = [newOption('', false, 0), newOption('', false, 1)];
  }
  return {
    id: genId('q'),
    type,
    enonce: '',
    points,
    obligatoire: true,
    ordre,
    bonneReponse: null,
    explication: null,
    options,
  };
}

export function newCriterion(ordre = 0): RubricCriterion {
  return {
    id: genId('c'),
    label: '',
    description: '',
    poids: 1,
    noteMax: 5,
    ordre,
  };
}