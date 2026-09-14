import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { ReactNode } from 'react';

// ============================================================================
//  PUBLIC ROUTE — Redirige si DÉJÀ CONNECTÉ
//  À utiliser UNIQUEMENT pour les pages login/register
// ============================================================================

interface PublicRouteProps {
  children?: ReactNode;
  redirectTo?: string;
}

export function PublicRoutes({
  children,
  redirectTo = '/dashboard',
}: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Attendre la vérification de session
  if (isLoading) {
    return null; // ou un loader
  }

  // Déjà connecté → redirige vers dashboard
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children ?? <Outlet />}</>;
}

export default PublicRoutes;