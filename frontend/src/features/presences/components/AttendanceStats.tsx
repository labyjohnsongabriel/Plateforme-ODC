import { UserCheck, UserX, TrendingUp, Award, Clock } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { StatCard } from '@/components/charts/StatCard';
import { ProgressBar } from '@/components/common/ProgressBar';
import { DoughnutChart } from '@/components/charts/DoughnutChart';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { usePresences } from '../hooks/usePresences';

interface AttendanceStatsProps {
  sessionId: string;
}

export function AttendanceStats({ sessionId }: AttendanceStatsProps) {
  const { stats, attendances, presences, loading } = usePresences(sessionId);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  // Top participants
  const topParticipants = [...attendances]
    .sort((a, b) => b.tauxPresence - a.tauxPresence)
    .slice(0, 5);

  // Charts data
  const presenceChartData = [
    { name: 'Présents', value: stats.presents, color: '#2E7D32' },
    { name: 'Absents', value: stats.absents, color: '#C62828' },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total enregistrements"
          value={stats.total}
          icon={<Clock size={22} />}
          variant="primary"
        />
        <StatCard
          label="Présents"
          value={stats.presents}
          icon={<UserCheck size={22} />}
          variant="success"
        />
        <StatCard
          label="Absents"
          value={stats.absents}
          icon={<UserX size={22} />}
          variant="error"
        />
        <StatCard
          label="Taux de présence"
          value={`${stats.tauxPresence}%`}
          icon={<TrendingUp size={22} />}
          variant="info"
          trend={{
            value: 5,
            isPositive: stats.tauxPresence >= 75,
          }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoughnutChart
          title="Répartition présence / absence"
          data={presenceChartData}
          thickness={60}
        />

        {/* Top participants */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-odc-primary" />
            <h3 className="font-heading font-semibold text-lg text-odc-text-light dark:text-odc-text-dark">
              Meilleurs participants
            </h3>
          </div>

          <div className="space-y-3">
            {topParticipants.length === 0 ? (
              <p className="text-center text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark py-4">
                Aucune donnée
              </p>
            ) : (
              topParticipants.map((p, i) => (
                <div key={p.participantId} className="flex items-center gap-3">
                  {/* Rang */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0
                        ? 'bg-odc-primary text-white'
                        : i === 1
                        ? 'bg-odc-primary-soft text-odc-primary-dark'
                        : i === 2
                        ? 'bg-odc-info-bg text-odc-info'
                        : 'bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark text-odc-text-muted-light'
                    }`}
                  >
                    {i + 1}
                  </div>

                  <Avatar src={p.photoUrl} name={p.participantName} size="sm" />

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-odc-text-light dark:text-odc-text-dark truncate">
                      {p.participantName}
                    </div>
                    <ProgressBar
                      value={p.tauxPresence}
                      size="sm"
                      variant={
                        p.tauxPresence >= 75
                          ? 'success'
                          : p.tauxPresence >= 50
                          ? 'warning'
                          : 'error'
                      }
                    />
                  </div>

                  <Badge
                    variant={
                      p.tauxPresence >= 75
                        ? 'success'
                        : p.tauxPresence >= 50
                        ? 'warning'
                        : 'error'
                    }
                    size="sm"
                  >
                    {p.tauxPresence}%
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}