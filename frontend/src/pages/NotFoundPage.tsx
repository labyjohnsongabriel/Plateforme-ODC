import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-odc-bg-light dark:bg-odc-bg-dark p-4">
      <div className="text-center max-w-md">
        <div className="relative mb-6">
          <h1 className="font-heading text-[120px] md:text-[180px] font-bold text-odc-primary/20 leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-odc-primary to-odc-primary-dark flex items-center justify-center text-white shadow-odc-lg">
              <Search size={48} />
            </div>
          </div>
        </div>

        <h2 className="font-heading text-3xl font-bold text-odc-text-light dark:text-odc-text-dark mb-3">
          Page introuvable
        </h2>
        <p className="text-odc-text-muted-light dark:text-odc-text-muted-dark mb-8">
          Désolé, la page que vous cherchez n'existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => window.history.back()}>
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