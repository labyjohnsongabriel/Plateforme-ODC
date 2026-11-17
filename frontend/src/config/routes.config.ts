// src/config/routes.config.ts

/* ═══════════════════════════════════════════════════════════════════════════
   ROUTES CONFIGURATION — chemins Next.js App Router
   ═══════════════════════════════════════════════════════════════════════════ */

export const ROUTES = {
  /* ─── Public ─────────────────────────────────────────────────────── */
  HOME: '/',
  ABOUT: '/a-propos',
  CONTACT: '/contact',
  FORMATIONS_PUBLIC: '/formations',
  FORMATION_PUBLIC_DETAIL: (slug: string) => `/formations/${slug}`,
  DOMAINES: '/domaines',
  SESSIONS_PUBLIC: '/sessions',
  PARTENAIRES_PUBLIC: '/partenaires',
  INSCRIPTION_EN_LIGNE: '/inscription-en-ligne',
  VERIFY_ATTESTATION: (numero: string) => `/verifier-attestation/${numero}`,

  /* ─── Auth ───────────────────────────────────────────────────────── */
  LOGIN: '/connexion',
  CONNEXION: '/connexion',
  REGISTER: '/inscription',
  INSCRIPTION: '/inscription',
  FORGOT_PASSWORD: '/mot-de-passe-oublie',
  RESET_PASSWORD: '/reinitialiser-mot-de-passe',

  /* ─── Dashboard ──────────────────────────────────────────────────── */
  DASHBOARD: '/dashboard',

  /* ─── Formations ─────────────────────────────────────────────────── */
  FORMATIONS: '/formations',
  FORMATION_CREATE: '/formations/nouveau',
  FORMATION_EDIT: (id: string) => `/formations/${id}/edit`,
  FORMATION_DETAIL: (id: string) => `/formations/${id}`,

  /* ─── Sessions ───────────────────────────────────────────────────── */
  SESSIONS: '/sessions',
  SESSION_CREATE: '/sessions/nouveau',
  SESSION_DETAIL: (id: string) => `/sessions/${id}`,

  /* ─── Inscriptions ───────────────────────────────────────────────── */
  INSCRIPTIONS: '/inscriptions',
  INSCRIPTION_DETAIL: (id: string) => `/inscriptions/${id}`,
  SELECTIONS: '/selections',

  /* ─── Présences ──────────────────────────────────────────────────── */
  PRESENCES: '/presences',
  PRESENCES_SCAN: '/presences/scan',
  PRESENCES_STATS: '/presences/stats',

  /* ─── Évaluations ────────────────────────────────────────────────── */
  EVALUATIONS: '/evaluations',
  EVALUATION_CREATE: '/evaluations/nouveau',
  EVALUATION_DETAIL: (id: string) => `/evaluations/${id}`,
  NOTES: '/notes',

  /* ─── Attestations ───────────────────────────────────────────────── */
  ATTESTATIONS: '/attestations',
  ATTESTATION_DETAIL: (id: string) => `/attestations/${id}`,
  ATTESTATION_VERIFY: '/attestations/verifier',

  /* ─── Communication ──────────────────────────────────────────────── */
  MESSAGERIE: '/messagerie',
  MESSAGERIE_CONVERSATION: (id: string) => `/messagerie/${id}`,
  NOTIFICATIONS: '/notifications',

  /* ─── Réseautage ─────────────────────────────────────────────────── */
  RESEAUTAGE: '/reseautage',
  RESEAUTAGE_MEMBERS: '/reseautage/membres',
  RESEAUTAGE_MEMBER_PROFILE: (id: string) => `/reseautage/membres/${id}`,

  /* ─── Utilisateurs ───────────────────────────────────────────────── */
  USERS: '/users',
  USER_CREATE: '/users/nouveau',
  USER_EDIT: (id: string) => `/users/${id}/edit`,
  USER_DETAIL: (id: string) => `/users/${id}`,

  /* ─── Partenaires ────────────────────────────────────────────────── */
  PARTENAIRES: '/partenaires',
  PARTENAIRE_DETAIL: (id: string) => `/partenaires/${id}`,

  /* ─── Profil / Paramètres ────────────────────────────────────────── */
  PROFILE: '/profile',
  PROFIL: '/profile',
  SETTINGS: '/settings',
  PARAMETRES: '/settings',
  HELP: '/help',
  AIDE: '/help',

  /* ─── Erreurs ────────────────────────────────────────────────────── */
  UNAUTHORIZED: '/403',
  SERVER_ERROR: '/500',
  NOT_FOUND: '/404',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARDS PAR RÔLE
   ═══════════════════════════════════════════════════════════════════════════ */

export const ROLE_DASHBOARD = {
  ADMINISTRATEUR: '/admin/dashboard',
  STAFF_ODC: '/staff/dashboard',
  FORMATEUR: '/formateur/dashboard',
  PARTICIPANT: '/participant/dashboard',
  PARTENAIRE: '/partenaire/dashboard',
} as const;

export function getDashboardRoute(role?: string | null): string {
  if (!role) return ROUTES.HOME;
  const normalized = String(role).toUpperCase() as keyof typeof ROLE_DASHBOARD;
  return ROLE_DASHBOARD[normalized] ?? ROUTES.HOME;
}

export default ROUTES;