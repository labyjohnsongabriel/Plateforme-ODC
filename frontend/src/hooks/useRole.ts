// src/hooks/useRole.ts
'use client';

import { useAuthStore } from '@/store/auth.store';
import { ROLE_HIERARCHY, ROLE_LABELS } from '@/types/role.types';
import type { RoleName } from '@/types/role.types';

export interface UseRoleReturn {
  role: RoleName | undefined;
  roleLabel: string | null;
  niveau: number;

  // Booléens
  isAdmin: boolean;
  isStaff: boolean;
  isFormateur: boolean;
  isParticipant: boolean;
  isPartenaire: boolean;

  // Helpers
  hasRole: (role: RoleName | RoleName[]) => boolean;
  atLeast: (role: RoleName) => boolean;
  isOneOf: (roles: RoleName[]) => boolean;
}

export function useRole(): UseRoleReturn {
  const user = useAuthStore((s) => s.user);
  const role = user?.role?.nom as RoleName | undefined;

  const hasRole = (r: RoleName | RoleName[]) => {
    if (!role) return false;
    const roles = Array.isArray(r) ? r : [r];
    return roles.includes(role);
  };

  const atLeast = (r: RoleName) => {
    if (!role) return false;
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[r];
  };

  return {
    role,
    roleLabel: role ? ROLE_LABELS[role] : null,
    niveau: role ? ROLE_HIERARCHY[role] : 0,

    isAdmin: role === 'ADMINISTRATEUR',
    isStaff: role === 'STAFF_ODC',
    isFormateur: role === 'FORMATEUR',
    isParticipant: role === 'PARTICIPANT',
    isPartenaire: role === 'PARTENAIRE',

    hasRole,
    atLeast,
    isOneOf: (roles) => hasRole(roles),
  };
}