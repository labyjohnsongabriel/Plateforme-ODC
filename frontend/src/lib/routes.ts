// src/lib/routes.ts
import type { RoleName } from '@/types/role.types';

/* ============================================================================
   ROUTES TYPÉES (camelCase original)
   ============================================================================ */

export const ROUTES = {
  public: {
    home: '/',
    aPropos: '/a-propos',
    formations: '/formations',
    formationDetail: (slug: string) => `/formations/${slug}`,
    domaines: '/domaines',
    domaineDetail: (slug: string) => `/domaines/${slug}`,
    sessions: '/sessions',
    sessionDetail: (code: string) => `/sessions/${code}`,
    partenaires: '/partenaires',
    partenaireDetail: (slug: string) => `/partenaires/${slug}`,
    inscriptionEnLigne: '/inscription-en-ligne',
    verifierAttestation: '/verifier-attestation',
    verifierAttestationNumero: (numero: string) => `/verifier-attestation/${numero}`,
    actualites: '/actualites',
    contact: '/contact',
    communauteY2C: '/communaute-y2c',
  },

  auth: {
    connexion: '/connexion',
    inscription: '/inscription',
    motDePasseOublie: '/mot-de-passe-oublie',
    reinitialiserMotDePasse: (token: string) => `/reinitialiser-mot-de-passe/${token}`,
  },

  admin: {
    dashboard: '/admin/dashboard',
    utilisateurs: '/admin/utilisateurs',
    utilisateurDetail: (id: string) => `/admin/utilisateurs/${id}`,
    roles: '/admin/roles',
    roleDetail: (id: string) => `/admin/roles/${id}`,
    domaines: '/admin/domaines',
    domaineNouveau: '/admin/domaines/nouveau',
    domaineDetail: (id: string) => `/admin/domaines/${id}`,
    formations: '/admin/formations',
    formationNouvelle: '/admin/formations/nouveau',
    formationDetail: (id: string) => `/admin/formations/${id}`,
    sessions: '/admin/sessions',
    sessionNouvelle: '/admin/sessions/nouveau',
    sessionDetail: (id: string) => `/admin/sessions/${id}`,
    partenaires: '/admin/partenaires',
    partenaireNouveau: '/admin/partenaires/nouveau',
    partenaireDetail: (id: string) => `/admin/partenaires/${id}`,
    attestations: '/admin/attestations',
    auditLogs: '/admin/audit-logs',
    exports: '/admin/exports',
    parametres: '/admin/parametres',
  },

  staff: {
    dashboard: '/staff/dashboard',
    formations: '/staff/formations',
    formationNouvelle: '/staff/formations/nouveau',
    formationDetail: (id: string) => `/staff/formations/${id}`,
    sessions: '/staff/sessions',
    sessionNouvelle: '/staff/sessions/nouveau',
    sessionDetail: (id: string) => `/staff/sessions/${id}`,
    selections: '/staff/selections',
    selectionSession: (id: string) => `/staff/selections/${id}`,
    presences: '/staff/presences',
    presenceSession: (id: string) => `/staff/presences/${id}`,
    evaluations: '/staff/evaluations',
    evaluationNouvelle: '/staff/evaluations/nouveau',
    notes: '/staff/notes',
    attestations: '/staff/attestations',
    ressources: '/staff/ressources',
    partenaires: '/staff/partenaires',
    profil: '/staff/profil',
  },

  formateur: {
    dashboard: '/formateur/dashboard',
    sessions: '/formateur/sessions',
    sessionDetail: (id: string) => `/formateur/sessions/${id}`,
    presences: '/formateur/presences',
    presenceSession: (id: string) => `/formateur/presences/${id}`,
    evaluations: '/formateur/evaluations',
    evaluationNouvelle: '/formateur/evaluations/nouveau',
    evaluationDetail: (id: string) => `/formateur/evaluations/${id}`,
    notes: '/formateur/notes',
    ressources: '/formateur/ressources',
    profil: '/formateur/profil',
  },

  participant: {
    dashboard: '/participant/dashboard',
    profil: '/participant/profil',
    inscriptions: '/participant/inscriptions',
    presences: '/participant/presences',
    scanner: '/participant/presences/scanner',
    evaluations: '/participant/evaluations',
    evaluationDetail: (id: string) => `/participant/evaluations/${id}`,
    notes: '/participant/notes',
    attestations: '/participant/attestations',
    ressources: '/participant/ressources',
    reseauAnnuaire: '/participant/reseau/annuaire',
    reseauConnexions: '/participant/reseau/connexions',
    reseauDemandesEnAttente: '/participant/reseau/demandes/en-attente',
    reseauDemandesEnvoyees: '/participant/reseau/demandes/envoyees',
    reseauSuggestions: '/participant/reseau/suggestions',
  },

  partenaire: {
    dashboard: '/partenaire/dashboard',
    formations: '/partenaire/formations',
    formationDetail: (slug: string) => `/partenaire/formations/${slug}`,
    sessions: '/partenaire/sessions',
    sessionDetail: (code: string) => `/partenaire/sessions/${code}`,
    fiche: '/partenaire/fiche',
    profil: '/partenaire/profil',
  },

  common: {
    notifications: '/notifications',
    messagerie: '/messagerie',
    messagerieConversation: (id: string) => `/messagerie/${id}`,
    parametres: '/parametres',
  },
} as const;

/* ============================================================================
   ⭐ ALIAS SCREAMING_SNAKE_CASE (compatibilité AuthContext)
   ============================================================================ */

export const ROUTES_ALIAS = {
  PUBLIC: {
    HOME: ROUTES.public.home,
    ABOUT: ROUTES.public.aPropos,
    FORMATIONS: ROUTES.public.formations,
    FORMATION_DETAIL: ROUTES.public.formationDetail,
    DOMAINES: ROUTES.public.domaines,
    DOMAINE_DETAIL: ROUTES.public.domaineDetail,
    SESSIONS: ROUTES.public.sessions,
    SESSION_DETAIL: ROUTES.public.sessionDetail,
    PARTENAIRES: ROUTES.public.partenaires,
    PARTENAIRE_DETAIL: ROUTES.public.partenaireDetail,
    CONTACT: ROUTES.public.contact,
    ACTUALITES: ROUTES.public.actualites,
  },

  AUTH: {
    LOGIN: ROUTES.auth.connexion,
    REGISTER: ROUTES.auth.inscription,
    FORGOT_PASSWORD: ROUTES.auth.motDePasseOublie,
    RESET_PASSWORD: ROUTES.auth.reinitialiserMotDePasse,
  },

  ADMIN: {
    DASHBOARD: ROUTES.admin.dashboard,
    USERS: ROUTES.admin.utilisateurs,
    ROLES: ROUTES.admin.roles,
    DOMAINES: ROUTES.admin.domaines,
    FORMATIONS: ROUTES.admin.formations,
    SESSIONS: ROUTES.admin.sessions,
    PARTENAIRES: ROUTES.admin.partenaires,
    ATTESTATIONS: ROUTES.admin.attestations,
    PARAMETRES: ROUTES.admin.parametres,
  },

  STAFF: {
    DASHBOARD: ROUTES.staff.dashboard,
    FORMATIONS: ROUTES.staff.formations,
    SESSIONS: ROUTES.staff.sessions,
    PRESENCES: ROUTES.staff.presences,
    EVALUATIONS: ROUTES.staff.evaluations,
    NOTES: ROUTES.staff.notes,
    ATTESTATIONS: ROUTES.staff.attestations,
    RESSOURCES: ROUTES.staff.ressources,
    PROFIL: ROUTES.staff.profil,
  },

  FORMATEUR: {
    DASHBOARD: ROUTES.formateur.dashboard,
    SESSIONS: ROUTES.formateur.sessions,
    PRESENCES: ROUTES.formateur.presences,
    EVALUATIONS: ROUTES.formateur.evaluations,
    NOTES: ROUTES.formateur.notes,
    RESSOURCES: ROUTES.formateur.ressources,
    PROFIL: ROUTES.formateur.profil,
  },

  PARTICIPANT: {
    DASHBOARD: ROUTES.participant.dashboard,
    PROFIL: ROUTES.participant.profil,
    INSCRIPTIONS: ROUTES.participant.inscriptions,
    PRESENCES: ROUTES.participant.presences,
    SCANNER: ROUTES.participant.scanner,
    EVALUATIONS: ROUTES.participant.evaluations,
    NOTES: ROUTES.participant.notes,
    ATTESTATIONS: ROUTES.participant.attestations,
    RESSOURCES: ROUTES.participant.ressources,
    RESEAU_ANNUAIRE: ROUTES.participant.reseauAnnuaire,
  },

  PARTENAIRE: {
    DASHBOARD: ROUTES.partenaire.dashboard,
    FORMATIONS: ROUTES.partenaire.formations,
    SESSIONS: ROUTES.partenaire.sessions,
    FICHE: ROUTES.partenaire.fiche,
    PROFIL: ROUTES.partenaire.profil,
  },

  COMMON: {
    NOTIFICATIONS: ROUTES.common.notifications,
    MESSAGERIE: ROUTES.common.messagerie,
    CONVERSATION: ROUTES.common.messagerieConversation,
    PARAMETRES: ROUTES.common.parametres,
  },
} as const;

/* ============================================================================
   DASHBOARDS PAR RÔLE
   ============================================================================ */

export const ROLE_DASHBOARD: Record<string, string> = {
  ADMINISTRATEUR: ROUTES.admin.dashboard,
  STAFF_ODC: ROUTES.staff.dashboard,
  FORMATEUR: ROUTES.formateur.dashboard,
  PARTICIPANT: ROUTES.participant.dashboard,
  PARTENAIRE: ROUTES.partenaire.dashboard,
};

/* ============================================================================
   ⭐ getDashboardRoute — FONCTION MANQUANTE
   ============================================================================ */

/**
 * Retourne la route du dashboard selon le rôle.
 *
 * @example
 * getDashboardRoute('PARTICIPANT')     // → '/participant/dashboard'
 * getDashboardRoute('ADMINISTRATEUR')  // → '/admin/dashboard'
 * getDashboardRoute(undefined)         // → '/'
 */
export function getDashboardRoute(role?: string | null): string {
  if (!role) return ROUTES.public.home;
  return ROLE_DASHBOARD[role] ?? ROUTES.public.home;
}

/* ============================================================================
   HELPERS
   ============================================================================ */

export function isPublicRoute(pathname: string): boolean {
  const publicPaths: string[] = [
    ROUTES.public.home,
    ROUTES.public.aPropos,
    ROUTES.public.formations,
    ROUTES.public.sessions,
    ROUTES.public.partenaires,
    ROUTES.public.contact,
  ];
  return publicPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isAuthRoute(pathname: string): boolean {
  const authPaths: string[] = [
    ROUTES.auth.connexion,
    ROUTES.auth.inscription,
    ROUTES.auth.motDePasseOublie,
  ];
  return authPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isRoleAllowed(
  userRole: string | undefined,
  allowedRoles: RoleName[],
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as RoleName);
}