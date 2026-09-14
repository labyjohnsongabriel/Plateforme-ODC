import { useState } from 'react';
import toast from 'react-hot-toast';
import { AuthService } from '../services/auth.service';

export function useAuthActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await AuthService.forgotPassword({ email });
      setSuccess(true);
      toast.success('Email envoyé ! Vérifiez votre boîte de réception.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, motDePasse: string) => {
    setLoading(true);
    setError(null);

    try {
      await AuthService.resetPassword({ token, nouveauMotDePasse: motDePasse });
      toast.success('Mot de passe réinitialisé !');
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lien invalide ou expiré');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (ancien: string, nouveau: string) => {
    setLoading(true);
    setError(null);

    try {
      await AuthService.changePassword({
        ancienMotDePasse: ancien,
        nouveauMotDePasse: nouveau,
      });
      toast.success('Mot de passe modifié');
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    forgotPassword,
    resetPassword,
    changePassword,
    reset: () => {
      setError(null);
      setSuccess(false);
    },
  };
}