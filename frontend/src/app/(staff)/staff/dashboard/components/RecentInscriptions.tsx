'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, UserPlus, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/formatters';

export function RecentInscriptions() {
  const { data, isLoading } = useQuery({
    queryKey: ['staff', 'recent-inscriptions'],
    queryFn: async () => {
      const { data } = await api.get('/staff/inscriptions', {
        params: { statut: 'EN_ATTENTE', limit: 5 },
      });
      return data.data;
    },
  });

  if (isLoading) return <Skeleton className="h-72" />;

  const inscriptions = data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Dernières inscriptions</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/staff/selections">
            Voir tout <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {inscriptions.length === 0 ? (
          <p className="text-sm text-odc-muted text-center py-8">
            Aucune inscription en attente
          </p>
        ) : (
          <ul className="space-y-3">
            {inscriptions.map((i: any) => (
              <li
                key={i.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-odc-surface-alt transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-odc-primary-soft flex items-center justify-center shrink-0">
                  <UserPlus className="h-4 w-4 text-odc-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {i.participant?.prenom} {i.participant?.nom}
                  </p>
                  <p className="text-xs text-odc-muted truncate">
                    {i.session?.formation?.titre}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="outline" className="text-xs">En attente</Badge>
                  <span className="text-xs text-odc-muted flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(i.dateInscription)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}