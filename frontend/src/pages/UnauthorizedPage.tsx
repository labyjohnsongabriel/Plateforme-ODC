import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '@/components/common/Button';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-odc-bg-light dark:bg-odc-bg-dark p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex w-24 h-24 rounded-3xl bg-odc-error-bg items-center justify-center mb-6">
          <ShieldAlert size={48} className="text-odc-error" />
        </div>

        <h1 className="font-heading text-3xl font-bold text-odc-text-light dark:text-odc-text-dark mb-3">
          Accès refusé
        </h1>
        <p className="text-odc-text-muted-light dark:text-odc-text-muted-dark mb-8">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          Contactez un administrateur si vous pensez qu'il s'agit d'une erreur.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
            Retour
          </Button>
          <Link to="/dashboard">
            <Button variant="primary" icon={<Home size={16} />}>
              Tableau de bord
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}