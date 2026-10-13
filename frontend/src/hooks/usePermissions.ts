<<<<<<< HEAD
import { useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '@/config/permissions.config';
import type { Permission } from '@/config/permissions.config';

// ============================================================================
//  USE PERMISSIONS
// ============================================================================

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role?.nom;

  const permissions = useMemo<Permission[]>(() => {
    if (!role) return [];
    return ROLE_PERMISSIONS[role] ?? [];
  }, [role]);

  // ========================================================================
  //  FONCTIONS (nommées clairement)
  // ========================================================================

  const can = useCallback(
    (permission: Permission): boolean => hasPermission(role, permission),
    [role]
  );

  const canAny = useCallback(
    (perms: Permission[]): boolean => hasAnyPermission(role, perms),
    [role]
  );

  const canAll = useCallback(
    (perms: Permission[]): boolean => hasAllPermissions(role, perms),
    [role]
  );

  // ========================================================================
  //  MAP des permissions (nommée différemment)
  // ========================================================================

  const permissionsMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    permissions.forEach((p) => {
      map[p] = true;
    });
    return map;
  }, [permissions]);

  // ========================================================================
  //  RETURN
  // ========================================================================

  return {
    // Rôle
    role,

    // Liste brute
    permissions,

    // ✅ Fonctions
    can,
    canAny,
    canAll,

    // ✅ Map pour les checks rapides (par clé de PERMISSIONS)
    has: (permissionKey: string): boolean => !!permissionsMap[permissionKey],

    // Raccourcis de rôle
    isAdmin: role === 'ADMIN',
    isStaff: role === 'STAFF',
    isFormateur: role === 'FORMATEUR',
    isParticipant: role === 'PARTICIPANT',
    isPartenaire: role === 'PARTENAIRE',
  };
}

export default usePermissions;
=======
// src/hooks/usePermissions.ts
'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '@/lib/permissions';
import type { RoleName } from '@/types/role.types';

export interface UsePermissionsReturn {
  permissions: string[];
  can: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
  canAll: (permissions: string[]) => boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const user = useAuthStore((s) => s.user);
  const role = user?.role?.nom as RoleName | undefined;

  const permissions = useMemo(
    () => user?.role?.permissions?.map((p) => p.code) ?? [],
    [user?.role?.permissions],
  );

  return {
    permissions,
    can: (p) => permissions.includes(p) || hasPermission(role, p),
    canAny: (p) => p.some((x) => permissions.includes(x)) || hasAnyPermission(role, p),
    canAll: (p) => p.every((x) => permissions.includes(x)) || hasAllPermissions(role, p),
  };
}
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
