'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
  hasAnyPermission,
  hasAllPermissions,
  hasPermission,
} from '@/lib/permissions';
import type { RoleName } from '@/types/role.types';

export interface UsePermissionsReturn {
  role?: RoleName;
  permissions: string[];
  can: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
  canAll: (permissions: string[]) => boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.nom as RoleName | undefined;
  const permissions = useMemo(
    () => user?.role?.permissions?.map((permission) => permission.code) ?? [],
    [user?.role?.permissions],
  );

  return {
    role,
    permissions,
    can: (permission) =>
      permissions.includes('*') ||
      permissions.includes(permission) ||
      hasPermission(role, permission),
    canAny: (requested) =>
      requested.some((permission) => permissions.includes(permission)) ||
      hasAnyPermission(role, requested),
    canAll: (requested) =>
      requested.every((permission) => permissions.includes(permission)) ||
      hasAllPermissions(role, requested),
  };
}
