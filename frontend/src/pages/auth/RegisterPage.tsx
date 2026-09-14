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

  // Redirection si déjà connecté
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return <RegisterForm />;
}