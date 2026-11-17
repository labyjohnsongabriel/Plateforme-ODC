// src/entities/enums/EvaluationEnums.ts

/* ═══════════════════════════════════════════════════════════════════════════
   TYPE D'ÉVALUATION
   ═══════════════════════════════════════════════════════════════════════════ */

export enum TypeEvaluation {
  PRE_TEST = 'PRE_TEST',
  POST_TEST = 'POST_TEST',
  QUIZ = 'QUIZ',
  PROJET = 'PROJET',
  EXAMEN = 'EXAMEN',
  TP = 'TP',
  ORAL = 'ORAL',
}

export const TYPE_EVALUATION_VALUES: readonly TypeEvaluation[] = Object.values(TypeEvaluation);

export function isTypeEvaluation(value: unknown): value is TypeEvaluation {
  return (
    typeof value === 'string' &&
    (TYPE_EVALUATION_VALUES as readonly string[]).includes(value)
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TYPE DE QUESTION
   ⚠️ Les VALEURS doivent correspondre EXACTEMENT à la colonne
      `questions.type` (VARCHAR(50)) en base de données.
   
   En base :
     'QCM'           → QCM_SIMPLE
     'QCM_MULTIPLE'  → QCM_MULTIPLE
     'VRAI_FAUX'     → VRAI_FAUX
     'TEXTE_COURT'   → TEXTE_COURT
     'TEXTE_LONG'    → TEXTE_LONG
     'CODE'          → CODE
     'FICHIER'       → FICHIER
   ═══════════════════════════════════════════════════════════════════════════ */

export enum TypeQuestion {
  QCM_SIMPLE = 'QCM',           // ⚠️ Valeur en base = 'QCM', pas 'QCM_SIMPLE'
  QCM_MULTIPLE = 'QCM_MULTIPLE',
  VRAI_FAUX = 'VRAI_FAUX',
  TEXTE_COURT = 'TEXTE_COURT',
  TEXTE_LONG = 'TEXTE_LONG',
  CODE = 'CODE',
  FICHIER = 'FICHIER',
}

/** Toutes les valeurs valides (celles stockées en base) */
export const TYPE_QUESTION_VALUES: readonly TypeQuestion[] = Object.values(TypeQuestion);

/**
 * Vérifie qu'une valeur est un TypeQuestion valide.
 * 
 * @example
 *   isTypeQuestion('QCM')           → true
 *   isTypeQuestion('QCM_MULTIPLE')  → true
 *   isTypeQuestion('QCM_SIMPLE')    → false  (ce n'est PAS la valeur en base)
 *   isTypeQuestion('INCONNU')       → false
 */
export function isTypeQuestion(value: unknown): value is TypeQuestion {
  return (
    typeof value === 'string' &&
    (TYPE_QUESTION_VALUES as readonly string[]).includes(value)
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LABELS POUR L'AFFICHAGE (optionnel)
   ═══════════════════════════════════════════════════════════════════════════ */

export const TYPE_QUESTION_LABELS: Record<TypeQuestion, string> = {
  [TypeQuestion.QCM_SIMPLE]: 'Choix unique',
  [TypeQuestion.QCM_MULTIPLE]: 'Choix multiple',
  [TypeQuestion.VRAI_FAUX]: 'Vrai / Faux',
  [TypeQuestion.TEXTE_COURT]: 'Réponse courte',
  [TypeQuestion.TEXTE_LONG]: 'Réponse longue',
  [TypeQuestion.CODE]: 'Code',
  [TypeQuestion.FICHIER]: 'Fichier',
};

/**
 * Retourne le label lisible d'un type de question.
 */
export function getQuestionTypeLabel(type: string | null | undefined): string {
  if (!type) return '—';
  return TYPE_QUESTION_LABELS[type as TypeQuestion] ?? String(type);
}