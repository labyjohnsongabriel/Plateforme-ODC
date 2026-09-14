import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permission } from '@/config/permissions.config';

// ============================================================================
//  CAN — Affiche les enfants si l'utilisateur a la permission
// ============================================================================

interface CanProps {
  permission: Permission | Permission[];
  mode?: 'any' | 'all';
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({
  permission,
  mode = 'any',
  fallback = null,
  children,
}: CanProps) {
  const { can } = usePermissions();

  const permissions = Array.isArray(permission) ? permission : [permission];

  const allowed =
    mode === 'all'
      ? permissions.every((p) => can(p))
      : permissions.some((p) => can(p));

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}

export default Can;