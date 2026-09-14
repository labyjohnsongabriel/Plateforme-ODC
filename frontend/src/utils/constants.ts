// ============================================================================
//  CONSTANTES GLOBALES
// ============================================================================

export const APP_CONFIG = {
  name: 'ODC Platform',
  shortName: 'ODC',
  fullName: 'Orange Digital Center',
  description: 'Plateforme de gestion des formations',
  version: '1.0.0',
  website: 'https://odc.orange.mg',
  email: 'contact@odc.mg',
  phone: '+261 34 12 345 67',
  address: 'Antananarivo, Madagascar',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'odc_access_token',
  REFRESH_TOKEN: 'odc_refresh_token',
  USER: 'odc_user',
  THEME: 'odc-theme',
  LANGUAGE: 'odc-language',
  SIDEBAR_COLLAPSED: 'odc-sidebar-collapsed',
  REMEMBER_EMAIL: 'odc_remember_email',
  PREFERENCES: 'odc_preferences',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  FORMATIONS: '/formations',
  SESSIONS: '/sessions',
  INSCRIPTIONS: '/inscriptions',
  PRESENCES: '/presences',
  EVALUATIONS: '/evaluations',
  ATTESTATIONS: '/attestations',
  MESSAGERIE: '/messagerie',
  RESEAUTAGE: '/reseautage',
  USERS: '/users',
  PARTENAIRES: '/partenaires',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  UNAUTHORIZED: '/unauthorized',
  SERVER_ERROR: '/server-error',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  LIMIT_OPTIONS: [10, 25, 50, 100],
} as const;

export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  MEDIUM: 'dd MMM yyyy',
  LONG: 'dd MMMM yyyy',
  FULL: 'EEEE dd MMMM yyyy',
  TIME: 'HH:mm',
  DATETIME: 'dd/MM/yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

export const FILE_LIMITS = {
  MAX_AVATAR_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_DOCUMENT_SIZE: 20 * 1024 * 1024, // 20MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
} as const;

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_MG: /^(\+261|0)(32|33|34|38|20)\d{7}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  URL: /^https?:\/\/.+/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  ATTESTATION_NUMBER: /^ODC-\d{4}-[A-Z]{3}-[A-F0-9]{6}$/,
} as const;

export const DEBOUNCE_DELAYS = {
  SHORT: 200,
  MEDIUM: 400,
  LONG: 600,
} as const;

export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000,
} as const;