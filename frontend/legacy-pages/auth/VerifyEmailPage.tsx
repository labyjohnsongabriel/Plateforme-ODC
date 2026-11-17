import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import api from '@/services/api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de vérification manquant');
      return;
    }

    const verify = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage('Votre email a été vérifié avec succès !');

        setTimeout(() => navigate('/login'), 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Lien invalide ou expiré');
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <Card padding="lg" className="text-center animate-fade-in">
      {status === 'loading' && (
        <>
          <div className="inline-flex w-20 h-20 rounded-full bg-odc-primary-soft items-center justify-center mb-4">
            <Loader2 size={40} className="text-odc-primary animate-spin" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2 text-odc-text-light dark:text-odc-text-dark">
            Vérification en cours...
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
            Veuillez patienter pendant la vérification de votre email.
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="inline-flex w-20 h-20 rounded-full bg-odc-success-bg items-center justify-center mb-4">
            <CheckCircle size={40} className="text-odc-success" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2 text-odc-text-light dark:text-odc-text-dark">
            Email vérifié ! 🎉
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark mb-6">
            {message}
          </p>
          <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mb-4">
            Redirection vers la page de connexion...
          </p>
          <Link to="/login">
            <Button variant="primary" fullWidth icon={<ArrowRight size={16} />}>
              Se connecter
            </Button>
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="inline-flex w-20 h-20 rounded-full bg-odc-error-bg items-center justify-center mb-4">
            <XCircle size={40} className="text-odc-error" />
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2 text-odc-text-light dark:text-odc-text-dark">
            Échec de la vérification
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark mb-6">
            {message}
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/login">
              <Button variant="primary" fullWidth>
                Retour à la connexion
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" fullWidth>
                Créer un nouveau compte
              </Button>
            </Link>
          </div>
        </>
      )}
    </Card>
  );
}