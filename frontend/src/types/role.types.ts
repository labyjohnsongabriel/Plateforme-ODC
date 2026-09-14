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