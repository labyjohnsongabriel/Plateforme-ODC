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