import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader } from '@/components/common/Loader';
import type { Permission } from '@/config/permissions.config';
import type { ReactNode } from 'react';

interface RoleRouteProps {
  permission?: Permission | Permission[];
  mode?: 'any' | 'all';
  redirectTo?: string;
  children?: ReactNode;
}

export function RoleRoute({
  permission,
  mode = 'any',
  redirectTo = '/403',
  children,
}: RoleRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { can } = usePermissions();

  console.log('[RoleRoute]', {
    role: user?.role?.nom,
    required: permission,
    can: permission ? (Array.isArray(permission) ? permission.some(p => can(p)) : can(permission)) : 'no-check',
  });

  if (isLoading) {
    return <Loader fullScreen text="Vérification des permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!permission) {
    return <>{children ?? <Outlet />}</>;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  const allowed =
    mode === 'all'
      ? permissions.every((p) => can(p))
      : permissions.some((p) => can(p));

  if (!allowed) {
    console.warn('[RoleRoute] Accès refusé — redirection vers', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children ?? <Outlet />}</>;
}

export default RoleRoute;