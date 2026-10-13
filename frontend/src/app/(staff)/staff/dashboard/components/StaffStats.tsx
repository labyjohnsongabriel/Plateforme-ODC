'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Calendar, Clock, CheckCircle2, BookOpen, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export function StaffStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['staff', 'dashboard', 'stats'],
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
      label: 'Inscriptions en attente',
      value: data?.inscriptionsEnAttente ?? 0,
      icon: Clock,
      color: 'bg-odc-warning-bg text-odc-warning',
      href: '/staff/selections',
    },
    {
      label: 'Sessions actives',
      value: data?.sessionsActives ?? 0,
      icon: Calendar,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
      href: '/staff/sessions',
    },
    {
      label: 'Inscriptions du jour',
      value: data?.inscriptionsDuJour ?? 0,
      icon: Users,
      color: 'bg-odc-primary-soft text-odc-primary',
      href: '/staff/selections',
    },
    {
      label: 'Taux de présence',
      value: `${data?.tauxPresenceMoyen ?? 0}%`,
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
      href: '/staff/presences',
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
              <p className="text-3xl font-display font-bold mb-1">{c.value}</p>
              <p className="text-sm text-odc-muted">{c.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}