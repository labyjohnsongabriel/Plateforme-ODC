import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { RegisterForm } from '@/features/auth';
import { useAuth } from '@/context/AuthContext';

// ============================================================================
//  REGISTER PAGE
// ============================================================================

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
<<<<<<< HEAD

=======
// src/pages/auth/RegisterPage.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RegisterForm } from '@/features/auth';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/lib/routes';
import { FullPageLoader } from '@/components/shared/FullPageLoader';

/* ============================================================================
   REGISTER PAGE
   ============================================================================ */

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  /* -------------------------------------------------------------------- */
  /* REDIRECTION SI DÉJÀ CONNECTÉ                                         */
  /* -------------------------------------------------------------------- */
  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;

    // Si un "from" est fourni dans le state de navigation, on y va
    const from =
      (location.state as { from?: string } | null)?.from ??
      getDashboardRoute(user.role?.nom);

    navigate(from, { replace: true });
  }, [isAuthenticated, isLoading, user, navigate, location.state]);

  /* -------------------------------------------------------------------- */
  /* LOADER PENDANT L'HYDRATATION                                         */
  /* -------------------------------------------------------------------- */
  if (isLoading) {
    return <FullPageLoader message="Chargement…" />;
  }

  /* -------------------------------------------------------------------- */
  /* NE PAS AFFICHER LE FORMULAIRE SI DÉJÀ AUTHENTIFIÉ                    */
  /* -------------------------------------------------------------------- */
  if (isAuthenticated) {
    return null; // Le useEffect redirige
  }

  /* -------------------------------------------------------------------- */
  /* RENDU                                                                */
  /* -------------------------------------------------------------------- */
  return <RegisterForm />;
}

/* ============================================================================
   HELPERS
   ============================================================================ */

const ROLE_DASHBOARD: Record<string, string> = {
  ADMINISTRATEUR: ROUTES.ADMIN.DASHBOARD,
  STAFF_ODC: ROUTES.STAFF.DASHBOARD,
  FORMATEUR: ROUTES.FORMATEUR.DASHBOARD,
  PARTICIPANT: ROUTES.PARTICIPANT.DASHBOARD,
  PARTENAIRE: ROUTES.PARTENAIRE.DASHBOARD,
};

function getDashboardRoute(role?: string | null): string {
  if (!role) return ROUTES.PUBLIC.HOME;
  return ROLE_DASHBOARD[role] ?? ROUTES.PUBLIC.HOME;
}
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  // Redirection si déjà connecté
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return <RegisterForm />;
}