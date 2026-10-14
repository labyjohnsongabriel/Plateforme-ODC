// src/lib/routes.ts

/* ============================================================================
   ROUTES — Centralisation typée de toutes les routes ODC
   ============================================================================ */

/* ============================================================================
   TYPES
   ============================================================================ */

export type RoleName =
  | 'ADMINISTRATEUR'
  | 'STAFF_ODC'
  | 'FORMATEUR'
  | 'PARTICIPANT'
  | 'PARTENAIRE';

/* ============================================================================
   ⭐ ROUTES PRINCIPALES (structure camelCase hiérarchique)
   ============================================================================ */

export const ROUTES = {
  /* -------------------- PUBLIC -------------------- */
  public: {
    home: '/',
    aPropos: '/a-propos',
    actualites: '/actualites',
    contact: '/contact',
    communauteY2C: '/communaute-y2c',

    // Formations
    formations: '/formations',
    formationDetail: (slug: string) => `/formations/${slug}`,

    // Domaines
    domaines: '/domaines',
    domaineDetail: (slug: string) => `/domaines/${slug}`,

    // Sessions
    sessions: '/sessions',
    sessionDetail: (code: string) => `/sessions/${code}`,

    // Partenaires
    partenaires: '/partenaires',
    partenaireDetail: (slug: string) => `/partenaires/${slug}`,

    // Inscription & Attestation
    inscriptionEnLigne: '/inscription-en-ligne',
    verifierAttestation: '/verifier-attestation',
    verifierAttestationNumero: (numero: string) =>
      `/verifier-attestation/${numero}`,
  },

  /* -------------------- AUTH -------------------- */
  auth: {
    // ⭐ Routes directes (compatibilité AuthContext)
    connexion: '/connexion',
    login: '/connexion',         // alias
    inscription: '/inscription',
    register: '/inscription',    // alias
    motDePasseOublie: '/mot-de-passe-oublie',
    forgotPassword: '/mot-de-passe-oublie', // alias
    reinitialiserMotDePasse: (token: string) =>
      `/reinitialiser-mot-de-passe/${token}`,
  },

  /* -------------------- ADMIN -------------------- */
  admin: {
    dashboard: '/admin/dashboard',

    // Utilisateurs
    utilisateurs: '/admin/utilisateurs',
    utilisateurDetail: (id: string) => `/admin/utilisateurs/${id}`,

    // Rôles
    roles: '/admin/roles',
    roleDetail: (id: string) => `/admin/roles/${id}`,

    // Domaines
    domaines: '/admin/domaines',
    domaineNouveau: '/admin/domaines/nouveau',
    domaineDetail: (id: string) => `/admin/domaines/${id}`,

    // Formations
    formations: '/admin/formations',
    formationNouvelle: '/admin/formations/nouveau',
    formationDetail: (id: string) => `/admin/formations/${id}`,

    // Sessions
    sessions: '/admin/sessions',
    sessionNouvelle: '/admin/sessions/nouveau',
    sessionDetail: (id: string) => `/admin/sessions/${id}`,

    // Partenaires
    partenaires: '/admin/partenaires',
    partenaireNouveau: '/admin/partenaires/nouveau',
    partenaireDetail: (id: string) => `/admin/partenaires/${id}`,

    // Inscriptions
    inscriptions: '/admin/inscriptions',
    inscriptionDetail: (id: string) => `/admin/inscriptions/${id}`,

    // Attestations
    attestations: '/admin/attestations',

    // Autres
    exports: '/admin/exports',
    auditLogs: '/admin/audit-logs',
    parametres: '/admin/parametres',
  },

  /* -------------------- STAFF -------------------- */
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
    evaluationDetail: (id: string) => `/staff/evaluations/${id}`,

    notes: '/staff/notes',
    attestations: '/staff/attestations',
    ressources: '/staff/ressources',
    partenaires: '/staff/partenaires',
    inscriptions: '/staff/inscriptions',
    profil: '/staff/profil',
  },

  /* -------------------- FORMATEUR -------------------- */
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

  /* -------------------- PARTICIPANT -------------------- */
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

    // Réseau
    reseauAnnuaire: '/participant/reseau/annuaire',
    reseauConnexions: '/participant/reseau/connexions',
    reseauDemandesEnAttente: '/participant/reseau/demandes/en-attente',
    reseauDemandesEnvoyees: '/participant/reseau/demandes/envoyees',
    reseauSuggestions: '/participant/reseau/suggestions',
  },

  /* -------------------- PARTENAIRE -------------------- */
  partenaire: {
    dashboard: '/partenaire/dashboard',
    fiche: '/partenaire/fiche',
    profil: '/partenaire/profil',

    formations: '/partenaire/formations',
    formationDetail: (slug: string) => `/partenaire/formations/${slug}`,

    sessions: '/partenaire/sessions',
    sessionDetail: (code: string) => `/partenaire/sessions/${code}`,
  },

  /* -------------------- COMMUN -------------------- */
  common: {
    notifications: '/notifications',
    messagerie: '/messagerie',
    messagerieConversation: (id: string) => `/messagerie/${id}`,
    parametres: '/parametres',
  },
} as const;

/* ============================================================================
   ⭐⭐⭐ ALIAS SCREAMING_SNAKE_CASE (pour AuthContext & Navigation)
   ⚠️ Utilisez cette forme dans le code pour éviter les erreurs
   ============================================================================ */

export const ROUTES_ALIAS = {
  /* -------------------- PUBLIC -------------------- */
  PUBLIC: {
    HOME: ROUTES.public.home,
    ABOUT: ROUTES.public.aPropos,
    A_PROPROS: ROUTES.public.aPropos,
    ACTUALITES: ROUTES.public.actualites,
    CONTACT: ROUTES.public.contact,

    FORMATIONS: ROUTES.public.formations,
    FORMATION_DETAIL: ROUTES.public.formationDetail,

    DOMAINES: ROUTES.public.domaines,
    DOMAINE_DETAIL: ROUTES.public.domaineDetail,

    SESSIONS: ROUTES.public.sessions,
    SESSION_DETAIL: ROUTES.public.sessionDetail,

    PARTENAIRES: ROUTES.public.partenaires,
    PARTENAIRE_DETAIL: ROUTES.public.partenaireDetail,

    INSCRIPTION_EN_LIGNE: ROUTES.public.inscriptionEnLigne,
    VERIFIER_ATTESTATION: ROUTES.public.verifierAttestation,
    COMMUNAUTE_Y2C: ROUTES.public.communauteY2C,
  },

  /* -------------------- AUTH ⭐⭐⭐ -------------------- */
  AUTH: {
    LOGIN: ROUTES.auth.connexion,
    CONNEXION: ROUTES.auth.connexion,
    REGISTER: ROUTES.auth.inscription,
    INSCRIPTION: ROUTES.auth.inscription,
    FORGOT_PASSWORD: ROUTES.auth.motDePasseOublie,
    MOT_DE_PASSE_OUBLIE: ROUTES.auth.motDePasseOublie,
    RESET_PASSWORD: ROUTES.auth.reinitialiserMotDePasse,
  },

  /* -------------------- ADMIN -------------------- */
  ADMIN: {
    DASHBOARD: ROUTES.admin.dashboard,

    USERS: ROUTES.admin.utilisateurs,
    UTILISATEURS: ROUTES.admin.utilisateurs,
    USER_DETAIL: ROUTES.admin.utilisateurDetail,

    ROLES: ROUTES.admin.roles,
    ROLE_DETAIL: ROUTES.admin.roleDetail,

    DOMAINES: ROUTES.admin.domaines,
    DOMAINE_NOUVEAU: ROUTES.admin.domaineNouveau,
    DOMAINE_DETAIL: ROUTES.admin.domaineDetail,

    FORMATIONS: ROUTES.admin.formations,
    FORMATION_NOUVELLE: ROUTES.admin.formationNouvelle,
    FORMATION_DETAIL: ROUTES.admin.formationDetail,

    SESSIONS: ROUTES.admin.sessions,
    SESSION_NOUVELLE: ROUTES.admin.sessionNouvelle,
    SESSION_DETAIL: ROUTES.admin.sessionDetail,

    PARTENAIRES: ROUTES.admin.partenaires,
    PARTENAIRE_NOUVEAU: ROUTES.admin.partenaireNouveau,
    PARTENAIRE_DETAIL: ROUTES.admin.partenaireDetail,

    INSCRIPTIONS: ROUTES.admin.inscriptions,
    INSCRIPTION_DETAIL: ROUTES.admin.inscriptionDetail,

    ATTESTATIONS: ROUTES.admin.attestations,
    EXPORTS: ROUTES.admin.exports,
    AUDIT_LOGS: ROUTES.admin.auditLogs,
    PARAMETRES: ROUTES.admin.parametres,
  },

  /* -------------------- STAFF -------------------- */
  STAFF: {
    DASHBOARD: ROUTES.staff.dashboard,

    FORMATIONS: ROUTES.staff.formations,
    FORMATION_NOUVELLE: ROUTES.staff.formationNouvelle,
    FORMATION_DETAIL: ROUTES.staff.formationDetail,

    SESSIONS: ROUTES.staff.sessions,
    SESSION_NOUVELLE: ROUTES.staff.sessionNouvelle,
    SESSION_DETAIL: ROUTES.staff.sessionDetail,

    SELECTIONS: ROUTES.staff.selections,
    SELECTION_SESSION: ROUTES.staff.selectionSession,

    PRESENCES: ROUTES.staff.presences,
    PRESENCE_SESSION: ROUTES.staff.presenceSession,

    EVALUATIONS: ROUTES.staff.evaluations,
    EVALUATION_NOUVELLE: ROUTES.staff.evaluationNouvelle,
    EVALUATION_DETAIL: ROUTES.staff.evaluationDetail,

    NOTES: ROUTES.staff.notes,
    ATTESTATIONS: ROUTES.staff.attestations,
    RESSOURCES: ROUTES.staff.ressources,
    PARTENAIRES: ROUTES.staff.partenaires,
    INSCRIPTIONS: ROUTES.staff.inscriptions,
    PROFIL: ROUTES.staff.profil,
  },

  /* -------------------- FORMATEUR -------------------- */
  FORMATEUR: {
    DASHBOARD: ROUTES.formateur.dashboard,

    SESSIONS: ROUTES.formateur.sessions,
    SESSION_DETAIL: ROUTES.formateur.sessionDetail,

    PRESENCES: ROUTES.formateur.presences,
    PRESENCE_SESSION: ROUTES.formateur.presenceSession,

    EVALUATIONS: ROUTES.formateur.evaluations,
    EVALUATION_NOUVELLE: ROUTES.formateur.evaluationNouvelle,
    EVALUATION_DETAIL: ROUTES.formateur.evaluationDetail,

    NOTES: ROUTES.formateur.notes,
    RESSOURCES: ROUTES.formateur.ressources,
    PROFIL: ROUTES.formateur.profil,
  },

  /* -------------------- PARTICIPANT -------------------- */
  PARTICIPANT: {
    DASHBOARD: ROUTES.participant.dashboard,
    PROFIL: ROUTES.participant.profil,

    INSCRIPTIONS: ROUTES.participant.inscriptions,

    PRESENCES: ROUTES.participant.presences,
    SCANNER: ROUTES.participant.scanner,

    EVALUATIONS: ROUTES.participant.evaluations,
    EVALUATION_DETAIL: ROUTES.participant.evaluationDetail,

    NOTES: ROUTES.participant.notes,
    ATTESTATIONS: ROUTES.participant.attestations,
    RESSOURCES: ROUTES.participant.ressources,

    RESEAU_ANNUAIRE: ROUTES.participant.reseauAnnuaire,
    RESEAU_CONNEXIONS: ROUTES.participant.reseauConnexions,
    RESEAU_DEMANDES_EN_ATTENTE: ROUTES.participant.reseauDemandesEnAttente,
    RESEAU_DEMANDES_ENVOYEES: ROUTES.participant.reseauDemandesEnvoyees,
    RESEAU_SUGGESTIONS: ROUTES.participant.reseauSuggestions,
  },

  /* -------------------- PARTENAIRE -------------------- */
  PARTENAIRE: {
    DASHBOARD: ROUTES.partenaire.dashboard,
    FICHE: ROUTES.partenaire.fiche,
    PROFIL: ROUTES.partenaire.profil,

    FORMATIONS: ROUTES.partenaire.formations,
    FORMATION_DETAIL: ROUTES.partenaire.formationDetail,

    SESSIONS: ROUTES.partenaire.sessions,
    SESSION_DETAIL: ROUTES.partenaire.sessionDetail,
  },

  /* -------------------- COMMUN -------------------- */
  COMMON: {
    NOTIFICATIONS: ROUTES.common.notifications,
    MESSAGERIE: ROUTES.common.messagerie,
    CONVERSATION: ROUTES.common.messagerieConversation,
    PARAMETRES: ROUTES.common.parametres,
  },
} as const;

/* ============================================================================
   ⭐⭐⭐ ALIAS DIRECTS (compatibilité maximale)
   Pour AuthContext : `ROUTES.LOGIN` doit fonctionner directement
   ============================================================================ */

/**
 * Alias direct pour les usages fréquents.
 * Utilisable comme `ROUTES.LOGIN` (au lieu de `ROUTES_ALIAS.AUTH.LOGIN`)
 */
export const ROUTES_FLAT = {
  // ⭐ Auth direct (compatibilité AuthContext)
  LOGIN: ROUTES.auth.connexion,
  REGISTER: ROUTES.auth.inscription,
  FORGOT_PASSWORD: ROUTES.auth.motDePasseOublie,

  // Public
  HOME: ROUTES.public.home,
  FORMATIONS: ROUTES.public.formations,
  DOMAINES: ROUTES.public.domaines,
  SESSIONS: ROUTES.public.sessions,
  PARTENAIRES: ROUTES.public.partenaires,

  // Dashboards
  ADMIN_DASHBOARD: ROUTES.admin.dashboard,
  STAFF_DASHBOARD: ROUTES.staff.dashboard,
  FORMATEUR_DASHBOARD: ROUTES.formateur.dashboard,
  PARTICIPANT_DASHBOARD: ROUTES.participant.dashboard,
  PARTENAIRE_DASHBOARD: ROUTES.partenaire.dashboard,
} as const;

/* ============================================================================
   DASHBOARDS PAR RÔLE
   ============================================================================ */

export const ROLE_DASHBOARD: Record<RoleName, string> = {
  ADMINISTRATEUR: ROUTES.admin.dashboard,
  STAFF_ODC: ROUTES.staff.dashboard,
  FORMATEUR: ROUTES.formateur.dashboard,
  PARTICIPANT: ROUTES.participant.dashboard,
  PARTENAIRE: ROUTES.partenaire.dashboard,
};

/* ============================================================================
   HELPERS
   ============================================================================ */

/**
 * Retourne la route du dashboard selon le rôle.
 *
 * @example
 * getDashboardRoute('PARTICIPANT')     // → '/participant/dashboard'
 * getDashboardRoute('ADMINISTRATEUR')  // → '/admin/dashboard'
 * getDashboardRoute(undefined)         // → '/'
 * getDashboardRoute(null)              // → '/'
 */
export function getDashboardRoute(role?: string | null): string {
  if (!role) return ROUTES.public.home;
  if (role in ROLE_DASHBOARD) {
    return ROLE_DASHBOARD[role as RoleName];
  }
  return ROUTES.public.home;
}

/**
 * Vérifie si un chemin est une route publique.
 */
export function isPublicRoute(pathname: string): boolean {
  const publicPaths: string[] = [
    ROUTES.public.home,
    ROUTES.public.aPropos,
    ROUTES.public.actualites,
    ROUTES.public.contact,
    ROUTES.public.formations,
    ROUTES.public.domaines,
    ROUTES.public.sessions,
    ROUTES.public.partenaires,
  ];
  return publicPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Vérifie si un chemin est une route d'authentification.
 */
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

/**
 * Vérifie si un rôle est autorisé.
 */
export function isRoleAllowed(
  userRole: string | undefined | null,
  allowedRoles: RoleName[],
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as RoleName);
}

/**
 * Vérifie si un chemin est une route admin.
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

/**
 * Vérifie si un chemin est une route protégée (nécessite auth).
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedPrefixes = [
    '/admin',
    '/staff',
    '/formateur',
    '/participant',
    '/partenaire',
    '/messagerie',
    '/notifications',
    '/parametres',
  ];
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

/* ============================================================================
   EXPORTS GROUPÉS
   ============================================================================ */

/**
 * ⭐ IMPORT RECOMMANDÉ :
 *
 * ```tsx
 * import { ROUTES, ROUTES_ALIAS, ROUTES_FLAT, getDashboardRoute } from '@/lib/routes';
 *
 * // Utilisation 1 : hiérarchique (recommandé)
 * router.push(ROUTES.admin.dashboard);
 * router.push(ROUTES.auth.connexion);
 *
 * // Utilisation 2 : SCREAMING_SNAKE (AuthContext)
 * router.push(ROUTES_ALIAS.AUTH.LOGIN);
 *
 * // Utilisation 3 : direct
 * router.push(ROUTES_FLAT.LOGIN);
 * router.push(getDashboardRoute(user.role));
 * ```
 */