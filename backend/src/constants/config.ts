/**
 * ============================================================================
 *  CONFIGURATION MÉTIER — ODC PLATFORM
 * ============================================================================
 *  Valeurs par défaut, seuils et règles métier
 * ============================================================================
 */

// ============================================================================
// RÈGLES DE GESTION DES FORMATIONS
// ============================================================================
export const FORMATION_CONFIG = {
  /** Durée minimale (heures) */
  DUREE_MIN_HEURES: 1,

  /** Durée maximale (heures) */
  DUREE_MAX_HEURES: 500,

  /** Titre : longueur min/max */
  TITRE_MIN_LENGTH: 3,
  TITRE_MAX_LENGTH: 200,

  /** Description : longueur max */
  DESCRIPTION_MAX_LENGTH: 5000,

  /** Nombre max de sessions simultanées par formation */
  MAX_SESSIONS_ACTIVES: 10,

  /** Prix par défaut (Ar) */
  PRIX_DEFAUT: 0,
} as const;

// ============================================================================
// RÈGLES DE GESTION DES SESSIONS
// ============================================================================
export const SESSION_CONFIG = {
  /** Capacité minimale */
  CAPACITE_MIN: 1,

  /** Capacité maximale */
  CAPACITE_MAX: 500,

  /** Capacité par défaut */
  CAPACITE_DEFAUT: 30,

  /** Délai minimum avant ouverture des inscriptions (jours) */
  DELAI_MIN_OUVERTURE_INSCRIPTIONS: 1,

  /** Nombre de jours avant la session pour fermer les inscriptions */
  DELAI_FERMETURE_INSCRIPTIONS: 2,

  /** Durée max d'une session (jours) */
  DUREE_MAX_JOURS: 365,

  /** Nombre max de participants par formateur (en parallèle) */
  MAX_SESSIONS_PAR_FORMATEUR: 5,
} as const;

// ============================================================================
// RÈGLES DE SÉLECTION DES PARTICIPANTS
// ============================================================================
export const SELECTION_CONFIG = {
  /** Taux de présence minimum pour obtenir l'attestation */
  TAUX_PRESENCE_MIN: 75,

  /** Note minimale pour obtenir l'attestation */
  NOTE_MIN: 10,

  /** Nombre de places réservées par défaut */
  PLACES_RESERVEES: 0,

  /** Nombre max de candidats par session (pour éviter le spam) */
  MAX_CANDIDATS_SESSION: 500,

  /** Délai avant fermeture automatique des sélections (jours) */
  DELAI_FERMETURE_SELECTION: 3,
} as const;

// ============================================================================
// RÈGLES DE PRÉSENCE
// ============================================================================
export const PRESENCE_CONFIG = {
  /** Fenêtre pour scanner un QR code (minutes) */
  FENETRE_SCAN_MINUTES: 15,

  /** Tolérance de retard (minutes) */
  RETARD_TOLERANCE_MINUTES: 15,

  /** Validité d'un token QR (minutes) */
  QR_VALIDITE_MINUTES: 5,

  /** Nombre max de scans par participant et par jour */
  MAX_SCANS_JOUR: 5,

  /** Fréquence de génération du QR de session (minutes) */
  QR_REFRESH_MINUTES: 5,

  /** Nombre de jours pour justifier une absence (jours) */
  DELAI_JUSTIFICATION_JOURS: 7,
} as const;

// ============================================================================
// RÈGLES D'ÉVALUATION
// ============================================================================
export const EVALUATION_CONFIG = {
  /** Note maximale par défaut */
  NOTE_MAX_DEFAUT: 20,

  /** Note minimale par défaut */
  NOTE_MIN_DEFAUT: 0,

  /** Coefficient par défaut */
  COEFFICIENT_DEFAUT: 1,

  /** Durée min/max (minutes) */
  DUREE_MIN_MINUTES: 5,
  DUREE_MAX_MINUTES: 480,

  /** Nombre max d'évaluations par session */
  MAX_EVALUATIONS_SESSION: 20,

  /** Délai max pour saisir une note (jours après l'évaluation) */
  DELAI_SAISIE_NOTE_JOURS: 30,
} as const;

// ============================================================================
// RÈGLES DES ATTESTATIONS
// ============================================================================
export const ATTESTATION_CONFIG = {
  /** Critères d'obtention */
  CRITERES: {
    TAUX_PRESENCE_MIN: 75,      // %
    NOTE_MIN: 10,                // /20
    EVALUATIONS_OBLIGATOIRES: true,
    PAIEMENT_REQUIS: false,
  },

  /** Délais */
  DELAIS: {
    GENERATION_APRES_FIN_SESSION: 24,   // heures
    VALIDITE: null,                     // null = illimitée
    RAPPEL_AVANT_EXPIRATION: 30,        // jours
  },

  /** Sécurité */
  SECURITE: {
    SIGNATURE_NUMERIQUE: true,
    ALGORITHME_SIGNATURE: 'RSA-SHA256',
    HASH_ALGORITHME: 'SHA-256',
    QR_CODE_VERIFICATION: true,
  },

  /** Format PDF */
  FORMAT: {
    ORIENTATION: 'landscape' as const,
    TAILLE: 'A4' as const,
    MARGE_MM: 10,
    QUALITE_DPI: 300,
  },

  /** Identité ODC */
  ODC: {
    NOM: 'Orange Digital Center',
    ADRESSE: 'Antananarivo, Madagascar',
    SITE_WEB: 'https://odc.orange.mg',
    EMAIL_CONTACT: 'contact@odc.mg',
    SIGNAITAIRE: 'Directeur ODC',
    FONCTION_SIGNAITAIRE: 'Directeur',
  },
} as const;

// ============================================================================
// RÈGLES D'AUTHENTIFICATION
// ============================================================================
export const AUTH_CONFIG = {
  /** Longueur du mot de passe */
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 100,

  /** Complexité du mot de passe */
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBER: true,
  PASSWORD_REQUIRE_SPECIAL: false,

  /** Bcrypt */
  BCRYPT_ROUNDS: 12,

  /** JWT */
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',

  /** Tentatives de connexion */
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_ATTEMPT_WINDOW_MINUTES: 15,
  LOCKOUT_DURATION_MINUTES: 30,

  /** Reset password */
  RESET_TOKEN_EXPIRES_HOURS: 1,

  /** Vérification email */
  EMAIL_VERIFICATION_EXPIRES_HOURS: 24,

  /** OTP */
  OTP_LENGTH: 6,
  OTP_EXPIRES_MINUTES: 10,
} as const;

// ============================================================================
// RÈGLES DE PAGINATION
// ============================================================================
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
  LIMIT_OPTIONS: [10, 25, 50, 100],
} as const;

// ============================================================================
// RÈGLES D'UPLOAD
// ============================================================================
export const UPLOAD_CONFIG = {
  /** Tailles max (bytes) */
  MAX_FILE_SIZE: 10 * 1024 * 1024,        // 10 MB
  MAX_AVATAR_SIZE: 2 * 1024 * 1024,       // 2 MB
  MAX_DOCUMENT_SIZE: 20 * 1024 * 1024,    // 20 MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,        // 5 MB

  /** Nombre de fichiers */
  MAX_FILES_PER_REQUEST: 10,

  /** Types MIME autorisés */
  ALLOWED_IMAGE_MIMES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
  ],
  ALLOWED_DOCUMENT_MIMES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],

  /** Extensions autorisées */
  ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'],
  ALLOWED_DOCUMENT_EXTENSIONS: [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.csv',
  ],

  /** Délai de conservation des fichiers temporaires */
  TEMP_KEEP_HOURS: 24,
} as const;

// ============================================================================
// RÈGLES DE RATE LIMITING
// ============================================================================
export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 15 * 60 * 1000,              // 15 minutes
  MAX_REQUESTS: 500,
  AUTH_MAX_REQUESTS: 20,
  HEAVY_MAX_REQUESTS: 5,
  UPLOAD_MAX_REQUESTS: 10,
  MESSAGE_MAX_REQUESTS: 30,
  GENERATION_MAX_REQUESTS: 20,
} as const;

// ============================================================================
// RÈGLES DE CACHE
// ============================================================================
export const CACHE_CONFIG = {
  /** Durées TTL (secondes) */
  TTL_SHORT: 60,                          // 1 min
  TTL_MEDIUM: 300,                        // 5 min
  TTL_LONG: 3600,                         // 1 heure
  TTL_VERY_LONG: 86400,                   // 24 heures

  /** Cache HTTP */
  HTTP_CACHE_PUBLIC: 3600,
  HTTP_CACHE_PRIVATE: 0,
  HTTP_NO_CACHE: 0,
} as const;

// ============================================================================
// RÈGLES DE MESSAGERIE
// ============================================================================
export const MESSAGERIE_CONFIG = {
  /** Longueur max d'un message */
  MAX_MESSAGE_LENGTH: 5000,

  /** Nombre max de participants par groupe */
  MAX_GROUP_MEMBERS: 100,

  /** Taille max d'un fichier joint */
  MAX_ATTACHMENT_SIZE: 10 * 1024 * 1024,

  /** Délai de suppression définitive (jours) */
  SOFT_DELETE_RETENTION_DAYS: 30,

  /** Rafraîchissement du "typing" (ms) */
  TYPING_TIMEOUT_MS: 3000,
} as const;

// ============================================================================
// RÈGLES DE NOTIFICATION
// ============================================================================
export const NOTIFICATION_CONFIG = {
  /** Nombre max par utilisateur */
  MAX_PER_USER: 1000,

  /** Rétention (jours) */
  RETENTION_DAYS: 90,

  /** Notifications lues : suppression auto (jours) */
  READ_RETENTION_DAYS: 30,

  /** Envoi en masse par batch */
  BULK_BATCH_SIZE: 100,
} as const;

// ============================================================================
// RÈGLES DE RÉSEAUTAGE
// ============================================================================
export const RESEAUTAGE_CONFIG = {
  /** Nombre max de connexions par utilisateur */
  MAX_CONNECTIONS: 5000,

  /** Nombre max de demandes en attente */
  MAX_PENDING_REQUESTS: 100,

  /** Nombre de suggestions par défaut */
  DEFAULT_SUGGESTIONS: 10,

  /** Nombre max de suggestions */
  MAX_SUGGESTIONS: 50,

  /** Délai avant expiration d'une demande (jours) */
  REQUEST_EXPIRY_DAYS: 30,
} as const;

// ============================================================================
// RÈGLES DES JOBS CRON
// ============================================================================
export const CRON_CONFIG = {
  TIMEZONE: 'Indian/Antananarivo',

  SCHEDULES: {
    ATTESTATION_GENERATION: '0 2 * * *',      // 02:00 chaque jour
    VERIFICATION: '0 3 * * *',                 // 03:00 chaque jour
    RAPPELS: '0 9 * * *',                      // 09:00 chaque jour
    SESSION_STATUT: '0 * * * *',               // Toutes les heures
    STATS: '30 23 * * *',                      // 23:30 chaque jour
    BACKUP: '0 1 * * *',                       // 01:00 chaque jour
    CLEANUP: '0 4 * * *',                      // 04:00 chaque jour
  },
} as const;

// ============================================================================
// RÈGLES DE BACKUP
// ============================================================================
export const BACKUP_CONFIG = {
  ENABLED: true,
  DIR: './backups',
  RETENTION_DAYS: 30,
  COMPRESS: true,
  MAX_SIZE_MB: 5000,
} as const;

// ============================================================================
// RÈGLES D'AUDIT
// ============================================================================
export const AUDIT_CONFIG = {
  /** Actions à logger */
  LOG_ACTIONS: [
    'LOGIN',
    'LOGOUT',
    'REGISTER',
    'FAILED_LOGIN',
    'CREATE',
    'UPDATE',
    'DELETE',
    'GENERATE',
    'DOWNLOAD',
    'UPLOAD',
  ],

  /** Rétention des logs (jours) */
  RETENTION_DAYS: 90,

  /** Taille max des détails JSON */
  MAX_DETAILS_SIZE_KB: 10,
} as const;

// ============================================================================
// LIMITES SYSTÈME
// ============================================================================
export const SYSTEM_LIMITS = {
  MAX_BODY_SIZE: '10mb',
  MAX_URL_ENCODED_SIZE: '10mb',
  REQUEST_TIMEOUT_MS: 30000,
  SOCKET_PING_TIMEOUT: 60000,
  SOCKET_PING_INTERVAL: 25000,
  MAX_QUERY_TIME_MS: 30000,
  MAX_CONNECTIONS_POOL: 50,
} as const;

// ============================================================================
// DOMAINES PRÉDÉFINIS
// ============================================================================
export const DOMAINES_PREDEFINIS = [
  { nom: 'WEB', couleur: '#FF7900', icone: 'code' },
  { nom: 'DATA', couleur: '#0277BD', icone: 'chart' },
  { nom: 'CYBER', couleur: '#C62828', icone: 'shield' },
  { nom: 'IA', couleur: '#7B1FA2', icone: 'brain' },
  { nom: 'DESIGN', couleur: '#2E7D32', icone: 'palette' },
  { nom: 'CLOUD', couleur: '#00838F', icone: 'cloud' },
  { nom: 'MOBILE', couleur: '#F57C00', icone: 'smartphone' },
  { nom: 'IOT', couleur: '#5D4037', icone: 'cpu' },
] as const;

// ============================================================================
// PARAMÈTRES PAR DÉFAUT
// ============================================================================
export const DEFAULTS = {
  USER_AVATAR: '/assets/images/default-avatar.png',
  FORMATION_IMAGE: '/assets/images/default-formation.png',
  PARTENAIRE_LOGO: '/assets/images/default-partner.png',
  LOCALE: 'fr-FR',
  TIMEZONE: 'Indian/Antananarivo',
  CURRENCY: 'MGA',
  CURRENCY_SYMBOL: 'Ar',
} as const;