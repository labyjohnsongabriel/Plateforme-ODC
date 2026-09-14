import { Users, BookOpen, Calendar, Award, Clock, TrendingUp, FileText } from 'lucide-react';
import { StatCardGrid } from './StatCardGrid';
import { RecentActivity } from './RecentActivity';
import { TopFormations } from './TopFormations';
import { LineChart } from '@/components/charts/LineChart';
import { DoughnutChart } from '@/components/charts/DoughnutChart';
import { DashboardService } from '../services/dashboard.service';
import type { KPI, AdminDashboardData } from '../types/dashboard.types';

interface AdminDashboardProps {
  data: AdminDashboardData;
  loading?: boolean;
}

export function AdminDashboard({ data, loading }: AdminDashboardProps) {
  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const kpis = data.kpis || {};

  const statCards: KPI[] = [
    {
      label: 'Utilisateurs',
      value: kpis.totalUsers || 0,
      icon: <Users size={22} />,
      variant: 'primary',
      trend: { value: 12, isPositive: true },
    },
    {
      label: 'Formations',
      value: kpis.totalFormations || 0,
      icon: <BookOpen size={22} />,
      variant: 'info',
      trend: { value: 8, isPositive: true },
    },
    {
      label: 'Sessions',
      value: kpis.totalSessions || 0,
      icon: <Calendar size={22} />,
      variant: 'warning',
      subtitle: `${kpis.sessionsEnCours || 0} en cours`,
    },
    {
      label: 'Attestations',
      value: kpis.totalAttestations || 0,
      icon: <Award size={22} />,
      variant: 'success',
      trend: { value: 15, isPositive: true },
    },
    {
      label: 'Inscriptions',
      value: kpis.totalInscriptions || 0,
      icon: <TrendingUp size={22} />,
      variant: 'purple',
    },
    {
      label: 'En attente',
      value: kpis.inscriptionsEnAttente || 0,
      icon: <Clock size={22} />,
      variant: 'error',
      subtitle: 'À traiter',
    },
  ];

  const usersByRole = DashboardService.formatChartData(data.usersByRole || []);
  const inscriptionsParMois = (data.inscriptionsParMois || []).map((item: any) => ({
    name: item.mois,
    inscriptions: Number(item.count),
  }));
  const topFormations = (data.topFormations || []).map((item: any) => ({
    titre: item.titre,
    inscriptions: item.inscriptions,
  }));
  const activities = DashboardService.generateRecentActivities();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPIs */}
      <StatCardGrid kpis={statCards} columns={3} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          title="Évolution des inscriptions"
          description="12 derniers mois"
          data={inscriptionsParMois}
          series={[
            { dataKey: 'inscriptions', name: 'Inscriptions', color: '#FF7900' },
          ]}
          xAxisKey="name"
        />

        <DoughnutChart
          title="Répartition des utilisateurs"
          description="Par rôle"
          data={usersByRole}
          thickness={60}
        />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopFormations formations={topFormations} title="Top 5 formations" />
        <div className="lg:col-span-2">
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  );
}