// src/lib/permissions.ts
import type { RoleName } from '@/types/role.types';

/* ============================================================================
   PERMISSIONS PAR RÔLE
   ============================================================================ */

export const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  ADMINISTRATEUR: ['*'],

  STAFF_ODC: [
    // Formations
    'formations.view',
    'formations.create',
    'formations.edit',
    'formations.delete',
    'formations.publish',
    // Sessions
    'sessions.view',
    'sessions.create',
    'sessions.edit',
    'sessions.delete',
    'sessions.open',
    'sessions.close',
    'sessions.cancel',
    // Inscriptions
    'inscriptions.view',
    'inscriptions.accept',
    'inscriptions.reject',
    'inscriptions.cancel',
    // Présences
    'presences.view',
    'presences.mark',
    // Notes
    'notes.view',
    'notes.create',
    'notes.edit',
    'notes.publish',
    // Attestations
    'attestations.view',
    'attestations.generate',
    'attestations.revoke',
    // Évaluations
    'evaluations.view',
    // Ressources
    'ressources.view',
    'ressources.create',
    'ressources.edit',
    'ressources.delete',
    // Utilisateurs
    'users.view',
    // Partenaires
    'partenaires.view',
    'partenaires.edit',
  ],

  FORMATEUR: [
    // Formations
    'formations.view',
    // Sessions
    'sessions.view',
    'sessions.edit.own',
    'sessions.presences',
    // Présences
    'presences.view',
    'presences.mark',
    // Notes
    'notes.view',
    'notes.create',
    'notes.edit',
    'notes.publish',
    // Évaluations
    'evaluations.view',
    // Ressources
    'ressources.view',
    'ressources.create',
    'ressources.edit',
    'ressources.delete',
    // Participants
    'participants.view',
  ],

  PARTICIPANT: [
    'formations.view',
    'sessions.view',
    'inscriptions.create',
    'inscriptions.view.own',
    'inscriptions.cancel.own',
    'attestations.view.own',
    'notes.view.own',
    'evaluations.create',
    'evaluations.view.own',
    'ressources.view',
    'reseau.view',
  ],

  PARTENAIRE: [
    'formations.view',
    'sessions.view',
    'partenaires.view.own',
    'partenaires.edit.own',
    'stats.view.anonymized',
  ],
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
   VÉRIFICATIONS
   ============================================================================ */

export function hasPermission(
  role: RoleName | undefined,
  permission: string,
): boolean {
  if (!role) return false;

  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;

  // Admin = wildcard
  if (perms.includes('*')) return true;

  // Permission exacte
  if (perms.includes(permission)) return true;

  // Permission hiérarchique (ex: "formations.edit" → "formations.*")
  const [resource] = permission.split('.');
  return perms.includes(`${resource}.*`);
}

export function hasAnyPermission(
  role: RoleName | undefined,
  permissions: string[],
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(
  role: RoleName | undefined,
  permissions: string[],
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function hasRole(
  role: RoleName | undefined,
  allowedRoles: RoleName | RoleName[],
): boolean {
  if (!role) return false;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(role);
}

export function atLeastRole(
  role: RoleName | undefined,
  minRole: RoleName,
): boolean {
  if (!role) return false;
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];
}

/* ============================================================================
   CONSTANTES DE PERMISSIONS
   ============================================================================ */

export const PERMISSIONS = {
  FORMATIONS_VIEW: 'formations.view',
  FORMATIONS_CREATE: 'formations.create',
  FORMATIONS_EDIT: 'formations.edit',
  FORMATIONS_DELETE: 'formations.delete',
  FORMATIONS_PUBLISH: 'formations.publish',

  SESSIONS_VIEW: 'sessions.view',
  SESSIONS_CREATE: 'sessions.create',
  SESSIONS_EDIT: 'sessions.edit',
  SESSIONS_DELETE: 'sessions.delete',

  INSCRIPTIONS_VIEW: 'inscriptions.view',
  INSCRIPTIONS_ACCEPT: 'inscriptions.accept',
  INSCRIPTIONS_REJECT: 'inscriptions.reject',

  PRESENCES_VIEW: 'presences.view',
  PRESENCES_MARK: 'presences.mark',

  NOTES_VIEW: 'notes.view',
  NOTES_CREATE: 'notes.create',
  NOTES_EDIT: 'notes.edit',
  NOTES_PUBLISH: 'notes.publish',

  ATTESTATIONS_VIEW: 'attestations.view',
  ATTESTATIONS_GENERATE: 'attestations.generate',

  USERS_VIEW: 'users.view',
  USERS_MANAGE: 'users.manage',

  PARTENAIRES_VIEW: 'partenaires.view',
  PARTENAIRES_EDIT: 'partenaires.edit',
} as const;