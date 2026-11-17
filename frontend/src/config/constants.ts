// src/config/constants.ts

/* ═══════════════════════════════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════════════════════════════ */

export const APP_NAME = 'ODC Platform';
export const APP_VERSION = '1.0.0';

/* ═══════════════════════════════════════════════════════════════════════════
   STORAGE KEYS
   ═══════════════════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════════════════
   HTTP STATUS
   ═══════════════════════════════════════════════════════════════════════════ */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  SERVER_ERROR: 500,
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   PAGINATION
   ═══════════════════════════════════════════════════════════════════════════ */

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  LIMIT_OPTIONS: [10, 25, 50, 100] as const,
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   DEBOUNCE / TOAST
   ═══════════════════════════════════════════════════════════════════════════ */

export const DEBOUNCE = {
  SHORT: 200,
  MEDIUM: 400,
  LONG: 600,
} as const;

export const TOAST = {
  SHORT: 2_000,
  MEDIUM: 4_000,
  LONG: 6_000,
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   BREAKPOINTS
   ═══════════════════════════════════════════════════════════════════════════ */

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   DATE FORMATS
   ═══════════════════════════════════════════════════════════════════════════ */

export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  MEDIUM: 'dd MMM yyyy',
  LONG: 'dd MMMM yyyy',
  FULL: 'EEEE dd MMMM yyyy',
  TIME: 'HH:mm',
  DATETIME: 'dd/MM/yyyy HH:mm',
  DATETIME_LONG: 'dd MMMM yyyy à HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
  DATE_ONLY: 'yyyy-MM-dd',
  MONTH_YEAR: 'MMMM yyyy',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   FILE LIMITS
   ═══════════════════════════════════════════════════════════════════════════ */

export const FILE_LIMITS = {
  MAX_AVATAR_SIZE: 2 * 1024 * 1024,
  MAX_DOCUMENT_SIZE: 20 * 1024 * 1024,
  MAX_FILE_SIZE: 10 * 1024 * 1024,
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   REGEX
   ═══════════════════════════════════════════════════════════════════════════ */

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_MG: /^(\+261|0)(32|33|34|38|20)\d{7}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  URL: /^https?:\/\/.+/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  ATTESTATION_NUMBER: /^ODC-\d{4}-[A-Z]{3}-[A-F0-9]{6}$/,
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   QUERY KEYS
   ═══════════════════════════════════════════════════════════════════════════ */

export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'] as const,
  },
  USERS: {
    ALL: ['users'] as const,
    LIST: (filters: any) => ['users', 'list', filters] as const,
    DETAIL: (id: string) => ['users', 'detail', id] as const,
  },
  FORMATIONS: {
    ALL: ['formations'] as const,
    LIST: (filters: any) => ['formations', 'list', filters] as const,
    DETAIL: (id: string) => ['formations', 'detail', id] as const,
    TOP: ['formations', 'top'] as const,
  },
  SESSIONS: {
    ALL: ['sessions'] as const,
    LIST: (filters: any) => ['sessions', 'list', filters] as const,
    DETAIL: (id: string) => ['sessions', 'detail', id] as const,
  },
  INSCRIPTIONS: {
    ALL: ['inscriptions'] as const,
    LIST: (filters: any) => ['inscriptions', 'list', filters] as const,
    DETAIL: (id: string) => ['inscriptions', 'detail', id] as const,
  },
  ATTESTATIONS: {
    MINE: ['attestations', 'mine'] as const,
    LIST: (filters: any) => ['attestations', 'list', filters] as const,
    DETAIL: (id: string) => ['attestations', 'detail', id] as const,
  },
  DASHBOARD: {
    MY_STATS: ['dashboard', 'my-stats'] as const,
    ADMIN: ['dashboard', 'admin'] as const,
    STAFF: ['dashboard', 'staff'] as const,
    FORMATEUR: ['dashboard', 'formateur'] as const,
    PARTICIPANT: ['dashboard', 'participant'] as const,
    PARTENAIRE: ['dashboard', 'partenaire'] as const,
  },
  NOTIFICATIONS: {
    ALL: ['notifications'] as const,
    COUNT: ['notifications', 'count'] as const,
  },
  MESSAGERIE: {
    CONVERSATIONS: ['messagerie', 'conversations'] as const,
    MESSAGES: (id: string) => ['messagerie', 'messages', id] as const,
  },
} as const;