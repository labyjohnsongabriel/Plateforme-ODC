import { BookOpen, Calendar, Users, Award, TrendingUp } from 'lucide-react';
import { StatCardGrid } from './StatCardGrid';
import { DoughnutChart } from '@/components/charts/DoughnutChart';
import { DashboardService } from '../services/dashboard.service';
import type { KPI, PartenaireDashboardData } from '../types/dashboard.types';

interface PartenaireDashboardProps {
  data: PartenaireDashboardData;
  loading?: boolean;
}

export function PartenaireDashboard({ data, loading }: PartenaireDashboardProps) {
  if (loading || !data) return null;

  const chiffres = data.chiffres || {};

  const statCards: KPI[] = [
    {
      label: 'Formations',
      value: chiffres.totalFormations || 0,
      icon: <BookOpen size={22} />,
      variant: 'primary',
    },
    {
      label: 'Sessions',
      value: chiffres.totalSessions || 0,
      icon: <Calendar size={22} />,
      variant: 'info',
    },
    {
      label: 'Participants',
      value: chiffres.totalParticipants || 0,
      icon: <Users size={22} />,
      variant: 'success',
    },
    {
      label: 'Attestations délivrées',
      value: chiffres.totalAttestations || 0,
      icon: <Award size={22} />,
      variant: 'warning',
    },
  ];

  const parDomaine = DashboardService.formatChartData(data.parDomaine || []);

  return (
    <div className="space-y-6 animate-fade-in">
      <StatCardGrid kpis={statCards} columns={4} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoughnutChart
          title="Répartition par domaine"
          description="Vue d'ensemble des formations"
          data={parDomaine}
          thickness={60}
        />
      </div>
    </div>
  );
}