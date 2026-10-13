'use client';

import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export function SessionStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'sessions', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/sessions', { params: { limit: 1000 } });
      return data.data as any[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const sessions = data ?? [];
  const counts = {
    PLANIFIEE: sessions.filter((s) => s.statut === 'PLANIFIEE').length,
    OUVERTE: sessions.filter((s) => s.statut === 'OUVERTE').length,
    EN_COURS: sessions.filter((s) => s.statut === 'EN_COURS').length,
    TERMINEE: sessions.filter((s) => s.statut === 'TERMINEE').length,
  };

  const cards = [
    { label: 'Planifiées', value: counts.PLANIFIEE, icon: Calendar, color: 'text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400' },
    { label: 'Ouvertes', value: counts.OUVERTE, icon: CheckCircle2, color: 'text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-400' },
    { label: 'En cours', value: counts.EN_COURS, icon: Clock, color: 'text-odc-primary bg-odc-primary-soft' },
    { label: 'Terminées', value: counts.TERMINEE, icon: XCircle, color: 'text-odc-muted bg-odc-surface-alt' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center', c.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{c.value}</p>
                <p className="text-xs text-odc-muted">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}