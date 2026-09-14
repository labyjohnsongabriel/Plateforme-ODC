import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import { StatCardGrid } from './StatCardGrid';
import { UpcomingSessions } from './UpcomingSessions';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import type { KPI, FormateurDashboardData } from '../types/dashboard.types';

interface FormateurDashboardProps {
  data: FormateurDashboardData;
  loading?: boolean;
}

export function FormateurDashboard({ data, loading }: FormateurDashboardProps) {
  if (loading || !data) return null;

  const statCards: KPI[] = [
    {
      label: 'Total sessions',
      value: data.totalSessions || 0,
      icon: <Calendar size={22} />,
      variant: 'primary',
    },
    {
      label: 'Sessions en cours',
      value: data.sessionsEnCours || 0,
      icon: <Clock size={22} />,
      variant: 'warning',
    },
    {
      label: 'Total participants',
      value: data.totalParticipants || 0,
      icon: <Users size={22} />,
      variant: 'success',
    },
    {
      label: 'Formations animées',
      value: data.totalSessions || 0,
      icon: <TrendingUp size={22} />,
      variant: 'info',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <StatCardGrid kpis={statCards} columns={4} />

      <UpcomingSessions sessions={data.prochainesSessions || []} title="Mes prochaines sessions" />
    </div>
  );
}