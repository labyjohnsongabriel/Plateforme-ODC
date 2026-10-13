// src/lib/constants.ts

/* ============================================================================
   APPLICATION
   ============================================================================ */

export const APP_NAME = 'Orange Digital Center';
export const APP_SHORT_NAME = 'ODC';
export const APP_DESCRIPTION =
  'Plateforme de gestion des formations de l\'Orange Digital Center';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:5000';
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0';

/* ============================================================================
   PAGINATION
   ============================================================================ */

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const MAX_LIMIT = 100;

/* ============================================================================
   UPLOAD
   ============================================================================ */

export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_FILE_SIZE_MB = 20;
export const MAX_DOCUMENT_SIZE_MB = 50;

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];

export const ACCEPTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

/* ============================================================================
   DURÉES
   ============================================================================ */

export const ONE_SECOND = 1000;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const ONE_DAY = 24 * ONE_HOUR;
export const ONE_WEEK = 7 * ONE_DAY;

export const QUERY_STALE_TIME = 5 * ONE_MINUTE;
export const QUERY_CACHE_TIME = 30 * ONE_MINUTE;
export const DEBOUNCE_DELAY = 300;
export const TOAST_DURATION = 5000;

/* ============================================================================
   RÔLES
   ============================================================================ */

export const ROLES = {
  ADMINISTRATEUR: 'ADMINISTRATEUR',
  STAFF_ODC: 'STAFF_ODC',
  FORMATEUR: 'FORMATEUR',
  PARTICIPANT: 'PARTICIPANT',
  PARTENAIRE: 'PARTENAIRE',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  ADMINISTRATEUR: 'Administrateur',
  STAFF_ODC: 'Staff ODC',
  FORMATEUR: 'Formateur',
  PARTICIPANT: 'Participant',
  PARTENAIRE: 'Partenaire',
};

/* ============================================================================
   STATUTS
   ============================================================================ */

export const SESSION_STATUS = {
  OUVERTE: 'OUVERTE',
  FERMEE: 'FERMEE',
  COMPLETE: 'COMPLETE',
  EN_COURS: 'EN_COURS',
  TERMINEE: 'TERMINEE',
  ANNULEE: 'ANNULEE',
} as const;

export const INSCRIPTION_STATUS = {
  EN_ATTENTE: 'EN_ATTENTE',
  ACCEPTEE: 'ACCEPTEE',
  REFUSEE: 'REFUSEE',
  ANNULEE: 'ANNULEE',
  LISTE_ATTENTE: 'LISTE_ATTENTE',
} as const;

export const PRESENCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  RETARD: 'RETARD',
  EXCUSE: 'EXCUSE',
} as const;

/* ============================================================================
   NIVEAUX
   ============================================================================ */

export const NIVEAUX = {
  DEBUTANT: 'DEBUTANT',
  INTERMEDIAIRE: 'INTERMEDIAIRE',
  AVANCE: 'AVANCE',
} as const;

export const NIVEAU_LABELS: Record<string, string> = {
  DEBUTANT: 'Débutant',
  INTERMEDIAIRE: 'Intermédiaire',
  AVANCE: 'Avancé',
};

/* ============================================================================
   NOTIFICATIONS
   ============================================================================ */

export const NOTIFICATION_TYPES = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
} as const;

/* ============================================================================
   RÉGEX
   ============================================================================ */

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_MG: /^(\+261|0)\s?(3[2-4]|3[8-9])\s?\d{2}\s?\d{3}\s?\d{2}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  POSTAL_CODE: /^\d{3,5}$/,
  URL: /^https?:\/\/[^\s]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};

/* ============================================================================
   STORAGE KEYS
   ============================================================================ */

export const STORAGE_KEYS = {
  AUTH: 'odc-auth',
  THEME: 'odc-theme',
  SIDEBAR: 'odc-sidebar',
  LANGUAGE: 'odc-language',
  FILTERS: 'odc-filters',
} as const;

/* ============================================================================
   NAVIGATION
   ============================================================================ */

export const ROUTES = {
  HOME: '/',
  LOGIN: '/connexion',
  REGISTER: '/inscription',
  FORGOT_PASSWORD: '/mot-de-passe-oublie',
  RESET_PASSWORD: '/reinitialiser-mot-de-passe',

  FORMATIONS: '/formations',
  SESSIONS: '/sessions',

  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  STAFF: '/staff',
  FORMATEUR: '/formateur',
  PARTICIPANT: '/participant',
  PARTENAIRE: '/partenaire',

  NOTIFICATIONS: '/notifications',
  MESSAGERIE: '/messagerie',
  PARAMETRES: '/parametres',
  PROFIL: '/profil',
} as const;

/* ============================================================================
   LIMITES
   ============================================================================ */

export const LIMITS = {
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 5000,
  MAX_MESSAGE_LENGTH: 2000,
  MAX_COMMENT_LENGTH: 1000,
  MIN_PASSWORD_LENGTH: 8,
  MAX_FILE_NAME_LENGTH: 255,
} as const;