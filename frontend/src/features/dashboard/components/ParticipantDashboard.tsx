import { BookOpen, Award, Clock, TrendingUp, CheckCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCardGrid } from './StatCardGrid';
import { UpcomingSessions } from './UpcomingSessions';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import type { KPI, ParticipantDashboardData } from '../types/dashboard.types';

interface ParticipantDashboardProps {
  data: ParticipantDashboardData;
  loading?: boolean;
}

export function ParticipantDashboard({ data, loading }: ParticipantDashboardProps) {
  if (loading || !data) return null;

  const statCards: KPI[] = [
    {
      label: 'Formations totales',
      value: data.totalInscriptions || 0,
      icon: <BookOpen size={22} />,
      variant: 'primary',
    },
    {
      label: 'En cours',
      value: data.formationsEnCours || 0,
      icon: <Clock size={22} />,
      variant: 'warning',
    },
    {
      label: 'Terminées',
      value: data.formationsTerminees || 0,
      icon: <CheckCircle size={22} />,
      variant: 'success',
    },
    {
      label: 'Attestations',
      value: data.attestationsObtenues || 0,
      icon: <Award size={22} />,
      variant: 'info',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <Card className="bg-gradient-to-br from-odc-primary to-odc-primary-dark border-0 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Sparkles size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading text-2xl font-bold mb-1">Continuez votre progression 🚀</h2>
            <p className="text-white/90 text-sm">
              Vous avez <strong>{data.formationsEnCours || 0} formation(s)</strong> en cours. Ne lâchez rien !
            </p>
          </div>
          <Link to="/formations">
            <Button variant="secondary" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              Découvrir les formations
            </Button>
          </Link>
        </div>
      </Card>

      <StatCardGrid kpis={statCards} columns={4} />

      <UpcomingSessions sessions={data.prochainesSessions || []} title="Mes prochaines sessions" />
    </div>
  );
}