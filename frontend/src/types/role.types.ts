<<<<<<< HEAD
import { ID } from './common.types';
import { RoleName } from './user.types';

// ============================================================================
//  PERMISSIONS
// ============================================================================

export enum PermissionCode {
  // Users
  USER_CREATE = 'users.create',
  USER_READ = 'users.read',
  USER_UPDATE = 'users.update',
  USER_DELETE = 'users.delete',
  USER_CHANGE_ROLE = 'users.change_role',

  // Formations
  FORMATION_CREATE = 'formations.create',
  FORMATION_READ = 'formations.read',
  FORMATION_UPDATE = 'formations.update',
  FORMATION_DELETE = 'formations.delete',

  // Sessions
  SESSION_CREATE = 'sessions.create',
  SESSION_READ = 'sessions.read',
  SESSION_UPDATE = 'sessions.update',
  SESSION_DELETE = 'sessions.delete',

  // Inscriptions
  INSCRIPTION_CREATE = 'inscriptions.create',
  INSCRIPTION_READ = 'inscriptions.read',
  INSCRIPTION_SELECT = 'inscriptions.select',

  // Présences
  PRESENCE_SCAN = 'presences.scan',
  PRESENCE_MANAGE = 'presences.manage',

  // Évaluations
  EVALUATION_CREATE = 'evaluations.create',
  EVALUATION_GRADE = 'evaluations.grade',

  // Attestations
  ATTESTATION_GENERATE = 'attestations.generate',
  ATTESTATION_DOWNLOAD = 'attestations.download',

  // Admin
  ADMIN_AUDIT = 'admin.audit',
  ADMIN_CONFIG = 'admin.config',
}

export interface Permission {
  id: ID;
  code: PermissionCode;
  libelle: string;
  categorie: string;
  description?: string;
}

export interface RoleWithPermissions {
  id: ID;
  nom: RoleName;
  description?: string;
  permissions: Permission[];
}

// ============================================================================
//  MATRICE RBAC
// ============================================================================

export const ROLE_PERMISSIONS: Record<RoleName, PermissionCode[]> = {
  ADMIN: Object.values(PermissionCode),

  STAFF: [
    PermissionCode.USER_READ,
    PermissionCode.FORMATION_CREATE,
    PermissionCode.FORMATION_READ,
    PermissionCode.FORMATION_UPDATE,
    PermissionCode.SESSION_CREATE,
    PermissionCode.SESSION_READ,
    PermissionCode.SESSION_UPDATE,
    PermissionCode.INSCRIPTION_READ,
    PermissionCode.INSCRIPTION_SELECT,
    PermissionCode.PRESENCE_MANAGE,
    PermissionCode.ATTESTATION_GENERATE,
  ],

  FORMATEUR: [
    PermissionCode.FORMATION_READ,
    PermissionCode.SESSION_READ,
    PermissionCode.INSCRIPTION_READ,
    PermissionCode.PRESENCE_SCAN,
    PermissionCode.PRESENCE_MANAGE,
    PermissionCode.EVALUATION_CREATE,
    PermissionCode.EVALUATION_GRADE,
  ],

  PARTICIPANT: [
    PermissionCode.FORMATION_READ,
    PermissionCode.SESSION_READ,
    PermissionCode.INSCRIPTION_CREATE,
    PermissionCode.INSCRIPTION_READ,
    PermissionCode.PRESENCE_SCAN,
    PermissionCode.ATTESTATION_DOWNLOAD,
  ],

  PARTENAIRE: [
    PermissionCode.FORMATION_READ,
    PermissionCode.SESSION_READ,
  ],
};

// ============================================================================
//  HELPERS
// ============================================================================

export function roleHasPermission(role: RoleName, permission: PermissionCode): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

export function roleHasAnyPermission(role: RoleName, permissions: PermissionCode[]): boolean {
  return permissions.some((p) => roleHasPermission(role, p));
}

export function roleHasAllPermissions(role: RoleName, permissions: PermissionCode[]): boolean {
  return permissions.every((p) => roleHasPermission(role, p));
}
=======
// src/types/role.types.ts

/* ============================================================================
   RÔLES — Type union
   ============================================================================ */

export type RoleName =
  | 'ADMINISTRATEUR'
  | 'STAFF_ODC'
  | 'FORMATEUR'
  | 'PARTICIPANT'
  | 'PARTENAIRE';

/* ============================================================================
   LIBELLÉS
   ============================================================================ */

export const ROLE_LABELS: Record<RoleName, string> = {
  ADMINISTRATEUR: 'Administrateur',
  STAFF_ODC: 'Staff ODC',
  FORMATEUR: 'Formateur',
  PARTICIPANT: 'Participant',
  PARTENAIRE: 'Partenaire',
};

/* ============================================================================
   COULEURS (pour l'UI)
   ============================================================================ */

export const ROLE_COLORS: Record<
  RoleName,
  {
    /** Nom Tailwind court (ex: 'red') */
    name: string;
    /** Classes Tailwind complètes (background + texte) */
    bg: string;
    /** Classe texte */
    text: string;
    /** Classe bordure */
    border: string;
    /** Code hexadécimal */
    hex: string;
  }
> = {
  ADMINISTRATEUR: {
    name: 'red',
    bg: 'bg-red-100 dark:bg-red-950',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-900',
    hex: '#DC2626',
  },
  STAFF_ODC: {
    name: 'orange',
    bg: 'bg-orange-100 dark:bg-orange-950',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-900',
    hex: '#FF7900',
  },
  FORMATEUR: {
    name: 'blue',
    bg: 'bg-blue-100 dark:bg-blue-950',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-900',
    hex: '#2563EB',
  },
  PARTICIPANT: {
    name: 'green',
    bg: 'bg-green-100 dark:bg-green-950',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-900',
    hex: '#16A34A',
  },
  PARTENAIRE: {
    name: 'purple',
    bg: 'bg-purple-100 dark:bg-purple-950',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-900',
    hex: '#9333EA',
  },
};

/**
 * Version simplifiée (compatibilité descendante)
 * @deprecated Utiliser `ROLE_COLORS[role].name` à la place
 */
export const ROLE_COLORS_SIMPLE: Record<RoleName, string> = {
  ADMINISTRATEUR: 'red',
  STAFF_ODC: 'orange',
  FORMATEUR: 'blue',
  PARTICIPANT: 'green',
  PARTENAIRE: 'purple',
};

/* ============================================================================
   ICÔNES (noms Lucide)
   ============================================================================ */

export const ROLE_ICONS: Record<RoleName, string> = {
  ADMINISTRATEUR: 'Shield',
  STAFF_ODC: 'Users',
  FORMATEUR: 'GraduationCap',
  PARTICIPANT: 'User',
  PARTENAIRE: 'Building2',
};

/* ============================================================================
   HIÉRARCHIE
   ============================================================================ */

export const ROLE_HIERARCHY: Record<RoleName, number> = {
  ADMINISTRATEUR: 100,
  STAFF_ODC: 80,
  FORMATEUR: 60,
  PARTENAIRE: 40,
  PARTICIPANT: 20,
};

/* ============================================================================
   DESCRIPTIONS
   ============================================================================ */

export const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  ADMINISTRATEUR: 'Accès total à la plateforme',
  STAFF_ODC: 'Gestion des formations et sessions',
  FORMATEUR: 'Animation des sessions de formation',
  PARTICIPANT: 'Apprenant suivant des formations',
  PARTENAIRE: 'Organisation partenaire de l\'ODC',
};

/* ============================================================================
   PERMISSIONS
   ============================================================================ */

export interface Permission {
  id: string;
  code: string;
  libelle: string;
  categorie?: string;
  description?: string;
}

/* ============================================================================
   RÔLE
   ============================================================================ */

export interface Role {
  id: string;
  nom: RoleName;
  libelle: string;
  description?: string | null;
  niveauHierarchie: number;
  couleur?: string | null;
  icone?: string | null;
  actif: boolean;
  estSysteme: boolean;
  permissions?: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

/* ============================================================================
   RÔLE SIMPLIFIÉ (pour user.role)
   ============================================================================ */

export interface RoleSummary {
  id?: string;
  nom: RoleName;
  libelle?: string;
  permissions?: Permission[];
}

/* ============================================================================
   HELPERS
   ============================================================================ */

/**
 * Récupère le libellé d'un rôle.
 */
export function getRoleLabel(role?: RoleName | string | null): string {
  if (!role) return '—';
  return ROLE_LABELS[role as RoleName] ?? role;
}

/**
 * Récupère les classes Tailwind d'un rôle.
 */
export function getRoleClasses(role?: RoleName | string | null) {
  if (!role) {
    return {
      name: 'gray',
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-700',
      hex: '#6B7280',
    };
  }
  return ROLE_COLORS[role as RoleName] ?? ROLE_COLORS.PARTICIPANT;
}

/**
 * Récupère l'icône d'un rôle.
 */
export function getRoleIcon(role?: RoleName | string | null): string {
  if (!role) return 'User';
  return ROLE_ICONS[role as RoleName] ?? 'User';
}

/**
 * Récupère le niveau hiérarchique d'un rôle.
 */
export function getRoleLevel(role?: RoleName | string | null): number {
  if (!role) return 0;
  return ROLE_HIERARCHY[role as RoleName] ?? 0;
}

/**
 * Vérifie si un rôle a au moins le niveau d'un autre.
 *
 * @example
 * atLeastRole('ADMINISTRATEUR', 'STAFF_ODC') // → true (100 >= 80)
 * atLeastRole('PARTICIPANT', 'FORMATEUR')    // → false (20 < 60)
 */
export function atLeastRole(
  userRole: RoleName | string | null | undefined,
  minRole: RoleName,
): boolean {
  if (!userRole) return false;
  const userLevel = getRoleLevel(userRole);
  const minLevel = getRoleLevel(minRole);
  return userLevel >= minLevel;
}

/**
 * Vérifie si un rôle fait partie d'une liste.
 */
export function hasRole(
  userRole: RoleName | string | null | undefined,
  allowedRoles: RoleName | RoleName[],
): boolean {
  if (!userRole) return false;
  const list = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return list.includes(userRole as RoleName);
}

/**
 * Retourne tous les rôles sous forme de tableau.
 */
export function getAllRoles(): Array<{
  value: RoleName;
  label: string;
  description: string;
  couleur: string;
  icone: string;
}> {
  return (Object.keys(ROLE_LABELS) as RoleName[]).map((role) => ({
    value: role,
    label: ROLE_LABELS[role],
    description: ROLE_DESCRIPTIONS[role],
    couleur: ROLE_COLORS[role].hex,
    icone: ROLE_ICONS[role],
  }));
}

/**
 * Vérifie si un rôle est un rôle système (non supprimable).
 */
export function isSystemRole(role: RoleName): boolean {
  return true; // Tous les rôles actuels sont système
}

/**
 * Vérifie si un rôle peut gérer des utilisateurs.
 */
export function canManageUsers(role?: RoleName | string | null): boolean {
  return hasRole(role, ['ADMINISTRATEUR', 'STAFF_ODC']);
}

/**
 * Vérifie si un rôle peut gérer des formations.
 */
export function canManageFormations(role?: RoleName | string | null): boolean {
  return hasRole(role, ['ADMINISTRATEUR', 'STAFF_ODC']);
}

/**
 * Vérifie si un rôle peut animer des sessions.
 */
export function canAnimateSessions(role?: RoleName | string | null): boolean {
  return hasRole(role, ['ADMINISTRATEUR', 'STAFF_ODC', 'FORMATEUR']);
}

/* ============================================================================
   CONSTANTES
   ============================================================================ */

/**
 * Liste des rôles disponibles.
 */
export const ROLE_NAMES: RoleName[] = [
  'ADMINISTRATEUR',
  'STAFF_ODC',
  'FORMATEUR',
  'PARTICIPANT',
  'PARTENAIRE',
];

/**
 * Rôles qui peuvent se connecter au back-office.
 */
export const BACK_OFFICE_ROLES: RoleName[] = [
  'ADMINISTRATEUR',
  'STAFF_ODC',
  'FORMATEUR',
];

/**
 * Rôles publics (front-office).
 */
export const FRONT_OFFICE_ROLES: RoleName[] = [
  'PARTICIPANT',
  'PARTENAIRE',
];

/**
 * Rôles avec accès administration.
 */
export const ADMIN_ROLES: RoleName[] = [
  'ADMINISTRATEUR',
  'STAFF_ODC',
];
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
