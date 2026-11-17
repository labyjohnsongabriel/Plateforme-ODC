// src/models/enums.ts

/* ═══════════════════════════════════════════════════════════════════════════
   ENUMS PARTAGÉS
   ═══════════════════════════════════════════════════════════════════════════ */

// ✅ Ré-export RoleName depuis Role.entity.ts (source unique)
export { RoleName } from './Role.entity';

/* ─── Statuts sessions ───────────────────────────────────────────────── */
export enum StatutSession {
  PLANIFIEE = 'PLANIFIEE',
  OUVERTE = 'OUVERTE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
}

/* ─── Statuts inscriptions ───────────────────────────────────────────── */
export enum StatutInscription {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
  LISTE_ATTENTE = 'LISTE_ATTENTE',
  ANNULEE = 'ANNULEE',
}

/* ─── Statuts présences ──────────────────────────────────────────────── */
export enum StatutPresence {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  RETARD = 'RETARD',
  EXCUSE = 'EXCUSE',
}

/* ─── Statuts attestations ───────────────────────────────────────────── */
export enum StatutAttestation {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDEE = 'VALIDEE',
  REVOQUEE = 'REVOQUEE',
}

/* ─── Statuts formations ─────────────────────────────────────────────── */
export enum StatutFormation {
  BROUILLON = 'BROUILLON',
  PUBLIEE = 'PUBLIEE',
  ARCHIVEE = 'ARCHIVEE',
}

/* ─── Niveaux formation ──────────────────────────────────────────────── */
export enum NiveauFormation {
  DEBUTANT = 'DEBUTANT',
  INTERMEDIAIRE = 'INTERMEDIAIRE',
  AVANCE = 'AVANCE',
}

/* ─── Types session ──────────────────────────────────────────────────── */
export enum TypeSession {
  PRESENTIEL = 'PRESENTIEL',
  EN_LIGNE = 'EN_LIGNE',
  HYBRIDE = 'HYBRIDE',
}

/* ─── Types évaluation ───────────────────────────────────────────────── */
export enum TypeEvaluation {
  PRE_TEST = 'PRE_TEST',
  POST_TEST = 'POST_TEST',
  QUIZ = 'QUIZ',
  PROJET = 'PROJET',
  EXAMEN = 'EXAMEN',
  TP = 'TP',
  ORAL = 'ORAL',
}

/* ─── Types questions ────────────────────────────────────────────────── */
export enum QuestionType {
  QCM = 'QCM',
  QCM_MULTIPLE = 'QCM_MULTIPLE',
  VRAI_FAUX = 'VRAI_FAUX',
  TEXTE_COURT = 'TEXTE_COURT',
  TEXTE_LONG = 'TEXTE_LONG',
  CODE = 'CODE',
  FICHIER = 'FICHIER',
}

/* ─── Méthodes de présence ───────────────────────────────────────────── */
export enum MethodePresence {
  QR_CODE = 'QR_CODE',
  MANUEL = 'MANUEL',
}