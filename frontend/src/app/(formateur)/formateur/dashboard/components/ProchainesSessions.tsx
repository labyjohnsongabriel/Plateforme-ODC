'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ArrowRight, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';

const STATUT_COLORS: Record<string, string> = {
  PLANIFIEE: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  OUVERTE: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  EN_COURS: 'bg-odc-primary-soft text-odc-primary',
  TERMINEE: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export function ProchainesSessions() {
  const { data, isLoading } = useQuery({
    queryKey: ['formateur', 'sessions', 'upcoming'],
    queryFn: async () => {
      const { data } = await api.get('/formateur/sessions');
      return data.data;
    },
  });

  if (isLoading) return <Skeleton className="h-72" />;

  const upcoming = (data ?? [])
    .filter((s: any) => new Date(s.dateFin) >= new Date())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Prochaines sessions</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/formateur/sessions">
            Voir tout <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Aucune session à venir"
            description="Toutes vos sessions sont passées."
          />
        ) : (
          <div className="space-y-3">
            {upcoming.map((s: any) => (
              <Link
                key={s.id}
                href={`/formateur/sessions/${s.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-odc-border hover:border-odc-primary hover:bg-odc-primary-soft/30 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-odc-primary-soft flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] text-odc-primary font-medium uppercase">
                    {new Date(s.dateDebut).toLocaleDateString('fr-FR', { month: 'short' })}
                  </span>
                  <span className="font-display font-bold text-odc-primary">
                    {new Date(s.dateDebut).getDate()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {s.formation?.titre}
                  </p>
                  <p className="text-xs text-odc-muted flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {s.lieu || 'En ligne'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {s.capacite} places
                    </span>
                  </p>
                </div>
                <Badge className={`${STATUT_COLORS[s.statut]} text-xs shrink-0`}>
                  {s.statut}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}