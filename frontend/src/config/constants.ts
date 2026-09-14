// ============================================================================
//  CONSTANTES CONFIG
// ============================================================================

export const APP_NAME = 'ODC Platform';
export const APP_VERSION = '1.0.0';

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

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  LIMIT_OPTIONS: [10, 25, 50, 100],
} as const;

export const DEBOUNCE = {
  SHORT: 200,
  MEDIUM: 400,
  LONG: 600,
} as const;

export const TOAST = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000,
} as const;

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

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

export const FILE_LIMITS = {
  MAX_AVATAR_SIZE: 2 * 1024 * 1024,
  MAX_DOCUMENT_SIZE: 20 * 1024 * 1024,
  MAX_FILE_SIZE: 10 * 1024 * 1024,
} as const;

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_MG: /^(\+261|0)(32|33|34|38|20)\d{7}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  URL: /^https?:\/\/.+/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  ATTESTATION_NUMBER: /^ODC-\d{4}-[A-Z]{3}-[A-F0-9]{6}$/,
} as const;

export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'],
  },
  USERS: {
    ALL: ['users'],
    LIST: (filters: any) => ['users', 'list', filters],
    DETAIL: (id: string) => ['users', 'detail', id],
  },
  FORMATIONS: {
    ALL: ['formations'],
    LIST: (filters: any) => ['formations', 'list', filters],
    DETAIL: (id: string) => ['formations', 'detail', id],
    TOP: ['formations', 'top'],
  },
  SESSIONS: {
    ALL: ['sessions'],
    LIST: (filters: any) => ['sessions', 'list', filters],
    DETAIL: (id: string) => ['sessions', 'detail', id],
  },
  INSCRIPTIONS: {
    ALL: ['inscriptions'],
    LIST: (filters: any) => ['inscriptions', 'list', filters],
    DETAIL: (id: string) => ['inscriptions', 'detail', id],
  },
  ATTESTATIONS: {
    MINE: ['attestations', 'mine'],
    LIST: (filters: any) => ['attestations', 'list', filters],
    DETAIL: (id: string) => ['attestations', 'detail', id],
  },
  DASHBOARD: {
    MY_STATS: ['dashboard', 'my-stats'],
    ADMIN: ['dashboard', 'admin'],
  },
  NOTIFICATIONS: {
    ALL: ['notifications'],
    COUNT: ['notifications', 'count'],
  },
  MESSAGERIE: {
    CONVERSATIONS: ['messagerie', 'conversations'],
    MESSAGES: (id: string) => ['messagerie', 'messages', id],
  },
} as const;