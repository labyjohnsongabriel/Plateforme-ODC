import { ClipboardList, Calendar, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCardGrid } from './StatCardGrid';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import type { KPI, StaffDashboardData } from '../types/dashboard.types';

interface StaffDashboardProps {
  data: StaffDashboardData;
  loading?: boolean;
}

export function StaffDashboard({ data, loading }: StaffDashboardProps) {
  if (loading || !data) return null;

  const statCards: KPI[] = [
    {
      label: 'Inscriptions en attente',
      value: data.inscriptionsEnAttente || 0,
      icon: <ClipboardList size={22} />,
      variant: 'warning',
      subtitle: 'À traiter',
    },
    {
      label: 'Sessions actives',
      value: data.sessionsActives || 0,
      icon: <Calendar size={22} />,
      variant: 'primary',
    },
    {
      label: 'Inscriptions du jour',
      value: data.inscriptionsDuJour || 0,
      icon: <TrendingUp size={22} />,
      variant: 'success',
    },
    {
      label: 'Taux de présence',
      value: `${data.tauxPresenceMoyen || 0}%`,
      icon: <CheckCircle size={22} />,
      variant: 'info',
    },
  ];

  const quickActions = [
    { label: 'Traiter les inscriptions', icon: ClipboardList, to: '/inscriptions' },
    { label: 'Gérer les sessions', icon: Calendar, to: '/sessions' },
    { label: 'Valider les présences', icon: CheckCircle, to: '/presences' },
    { label: 'Générer attestations', icon: TrendingUp, to: '/attestations' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <StatCardGrid kpis={statCards} columns={4} />

      <Card>
        <h3 className="font-heading font-semibold text-lg mb-4 text-odc-text-light dark:text-odc-text-dark">
          Actions rapides
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.to} to={action.to}>
                <Button
                  variant="outline"
                  fullWidth
                  icon={<Icon size={16} />}
                  iconRight={<ArrowRight size={14} />}
                >
                  {action.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}