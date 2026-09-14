import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { LoginForm } from '@/features/auth';
import { useAuth } from '@/context/AuthContext';

// ============================================================================
//  LOGIN PAGE
// ============================================================================

interface LocationState {
  from?: {
    pathname: string;
  };
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  const state = location.state as LocationState | null;
  const from = state?.from?.pathname ?? '/dashboard';

  // Redirection si déjà connecté (sécurité supplémentaire)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, from, navigate]);

  return <LoginForm />;
}