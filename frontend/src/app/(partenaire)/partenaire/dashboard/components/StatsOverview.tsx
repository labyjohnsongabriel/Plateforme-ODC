'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, Calendar, Users, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export function StatsOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['partenaire', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/me');
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

  const cards = [
    {
      label: 'Formations publiées',
      value: data?.formationsPubliees ?? data?.chiffres?.totalFormations ?? 0,
      subtitle: 'Catalogue actif',
      icon: BookOpen,
      color: 'bg-odc-primary-soft text-odc-primary',
    },
    {
      label: 'Sessions publiques',
      value: data?.sessionsPubliques ?? data?.chiffres?.totalSessions ?? 0,
      subtitle: 'En cours ou à venir',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    },
    {
      label: 'Participants formés',
      value: data?.chiffres?.totalParticipants ?? 0,
      subtitle: 'Total ODC',
      icon: Users,
      color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
    },
    {
      label: 'Attestations émises',
      value: data?.chiffres?.totalAttestations ?? 0,
      subtitle: 'Diplômés',
      icon: Award,
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card
            key={c.label}
            className="animate-fade-in hover:shadow-odc-md transition-shadow"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CardContent className="p-5">
              <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center mb-3', c.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-3xl font-display font-bold mb-0.5">{c.value}</p>
              <p className="text-sm font-medium">{c.label}</p>
              <p className="text-xs text-odc-muted mt-0.5">{c.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}