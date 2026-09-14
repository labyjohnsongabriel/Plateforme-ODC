import { useMemo } from 'react';
import { RefreshCw, AlertCircle, LayoutDashboard } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useDashboard } from '@/features/dashboard';
import {
  AdminDashboard,
  StaffDashboard,
  FormateurDashboard,
  ParticipantDashboard,
  PartenaireDashboard,
} from '@/features/dashboard';
import { Loader } from '@/components/common/Loader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { RoleName } from '@/types/user.types';
import type { ComponentType } from 'react';

// ============================================================================
//  CONFIG
// ============================================================================

interface DashboardComponentProps {
  data: any;
  loading?: boolean;
}

const DASHBOARD_BY_ROLE: Record<RoleName, ComponentType<DashboardComponentProps>> = {
  [RoleName.ADMIN]: AdminDashboard,
  [RoleName.STAFF]: StaffDashboard,
  [RoleName.FORMATEUR]: FormateurDashboard,
  [RoleName.PARTICIPANT]: ParticipantDashboard,
  [RoleName.PARTENAIRE]: PartenaireDashboard,
};

// ============================================================================
//  PAGE
// ============================================================================

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data, loading, error, refetch } = useDashboard();

  const role = user?.role?.nom as RoleName | undefined;

  const DashboardComponent = useMemo(() => {
    if (!role) return null;
    return DASHBOARD_BY_ROLE[role] ?? null;
  }, [role]);

  // ------------------------------------------------------------------------
  //  AUTH encore en chargement
  // ------------------------------------------------------------------------
  if (authLoading) {
    return <Loader fullScreen text="Vérification de la session..." />;
  }

  // ------------------------------------------------------------------------
  //  Pas d'utilisateur (ne devrait pas arriver — PrivateRoute redirige)
  // ------------------------------------------------------------------------
  if (!user) {
    return (
      <div className="p-8 text-center">
        <Card className="max-w-md mx-auto p-8">
          <AlertCircle size={32} className="text-odc-warning mx-auto mb-4" />
          <p className="text-sm text-odc-text-muted-light">
            Utilisateur non authentifié
          </p>
        </Card>
      </div>
    );
  }

  // ------------------------------------------------------------------------
  //  Dashboard en chargement
  // ------------------------------------------------------------------------
  if (loading) {
    return <Loader fullScreen text="Chargement du tableau de bord..." />;
  }

  // ------------------------------------------------------------------------
  //  Erreur API
  // ------------------------------------------------------------------------
  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-12 animate-fade-in">
        <Card padding="lg" className="text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-odc-error/10 items-center justify-center mb-4">
            <AlertCircle size={28} className="text-odc-error" />
          </div>
          <h2 className="font-heading text-lg font-semibold mb-2">
            Impossible de charger le tableau de bord
          </h2>
          <p className="text-sm text-odc-text-muted-light mb-6">{error}</p>
          <Button
            variant="primary"
            icon={<RefreshCw size={16} />}
            onClick={() => refetch?.()}
          >
            Réessayer
          </Button>
        </Card>
      </div>
    );
  }

  // ------------------------------------------------------------------------
  //  Rôle inconnu
  // ------------------------------------------------------------------------
  if (!role || !DashboardComponent) {
    return (
      <div className="max-w-lg mx-auto mt-12 animate-fade-in">
        <Card padding="lg" className="text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-odc-warning/10 items-center justify-center mb-4">
            <LayoutDashboard size={28} className="text-odc-warning" />
          </div>
          <h2 className="font-heading text-lg font-semibold mb-2">
            Rôle non reconnu
          </h2>
          <p className="text-sm text-odc-text-muted-light">
            Votre rôle ({role ?? 'aucun'}) ne correspond à aucun dashboard.
          </p>
        </Card>
      </div>
    );
  }

  // ------------------------------------------------------------------------
  //  Rendu normal
  // ------------------------------------------------------------------------
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-odc-text-light dark:text-odc-text-dark mb-1">
            Bonjour, {user.prenom ?? 'Utilisateur'} 👋
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
            Voici un aperçu de votre activité sur la plateforme
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          icon={<RefreshCw size={14} />}
          onClick={() => refetch?.()}
        >
          Actualiser
        </Button>
      </div>

      {/* Dashboard par rôle */}
      <DashboardComponent data={data} loading={loading} />
    </div>
  );
}