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