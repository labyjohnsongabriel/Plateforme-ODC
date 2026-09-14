import { RoleName } from '@/types/user.types';
import { PermissionCode, ROLE_PERMISSIONS } from '@/types/role.types';

// ============================================================================
//  RBAC HELPERS
// ============================================================================

/**
 * Vérifie si un rôle possède une permission
 */
export function hasPermission(role: RoleName | null | undefined, permission: PermissionCode): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Vérifie si un rôle possède AU MOINS UNE permission
 */
export function hasAnyPermission(
  role: RoleName | null | undefined,
  permissions: PermissionCode[]
): boolean {
  if (!role) return false;
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Vérifie si un rôle possède TOUTES les permissions
 */
export function hasAllPermissions(
  role: RoleName | null | undefined,
  permissions: PermissionCode[]
): boolean {
  if (!role) return false;
  return permissions.every((p) => hasPermission(role, p));
}

// ============================================================================
//  ROLE HELPERS
// ============================================================================

export function isAdmin(role: RoleName | null | undefined): boolean {
  return role === RoleName.ADMIN;
}

export function isStaff(role: RoleName | null | undefined): boolean {
  return role === RoleName.STAFF;
}

export function isFormateur(role: RoleName | null | undefined): boolean {
  return role === RoleName.FORMATEUR;
}

export function isParticipant(role: RoleName | null | undefined): boolean {
  return role === RoleName.PARTICIPANT;
}

export function isPartenaire(role: RoleName | null | undefined): boolean {
  return role === RoleName.PARTENAIRE;
}

export function isInternal(role: RoleName | null | undefined): boolean {
  return [RoleName.ADMIN, RoleName.STAFF, RoleName.FORMATEUR].includes(role as RoleName);
}

export function hasRole(role: RoleName | null | undefined, roles: RoleName[]): boolean {
  if (!role) return false;
  return roles.includes(role);
}

// ============================================================================
//  ACCESS HELPERS
// ============================================================================

export function canManageUsers(role: RoleName | null | undefined): boolean {
  return isAdmin(role);
}

export function canManageFormations(role: RoleName | null | undefined): boolean {
  return hasRole(role, [RoleName.ADMIN, RoleName.STAFF]);
}

export function canManageSessions(role: RoleName | null | undefined): boolean {
  return hasRole(role, [RoleName.ADMIN, RoleName.STAFF]);
}

export function canSelectCandidates(role: RoleName | null | undefined): boolean {
  return hasRole(role, [RoleName.ADMIN, RoleName.STAFF]);
}

export function canManageEvaluations(role: RoleName | null | undefined): boolean {
  return hasRole(role, [RoleName.ADMIN, RoleName.FORMATEUR]);
}

export function canGenerateAttestations(role: RoleName | null | undefined): boolean {
  return hasRole(role, [RoleName.ADMIN, RoleName.STAFF]);
}

export function canDownloadAttestations(role: RoleName | null | undefined): boolean {
  return hasRole(role, [RoleName.ADMIN, RoleName.STAFF, RoleName.PARTICIPANT]);
}

export function canViewDashboard(role: RoleName | null | undefined): boolean {
  return !!role;
}

export function canParticipateToFormation(role: RoleName | null | undefined): boolean {
  return role === RoleName.PARTICIPANT;
}

export function canViewStatistics(role: RoleName | null | undefined): boolean {
  return !!role;
}

// ============================================================================
//  PERMISSION GROUP HELPERS
// ============================================================================

export const PERMISSION_GROUPS = {
  USERS: [
    PermissionCode.USER_CREATE,
    PermissionCode.USER_READ,
    PermissionCode.USER_UPDATE,
    PermissionCode.USER_DELETE,
    PermissionCode.USER_CHANGE_ROLE,
  ],
  FORMATIONS: [
    PermissionCode.FORMATION_CREATE,
    PermissionCode.FORMATION_READ,
    PermissionCode.FORMATION_UPDATE,
    PermissionCode.FORMATION_DELETE,
  ],
  INSCRIPTIONS: [
    PermissionCode.INSCRIPTION_CREATE,
    PermissionCode.INSCRIPTION_READ,
    PermissionCode.INSCRIPTION_SELECT,
  ],
  ATTRIBUTIONS: [
    PermissionCode.ATTESTATION_GENERATE,
    PermissionCode.ATTESTATION_DOWNLOAD,
  ],
} as const;

export default {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin,
  isStaff,
  isFormateur,
  isParticipant,
  isPartenaire,
  isInternal,
  hasRole,
  canManageUsers,
  canManageFormations,
  canManageSessions,
  canSelectCandidates,
  canManageEvaluations,
  canGenerateAttestations,
  canDownloadAttestations,
  canViewDashboard,
  canParticipateToFormation,
  canViewStatistics,
  PERMISSION_GROUPS,
};