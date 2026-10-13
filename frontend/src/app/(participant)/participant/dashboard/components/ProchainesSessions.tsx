'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ArrowRight, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';

export function ProchainesSessions() {
  const { data, isLoading } = useQuery({
    queryKey: ['participant', 'inscriptions', 'upcoming'],
    queryFn: async () => {
      const { data } = await api.get('/participant/inscriptions');
      return data.data;
    },
  });

  if (isLoading) return <Skeleton className="h-80" />;

  const upcoming = (data ?? [])
    .filter(
      (i: any) =>
        i.statut === 'ACCEPTEE' && new Date(i.session?.dateDebut) > new Date(),
    )
    .slice(0, 4);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Prochaines sessions</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/participant/inscriptions">
            Voir tout <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Aucune session à venir"
            description="Inscrivez-vous à une formation pour commencer."
            action={
              <Button variant="odc" asChild>
                <Link href="/formations">Voir le catalogue</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {upcoming.map((i: any) => (
              <Link
                key={i.id}
                href={`/participant/inscriptions`}
                className="flex items-center gap-3 p-3 rounded-lg border border-odc-border hover:border-odc-primary hover:bg-odc-primary-soft/30 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-odc-primary-soft flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] text-odc-primary font-medium uppercase">
                    {new Date(i.session.dateDebut).toLocaleDateString('fr-FR', { month: 'short' })}
                  </span>
                  <span className="font-display font-bold text-odc-primary">
                    {new Date(i.session.dateDebut).getDate()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {i.session?.formation?.titre}
                  </p>
                  <p className="text-xs text-odc-muted flex items-center gap-1.5 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {i.session?.lieu || 'En ligne'}
                  </p>
                </div>
                <Badge className="bg-odc-success-bg text-odc-success text-xs shrink-0">
                  Acceptée
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}