import type { RoleName } from '@/types/role.types';

/* ============================================================================
   PERMISSIONS PAR RÔLE
   ============================================================================ */
export const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  ADMINISTRATEUR: ['*'],

  STAFF_ODC: [
    'user:read',
    'formation:read', 'formation:create', 'formation:update', 'formation:publier',
    'session:read', 'session:create', 'session:update', 'session:presence',
    'inscription:select',
    'attestation:generer',
    'partenaire:manage',
    'stats:global',
    'reseau:use',
    'messagerie:use',
  ],

  FORMATEUR: [
    'formation:read',
    'session:read', 'session:presence',
    'evaluation:manage',
    'note:saisir',
    'attestation:generer',
    'stats:own',
    'reseau:use',
    'messagerie:use',
  ],

  PARTICIPANT: [
    'formation:read',
    'session:read',
    'inscription:create',
    'attestation:telecharger',
    'reseau:use',
    'messagerie:use',
    'stats:own',
  ],

  PARTENAIRE: [
    'formation:read',
    'session:read',
    'reseau:use',
    'messagerie:use',
  ],
};

/* ============================================================================
   HELPERS
   ============================================================================ */
export function hasPermission(role: RoleName | undefined, permission: string): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  if (perms.includes('*')) return true;
  return perms.includes(permission);
}

export function hasAnyPermission(role: RoleName | undefined, permissions: string[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: RoleName | undefined, permissions: string[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}