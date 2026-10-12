'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar, Users, ArrowRight, QrCode, PlayCircle, CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

export function SessionsPresenceSelector() {
  const { data, isLoading } = useQuery({
    queryKey: ['formateur', 'sessions', 'presence'],
    queryFn: async () => {
      const { data } = await api.get('/formateur/sessions');
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56" />
        ))}
      </div>
    );
  }

  const sessions = (data ?? []).filter(
    (s: any) => ['OUVERTE', 'EN_COURS', 'PLANIFIEE'].includes(s.statut),
  );

  if (!sessions.length) {
    return (
      <Card>
        <EmptyState
          icon={QrCode}
          title="Aucune session active"
          description="Vous n'avez aucune session en cours ou à venir."
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((s: any) => (
        <Card
          key={s.id}
          className="overflow-hidden hover:shadow-odc-lg transition-all group"
        >
          <div className="h-2 bg-gradient-to-r from-odc-500 to-odc-700" />

          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <Badge variant="outline" className="font-mono text-xs">
                {s.codeSession}
              </Badge>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_COLORS[s.statut]}`}>
                {s.statut}
              </span>
            </div>

            <h3 className="font-display font-semibold mb-3 line-clamp-2 min-h-[3rem] group-hover:text-odc-primary transition-colors">
              {s.formation?.titre}
            </h3>

            <div className="space-y-2 text-sm text-odc-muted mb-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-odc-primary" />
                {formatDate(s.dateDebut)}
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-odc-primary" />
                {s.capacite} places
              </div>
              {s.presenceOuverte && (
                <Badge className="bg-odc-success-bg text-odc-success text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Présence ouverte
                </Badge>
              )}
            </div>

            <Button variant="odc" className="w-full" asChild>
              <Link href={`/formateur/presences/${s.id}`}>
                <PlayCircle className="h-4 w-4 mr-2" />
                Ouvrir la session
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}