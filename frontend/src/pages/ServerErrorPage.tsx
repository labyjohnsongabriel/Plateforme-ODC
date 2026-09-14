import { Link, useNavigate } from 'react-router-dom';
import { ServerCrash, Home, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';

export default function ServerErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-odc-bg-light dark:bg-odc-bg-dark p-4">
      <div className="text-center max-w-md">
        <div className="relative mb-6">
          <h1 className="font-heading text-[100px] md:text-[140px] font-bold text-odc-error/20 leading-none">
            500
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-3xl bg-odc-error-bg flex items-center justify-center">
              <ServerCrash size={48} className="text-odc-error" />
            </div>
          </div>
        </div>

        <h2 className="font-heading text-3xl font-bold text-odc-text-light dark:text-odc-text-dark mb-3">
          Erreur serveur
        </h2>
        <p className="text-odc-text-muted-light dark:text-odc-text-muted-dark mb-8">
          Une erreur interne s'est produite. Nos équipes travaillent à résoudre le problème.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
            Retour
          </Button>
          <Button variant="primary" icon={<RefreshCw size={16} />} onClick={() => window.location.reload()}>
            Recharger
          </Button>
          <Link to="/dashboard">
            <Button variant="outline" icon={<Home size={16} />}>
              Accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}