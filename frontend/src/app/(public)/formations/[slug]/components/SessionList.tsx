'use client';

import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSessionsByFormation } from '@/hooks/queries/useSessions';
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

interface Props {
  formationId: string;
}

export function SessionList({ formationId }: Props) {
  const { data: sessions = [], isLoading } = useSessionsByFormation(formationId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 text-odc-muted mx-auto mb-4" />
          <p className="font-medium mb-2">Aucune session programmée</p>
          <p className="text-sm text-odc-muted">
            Revenez bientôt pour découvrir les prochaines sessions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <Card key={session.id} className="hover:shadow-odc-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-mono text-xs text-odc-muted mb-1">
                  {session.codeSession}
                </p>
                <h4 className="font-display font-semibold text-lg">
                  {session.lieu || 'En ligne'}
                </h4>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                  STATUT_COLORS[session.statut]
                }`}
              >
                {STATUT_LABELS[session.statut]}
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-odc-primary shrink-0" />
                <span>{formatDate(session.dateDebut)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-odc-primary shrink-0" />
                <span className="truncate">{session.lieu || 'En ligne'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-odc-primary shrink-0" />
                <span>{session.capacite} places</span>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Button
                variant="odc"
                size="sm"
                disabled={session.statut === 'TERMINEE' || session.statut === 'ANNULEE'}
                asChild={
                  session.statut !== 'TERMINEE' && session.statut !== 'ANNULEE'
                }
              >
                {session.statut === 'TERMINEE' || session.statut === 'ANNULEE' ? (
                  <span>{STATUT_LABELS[session.statut]}</span>
                ) : (
                  <Link href={`/inscription-en-ligne?session=${session.id}`}>
                    S&apos;inscrire
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}