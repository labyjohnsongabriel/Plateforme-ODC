'use client';

import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowRight, CalendarX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useSessionsPublic } from '@/hooks/queries/useSessions';
import { formatDate } from '@/lib/formatters';

const STATUT_LABELS: Record<string, string> = {
  PLANIFIEE: 'Planifiée',
  OUVERTE: 'Inscriptions ouvertes',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
};

const STATUT_COLORS: Record<string, string> = {
  PLANIFIEE: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  OUVERTE: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  EN_COURS: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  TERMINEE: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  ANNULEE: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
};

export function SessionsList() {
  const { data, isLoading } = useSessionsPublic({ page: 1, limit: 20 });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  const sessions = data?.data ?? [];

  if (!sessions.length) {
    return (
      <EmptyState
        icon={CalendarX}
        title="Aucune session programmée"
        description="Les prochaines sessions seront publiées prochainement."
      />
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((s) => (
        <Card key={s.id} className="hover:shadow-odc-md transition-shadow">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="font-mono text-xs text-odc-muted">
                    {s.codeSession}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STATUT_COLORS[s.statut]
                    }`}
                  >
                    {STATUT_LABELS[s.statut]}
                  </span>
                </div>

                <h3 className="font-display font-semibold text-lg mb-2">
                  {s.formation?.titre ?? 'Formation'}
                </h3>

                <div className="flex flex-wrap gap-4 text-sm text-odc-muted">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-odc-primary" />
                    {formatDate(s.dateDebut)} → {formatDate(s.dateFin)}
                  </div>
                  {s.lieu && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-odc-primary" />
                      {s.lieu}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-odc-primary" />
                    {s.capacite} places
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2">
                <Button variant="odc" asChild>
                  <Link href={`/inscription-en-ligne?session=${s.id}`}>
                    S&apos;inscrire
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/sessions/${s.codeSession}`}>Détails</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}