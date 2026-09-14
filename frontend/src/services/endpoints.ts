// ============================================================================
//  ENDPOINTS API
// ============================================================================

export const ENDPOINTS = {
  // Auth
  AUTH: {
    BASE: '/auth',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    STATS: '/users/stats',
    CHANGE_ROLE: (id: string) => `/users/${id}/role`,
    TOGGLE_ACTIF: (id: string) => `/users/${id}/actif`,
    AVATAR: (id: string) => `/users/${id}/avatar`,
  },

  // Formations
  FORMATIONS: {
    BASE: '/formations',
    BY_ID: (id: string) => `/formations/${id}`,
    TOP: '/formations/top',
    STATS_DOMAINES: '/formations/stats/domaines',
  },

  // Sessions
  SESSIONS: {
    BASE: '/sessions',
    BY_ID: (id: string) => `/sessions/${id}`,
    MES_SESSIONS: '/sessions/mes-sessions',
    CHANGER_STATUT: (id: string) => `/sessions/${id}/statut`,
  },

  // Inscriptions
  INSCRIPTIONS: {
    BASE: '/inscriptions',
    BY_ID: (id: string) => `/inscriptions/${id}`,
    SELECTIONNER: (id: string) => `/inscriptions/${id}/selectionner`,
  },

  // Selections
  SELECTIONS: {
    BASE: '/selections',
    CANDIDATS_SESSION: (sessionId: string) => `/selections/session/${sessionId}/candidats`,
    SELECTIONNER: (sessionId: string) => `/selections/session/${sessionId}/selectionner`,
    SELECTION_AUTO: (sessionId: string) => `/selections/auto/${sessionId}`,
    STATS: (sessionId: string) => `/selections/stats/${sessionId}`,
    RESET: (sessionId: string) => `/selections/session/${sessionId}/reset`,
  },

  // Presences
  PRESENCES: {
    BASE: '/presences',
    SCAN: '/presences/scan',
    MANUEL: '/presences/manuel',
    BY_SESSION: (sessionId: string) => `/presences/session/${sessionId}`,
    TAUX: (sessionId: string, participantId: string) =>
      `/presences/session/${sessionId}/participant/${participantId}/taux`,
    STATS: (sessionId: string) => `/presences/session/${sessionId}/stats`,
    GENERATE_QR: '/presences/qr/generate',
  },

  // Evaluations
  EVALUATIONS: {
    BASE: '/evaluations',
    BY_ID: (id: string) => `/evaluations/${id}`,
    BY_SESSION: (sessionId: string) => `/evaluations/session/${sessionId}`,
    SAISIR_NOTE: (evaluationId: string) => `/evaluations/${evaluationId}/notes`,
    MOYENNE: (sessionId: string, participantId: string) =>
      `/evaluations/session/${sessionId}/participant/${participantId}/moyenne`,
  },

  // Attestations
  ATTESTATIONS: {
    BASE: '/attestations',
    BY_ID: (id: string) => `/attestations/${id}`,
    MES_ATTESTATIONS: '/attestations/mes-attestations',
    GENERER: '/attestations/generer',
    GENERER_SESSION: (sessionId: string) => `/attestations/session/${sessionId}/generer-tout`,
    VERIFY: (numero: string) => `/attestations/verify/${numero}`,
    ELIGIBILITE: (sessionId: string, participantId: string) =>
      `/attestations/eligibilite/${sessionId}/${participantId}`,
    STATS: '/attestations/stats',
    PDF: (id: string) => `/attestations/${id}/pdf`,
  },

  // Dashboard
  DASHBOARD: {
    BASE: '/dashboard',
    MY_STATS: '/dashboard/my-stats',
    ADMIN: '/dashboard/admin',
    STAFF: '/dashboard/staff',
    FORMATEUR: '/dashboard/formateur',
    PARTICIPANT: '/dashboard/participant',
    PARTENAIRE: '/dashboard/partenaire',
  },

  // Messagerie
  MESSAGERIE: {
    BASE: '/messagerie',
    CONVERSATIONS: '/messagerie/conversations',
    CREATE_PRIVATE: '/messagerie/conversations/private',
    CREATE_GROUPE: '/messagerie/conversations/groupe',
    MESSAGES: (conversationId: string) => `/messagerie/conversations/${conversationId}/messages`,
    MARQUER_LUS: (conversationId: string) => `/messagerie/conversations/${conversationId}/lire`,
    COUNT_NON_LUS: '/messagerie/non-lus/count',
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    COUNT: '/notifications/count',
    MARQUER_LUE: (id: string) => `/notifications/${id}/lire`,
    MARQUER_TOUTES_LUES: '/notifications/lire-tout',
  },

  // Réseautage
  RESEAUTAGE: {
    BASE: '/reseautage',
    ANNUAIRE: '/reseautage/annuaire',
    SUGGESTIONS: '/reseautage/suggestions',
    CONNECTIONS: '/reseautage/connections',
    DEMANDES: '/reseautage/demandes',
    REPONDRE: (id: string) => `/reseautage/demandes/${id}/repondre`,
  },

  // Partenaires
  PARTENAIRES: {
    BASE: '/partenaires',
    BY_ID: (id: string) => `/partenaires/${id}`,
  },

  // Upload
  UPLOAD: {
    AVATAR: '/upload/avatar',
    FILE: '/upload/file',
    MULTIPLE: '/upload/multiple',
  },

  // Health
  HEALTH: {
    BASE: '/health',
    LIVE: '/health/live',
    READY: '/health/ready',
    DB: '/health/db',
  },
} as const;

export default ENDPOINTS;