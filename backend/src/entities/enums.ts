// src/entities/enums.ts

/* ============================================================================
   RÔLES
   ⚠️ Le rôle est géré par l'entité Role (table dédiée + permissions).
   On garde uniquement un enum de référence pour les seeds/middlewares.
   ============================================================================ */

export enum RoleName {
  ADMINISTRATEUR = 'ADMINISTRATEUR',
  STAFF_ODC = 'STAFF_ODC',
  FORMATEUR = 'FORMATEUR',
  PARTICIPANT = 'PARTICIPANT',
  PARTENAIRE = 'PARTENAIRE',
}

/* ============================================================================
   SESSIONS
   ============================================================================ */

export enum StatutSession {
  PLANIFIEE = 'PLANIFIEE',
  OUVERTE = 'OUVERTE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
}

// ⭐ AJOUTER — Utilisé par Session.entity.ts
export enum ModaliteSession {
  PRESENTIEL = 'PRESENTIEL',
  EN_LIGNE = 'EN_LIGNE',
  HYBRIDE = 'HYBRIDE',
}

/* ============================================================================
   INSCRIPTIONS
   ============================================================================ */

export enum StatutInscription {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
  LISTE_ATTENTE = 'LISTE_ATTENTE',
  ANNULEE = 'ANNULEE',
}

/* ============================================================================
   PRÉSENCES
   ============================================================================ */

export enum StatutPresence {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  RETARD = 'RETARD',
  EXCUSE = 'EXCUSE',
}

export enum MethodePresence {
  QR_CODE = 'QR_CODE',
  MANUEL = 'MANUEL',
}

/* ============================================================================
   ÉVALUATIONS
   ============================================================================ */

export enum TypeEvaluation {
  PRE_TEST = 'PRE_TEST',
  POST_TEST = 'POST_TEST',
  QUIZ = 'QUIZ',
  PROJET = 'PROJET',
  EXAMEN = 'EXAMEN',
  TP = 'TP',
  ORAL = 'ORAL',
}

/* ============================================================================
   CONNEXIONS (réseau social)
   ============================================================================ */

export enum StatutConnection {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
}

/* ============================================================================
   FORMATIONS
   ============================================================================ */

export enum NiveauFormation {
  DEBUTANT = 'DEBUTANT',
  INTERMEDIAIRE = 'INTERMEDIAIRE',
  AVANCE = 'AVANCE',
}

/* ============================================================================
   MESSAGES
   ============================================================================ */

export enum TypeMessage {
  TEXTE = 'TEXTE',
  IMAGE = 'IMAGE',
  FICHIER = 'FICHIER',
  SYSTEME = 'SYSTEME',
}

/* ============================================================================
   RESSOURCES
   ============================================================================ */

export enum TypeRessource {
  PDF = 'PDF',
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  LIEN = 'LIEN',
  DOCUMENT = 'DOCUMENT',
  PRESENTATION = 'PRESENTATION',
  AUTRE = 'AUTRE',
}

/* ============================================================================
   NOTIFICATIONS
   ============================================================================ */

export enum TypeNotification {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}