// src/components/auth/RoleGuard.tsx
'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FullPageLoader } from '@/components/shared/FullPageLoader';
import { useAuthContext } from '@/contexts/AuthContext';
import { ROUTES, getDashboardRoute } from '@/lib/routes';
import type { RoleName } from '@/types/role.types';

/* ============================================================================
   TYPES
   ============================================================================ */

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: RoleName[];
  redirectTo?: string;
  fallbackTo?: string;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function RoleGuard({
  children,
  allowedRoles,
  redirectTo,
  fallbackTo,
}: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isHydrated } = useAuthContext();

  /* -------------------- ⭐ Ligne 32 corrigée -------------------- */
  // Avant : ROUTES.AUTH.LOGIN  → undefined
  // Après : ROUTES.auth.connexion (camelCase, conforme à ton routes.ts)
  const loginRoute = redirectTo ?? ROUTES.auth.connexion;

  const userRole = user?.role?.nom as RoleName | undefined;

  /* -------------------- Redirections -------------------- */
  useEffect(() => {
    if (!isHydrated) return;

    // 1. Non authentifié
    if (!isAuthenticated || !user) {
      const next = encodeURIComponent(pathname || '/');
      router.replace(`${loginRoute}?next=${next}`);
      return;
    }

    // 2. Rôle non autorisé
    if (allowedRoles && allowedRoles.length > 0) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        const target = fallbackTo ?? getDashboardRoute(userRole);
        router.replace(target);
      }
    }
  }, [
    isHydrated,
    isAuthenticated,
    user,
    userRole,
    allowedRoles,
    router,
    pathname,
    loginRoute,
    fallbackTo,
  ]);

  /* ========================================================================
     RENDUS CONDITIONNELS
     ======================================================================== */

  if (!isHydrated) {
    return <FullPageLoader message="Vérification de la session…" />;
  }

  if (!isAuthenticated || !user) {
    return <FullPageLoader message="Redirection vers la connexion…" />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <FullPageLoader message="Accès réservé. Redirection…" />;
    }
  }

  return <>{children}</>;
}