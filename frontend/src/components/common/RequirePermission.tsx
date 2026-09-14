import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader } from '@/components/common/Loader';
import { useAuth } from '@/context/AuthContext';
import type { Permission } from '@/config/permissions.config';
import type { ReactNode } from 'react';

// ============================================================================
//  REQUIRE PERMISSION — Bloque l'accès si permission manquante
// ============================================================================

interface RequirePermissionProps {
  permission: Permission | Permission[];
  mode?: 'any' | 'all';
  redirectTo?: string;
  children: ReactNode;
}

export function RequirePermission({
  permission,
  mode = 'any',
  redirectTo = '/403',
  children,
}: RequirePermissionProps) {
  const { isLoading } = useAuth();
  const { can } = usePermissions();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Vérification des permissions..." />
      </div>
    );
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  const allowed =
    mode === 'all'
      ? permissions.every((p) => can(p))
      : permissions.some((p) => can(p));

  if (!allowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

export default RequirePermission;