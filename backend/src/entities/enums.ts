// src/entities/enums.ts

// ⚠️ Le rôle est géré par l'entité Role (table dédiée + permissions).
// On garde uniquement un enum de référence pour les seeds/middlewares.
export enum RoleName {
  ADMINISTRATEUR = 'ADMINISTRATEUR',
  STAFF_ODC = 'STAFF_ODC',
  FORMATEUR = 'FORMATEUR',
  PARTICIPANT = 'PARTICIPANT',
  PARTENAIRE = 'PARTENAIRE',
}

export enum StatutSession {
  PLANIFIEE = 'PLANIFIEE',
  OUVERTE = 'OUVERTE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE',
}

export enum StatutInscription {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
  LISTE_ATTENTE = 'LISTE_ATTENTE',
  ANNULEE = 'ANNULEE',
}

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

export enum TypeEvaluation {
  PRE_TEST = 'PRE_TEST',
  POST_TEST = 'POST_TEST',
  QUIZ = 'QUIZ',
  PROJET = 'PROJET',
  EXAMEN = 'EXAMEN',
  TP = 'TP',
  ORAL = 'ORAL',
}

export enum StatutConnection {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
}

export enum NiveauFormation {
  DEBUTANT = 'DEBUTANT',
  INTERMEDIAIRE = 'INTERMEDIAIRE',
  AVANCE = 'AVANCE',
}

export enum TypeMessage {
  TEXTE = 'TEXTE',
  IMAGE = 'IMAGE',
  FICHIER = 'FICHIER',
  SYSTEME = 'SYSTEME',
}

export enum TypeRessource {
  PDF = 'PDF',
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  LIEN = 'LIEN',
  DOCUMENT = 'DOCUMENT',
  PRESENTATION = 'PRESENTATION',
  AUTRE = 'AUTRE',
}

export enum TypeNotification {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}