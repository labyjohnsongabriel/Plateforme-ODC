import { RoleName } from '@/types/user.types';

// ============================================================================
//  PERMISSIONS — Liste exhaustive
// ============================================================================

export const PERMISSIONS = {
  // ---- UTILISATEURS ----
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  USERS_CHANGE_ROLE: 'users:change-role',

  // ---- FORMATIONS ----
  FORMATIONS_VIEW: 'formations:view',
  FORMATIONS_CREATE: 'formations:create',
  FORMATIONS_EDIT: 'formations:edit',
  FORMATIONS_DELETE: 'formations:delete',

  // ---- SESSIONS ----
  SESSIONS_VIEW: 'sessions:view',
  SESSIONS_CREATE: 'sessions:create',
  SESSIONS_EDIT: 'sessions:edit',
  SESSIONS_DELETE: 'sessions:delete',

  // ---- INSCRIPTIONS ----
  INSCRIPTIONS_VIEW_ALL: 'inscriptions:view-all',
  INSCRIPTIONS_VIEW_OWN: 'inscriptions:view-own',
  INSCRIPTIONS_CREATE: 'inscriptions:create',
  INSCRIPTIONS_SELECT: 'inscriptions:select',
  INSCRIPTIONS_DELETE: 'inscriptions:delete',

  // ---- PRÉSENCES ----
  PRESENCES_VIEW_ALL: 'presences:view-all',
  PRESENCES_VIEW_OWN: 'presences:view-own',
  PRESENCES_SCAN: 'presences:scan',
  PRESENCES_MANUAL: 'presences:manual',

  // ---- ÉVALUATIONS ----
  EVALUATIONS_VIEW: 'evaluations:view',
  EVALUATIONS_CREATE: 'evaluations:create',
  EVALUATIONS_GRADE: 'evaluations:grade',

  // ---- ATTESTATIONS ----
  ATTESTATIONS_VIEW_ALL: 'attestations:view-all',
  ATTESTATIONS_VIEW_OWN: 'attestations:view-own',
  ATTESTATIONS_GENERATE: 'attestations:generate',

  // ---- MESSAGERIE ----
  MESSAGERIE_USE: 'messagerie:use',

  // ---- RÉSEAUTAGE ----
  RESEAUTAGE_USE: 'reseautage:use',

  // ---- DASHBOARD ----
  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_STATS_GLOBAL: 'dashboard:stats-global',
  DASHBOARD_STATS_PERSONAL: 'dashboard:stats-personal',

  // ---- PARTENAIRES ----
  PARTENAIRES_VIEW: 'partenaires:view',
  PARTENAIRES_MANAGE: 'partenaires:manage',

  // ---- PARAMÈTRES ----
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ============================================================================
//  MATRICE RÔLES ↔ PERMISSIONS
// ============================================================================

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  // ==========================================================================
  //  ADMIN — Toutes les permissions
  // ==========================================================================
  [RoleName.ADMIN]: Object.values(PERMISSIONS),

  // ==========================================================================
  //  STAFF — Gestion opérationnelle (sans paramètres système)
  // ==========================================================================
  [RoleName.STAFF]: [
    // Utilisateurs (lecture seule)
    PERMISSIONS.USERS_VIEW,

    // Formations
    PERMISSIONS.FORMATIONS_VIEW,
    PERMISSIONS.FORMATIONS_CREATE,
    PERMISSIONS.FORMATIONS_EDIT,
    PERMISSIONS.FORMATIONS_DELETE,

    // Sessions
    PERMISSIONS.SESSIONS_VIEW,
    PERMISSIONS.SESSIONS_CREATE,
    PERMISSIONS.SESSIONS_EDIT,
    PERMISSIONS.SESSIONS_DELETE,

    // Inscriptions
    PERMISSIONS.INSCRIPTIONS_VIEW_ALL,
    PERMISSIONS.INSCRIPTIONS_SELECT,
    PERMISSIONS.INSCRIPTIONS_DELETE,

    // Présences
    PERMISSIONS.PRESENCES_VIEW_ALL,
    PERMISSIONS.PRESENCES_SCAN,
    PERMISSIONS.PRESENCES_MANUAL,

    // Évaluations
    PERMISSIONS.EVALUATIONS_VIEW,

    // Attestations
    PERMISSIONS.ATTESTATIONS_VIEW_ALL,
    PERMISSIONS.ATTESTATIONS_GENERATE,

    // Communication
    PERMISSIONS.MESSAGERIE_USE,
    PERMISSIONS.RESEAUTAGE_USE,

    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_STATS_GLOBAL,

    // Partenaires
    PERMISSIONS.PARTENAIRES_VIEW,
  ],

  // ==========================================================================
  //  FORMATEUR — Animer et évaluer
  // ==========================================================================
  [RoleName.FORMATEUR]: [
    // Formations (lecture)
    PERMISSIONS.FORMATIONS_VIEW,

    // Sessions
    PERMISSIONS.SESSIONS_VIEW,

    // Inscriptions (lecture de ses sessions)
    PERMISSIONS.INSCRIPTIONS_VIEW_ALL,

    // Présences
    PERMISSIONS.PRESENCES_VIEW_ALL,
    PERMISSIONS.PRESENCES_SCAN,
    PERMISSIONS.PRESENCES_MANUAL,

    // Évaluations
    PERMISSIONS.EVALUATIONS_VIEW,
    PERMISSIONS.EVALUATIONS_CREATE,
    PERMISSIONS.EVALUATIONS_GRADE,

    // Communication
    PERMISSIONS.MESSAGERIE_USE,
    PERMISSIONS.RESEAUTAGE_USE,

    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_STATS_PERSONAL,
  ],

  // ==========================================================================
  //  PARTICIPANT — Apprendre et suivre
  // ==========================================================================
  [RoleName.PARTICIPANT]: [
    // Formations (catalogue)
    PERMISSIONS.FORMATIONS_VIEW,

    // Sessions (consulter)
    PERMISSIONS.SESSIONS_VIEW,

    // Inscriptions
    PERMISSIONS.INSCRIPTIONS_VIEW_OWN,
    PERMISSIONS.INSCRIPTIONS_CREATE,

    // Présences
    PERMISSIONS.PRESENCES_VIEW_OWN,

    // Attestations
    PERMISSIONS.ATTESTATIONS_VIEW_OWN,

    // Communication
    PERMISSIONS.MESSAGERIE_USE,
    PERMISSIONS.RESEAUTAGE_USE,

    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_STATS_PERSONAL,
  ],

  // ==========================================================================
  //  PARTENAIRE — Consulter et réseauter
  // ==========================================================================
  [RoleName.PARTENAIRE]: [
    // Formations (catalogue)
    PERMISSIONS.FORMATIONS_VIEW,

    // Sessions (lecture)
    PERMISSIONS.SESSIONS_VIEW,

    // Communication
    PERMISSIONS.MESSAGERIE_USE,
    PERMISSIONS.RESEAUTAGE_USE,

    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_STATS_GLOBAL,
  ],
};

// ============================================================================
//  HELPERS
// ============================================================================

export function hasPermission(
  role: RoleName | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  role: RoleName | undefined,
  permissions: Permission[]
): boolean {
  if (!role) return false;
  const userPerms = ROLE_PERMISSIONS[role] ?? [];
  return permissions.some((p) => userPerms.includes(p));
}

export function hasAllPermissions(
  role: RoleName | undefined,
  permissions: Permission[]
): boolean {
  if (!role) return false;
  const userPerms = ROLE_PERMISSIONS[role] ?? [];
  return permissions.every((p) => userPerms.includes(p));
}

export function getRolePermissions(role: RoleName): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}