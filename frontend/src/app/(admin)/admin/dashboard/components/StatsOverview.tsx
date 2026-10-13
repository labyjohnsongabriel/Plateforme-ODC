'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Users, BookOpen, Calendar, Award, TrendingUp, TrendingDown,
  Building2, FileCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AdminStats {
  kpis: {
    totalUsers: number;
    totalFormations: number;
    totalSessions: number;
    totalInscriptions: number;
    inscriptionsEnAttente: number;
    totalAttestations: number;
    tauxPresenceMoyen: number;
  };
  usersByRole: Array<{ role: string; count: number }>;
}

export function StatsOverview() {
  const { data, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const kpis = data?.kpis;

  const cards = [
    {
      label: 'Utilisateurs actifs',
      value: kpis?.totalUsers ?? 0,
      icon: Users,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
      trend: '+12%',
      positive: true,
    },
    {
      label: 'Formations',
      value: kpis?.totalFormations ?? 0,
      icon: BookOpen,
      color: 'bg-odc-primary-soft text-odc-primary',
      trend: '+5%',
      positive: true,
    },
    {
      label: 'Sessions',
      value: kpis?.totalSessions ?? 0,
      icon: Calendar,
      color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
      trend: '+8%',
      positive: true,
    },
    {
      label: 'Attestations',
      value: kpis?.totalAttestations ?? 0,
      icon: Award,
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
      trend: '+24%',
      positive: true,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card
            key={c.label}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={cn(
                    'w-11 h-11 rounded-lg flex items-center justify-center',
                    c.color,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    'text-xs font-medium flex items-center gap-1 px-2 py-0.5 rounded-full',
                    c.positive
                      ? 'text-odc-success bg-odc-success-bg'
                      : 'text-odc-error bg-odc-error-bg',
                  )}
                >
                  {c.positive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {c.trend}
                </span>
              </div>

              <p className="text-3xl font-display font-bold mb-1">
                {c.value.toLocaleString('fr-FR')}
              </p>
              <p className="text-sm text-odc-muted">{c.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}