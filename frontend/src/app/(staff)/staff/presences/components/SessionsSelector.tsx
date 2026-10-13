'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, ArrowRight, QrCode } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';

export function SessionsSelector() {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['staff', 'sessions', 'for-presence'],
    queryFn: async () => {
      const { data } = await api.get('/staff/sessions', { params: { limit: 100 } });
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52" />)}
      </div>
    );
  }

  if (!sessions?.length) {
    return <Card><EmptyState icon={Calendar} title="Aucune session" /></Card>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((s: any) => (
        <Card key={s.id} className="hover:shadow-odc-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <Badge variant="outline" className="font-mono text-xs">{s.codeSession}</Badge>
              {s.presenceOuverte ? (
                <Badge className="bg-odc-success-bg text-odc-success text-xs">
                  <QrCode className="h-3 w-3 mr-1" /> Ouverte
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">Fermée</Badge>
              )}
            </div>

            <h3 className="font-display font-semibold mb-3 line-clamp-2 min-h-[3rem]">
              {s.formation?.titre}
            </h3>

            <div className="space-y-1.5 text-sm text-odc-muted mb-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(s.dateDebut)}
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {s.capacite} places
              </div>
            </div>

            <Button variant="odc" className="w-full" asChild>
              <Link href={`/staff/presences/${s.id}`}>
                Voir les présences <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}