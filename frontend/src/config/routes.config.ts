// ============================================================================
//  ROUTES CONFIGURATION
// ============================================================================

export const ROUTES = {
  // Public
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  FORMATIONS_PUBLIC: '/formations-public',
  FORMATION_PUBLIC_DETAIL: (id: string) => `/formations-public/${id}`,
  VERIFY_ATTESTATION: (numero: string) => `/verify/${numero}`,

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  // Dashboard
  DASHBOARD: '/dashboard',

  // Formations
  FORMATIONS: '/formations',
  FORMATION_CREATE: '/formations/create',
  FORMATION_EDIT: (id: string) => `/formations/${id}/edit`,
  FORMATION_DETAIL: (id: string) => `/formations/${id}`,

  // Sessions
  SESSIONS: '/sessions',
  SESSION_CREATE: '/sessions/create',
  SESSION_DETAIL: (id: string) => `/sessions/${id}`,

  // Inscriptions
  INSCRIPTIONS: '/inscriptions',
  INSCRIPTION_DETAIL: (id: string) => `/inscriptions/${id}`,
  SELECTIONS: '/selections',

  // Présences
  PRESENCES: '/presences',
  PRESENCES_SCAN: '/presences/scan',
  PRESENCES_STATS: '/presences/stats',

  // Évaluations
  EVALUATIONS: '/evaluations',
  EVALUATION_CREATE: '/evaluations/create',
  EVALUATION_DETAIL: (id: string) => `/evaluations/${id}`,
  NOTES: '/notes',

  // Attestations
  ATTESTATIONS: '/attestations',
  ATTESTATION_DETAIL: (id: string) => `/attestations/${id}`,
  ATTESTATION_VERIFY: '/attestations/verify',

  // Messagerie
  MESSAGERIE: '/messagerie',

  // Réseautage
  RESEAUTAGE: '/reseautage',
  RESEAUTAGE_MEMBERS: '/reseautage/members',
  RESEAUTAGE_MEMBER_PROFILE: (id: string) => `/reseautage/members/${id}`,

  // Users
  USERS: '/users',
  USER_CREATE: '/users/create',
  USER_EDIT: (id: string) => `/users/${id}/edit`,
  USER_DETAIL: (id: string) => `/users/${id}`,

  // Partenaires
  PARTENAIRES: '/partenaires',
  PARTENAIRE_DETAIL: (id: string) => `/partenaires/${id}`,

  // Profile
  PROFILE: '/profile',
  SETTINGS: '/settings',

  // Erreurs
  UNAUTHORIZED: '/unauthorized',
  SERVER_ERROR: '/server-error',
  NOT_FOUND: '/404',
} as const;

export default ROUTES;