// src/app/(public)/formations/[slug]/components/SessionList.tsx
'use client';

import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  Video,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { useSessionsByFormation } from '@/hooks/queries/useSessions';

interface SessionListProps {
  formationId: string;
}

const STATUT_CONFIG = {
  OUVERTE: {
    label: 'Inscriptions ouvertes',
    className: 'bg-odc-success-soft text-odc-success-dark',
  },
  PLANIFIEE: {
    label: 'Planifiée',
    className: 'bg-odc-info-soft text-odc-info-dark',
  },
  EN_COURS: {
    label: 'En cours',
    className: 'bg-odc-warning-soft text-odc-warning-dark',
  },
  TERMINEE: {
    label: 'Terminée',
    className: 'bg-odc-surface-alt text-odc-text-secondary',
  },
} as const;

export function SessionList({ formationId }: SessionListProps) {
  const { data: sessions = [], isLoading } = useSessionsByFormation(formationId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  const visibleSessions = sessions.filter(
    (s) => s.statut !== 'ANNULEE',
  );

  if (visibleSessions.length === 0) {
    return (
      <Card className="border-dashed p-6 text-center">
        <p className="text-sm text-odc-text-muted">
          Aucune session programmée pour le moment.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {visibleSessions.map((session) => {
        const config =
          STATUT_CONFIG[session.statut as keyof typeof STATUT_CONFIG] ??
          STATUT_CONFIG.PLANIFIEE;
        const placesRestantes = session.capacite - (session.inscriptionsCount ?? 0);
        const isFull = placesRestantes <= 0;
        const canRegister = session.statut === 'OUVERTE' && !isFull;

        return (
          <Card
            key={session.id}
            className={cn(
              'transition-all hover:shadow-odc-md',
              canRegister && 'border-odc-success/30',
            )}
          >
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Infos session */}
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-odc-text-primary">
                      {session.codeSession}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        config.className,
                      )}
                    >
                      {config.label}
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm text-odc-text-secondary">
                      <Calendar className="h-4 w-4 shrink-0 text-odc-primary" />
                      {formatDate(session.dateDebut)} →{' '}
                      {formatDate(session.dateFin)}
                    </div>

                    {session.lieu && (
                      <div className="flex items-center gap-2 text-sm text-odc-text-secondary">
                        <MapPin className="h-4 w-4 shrink-0 text-odc-primary" />
                        <span className="truncate">{session.lieu}</span>
                      </div>
                    )}

                    {session.lienVisio && (
                      <div className="flex items-center gap-2 text-sm text-odc-text-secondary">
                        <Video className="h-4 w-4 shrink-0 text-odc-info" />
                        <span>En ligne</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-odc-text-secondary">
                      <Users className="h-4 w-4 shrink-0 text-odc-primary" />
                      <span
                        className={cn(
                          isFull && 'font-semibold text-odc-error',
                        )}
                      >
                        {isFull
                          ? 'Complet'
                          : `${placesRestantes} place${placesRestantes > 1 ? 's' : ''} disponible${placesRestantes > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="shrink-0 sm:self-center">
                  {canRegister ? (
                    <Button variant="odc" asChild>
                      <Link
                        href={`/inscription-en-ligne?session=${session.id}`}
                      >
                        S&apos;inscrire
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : isFull ? (
                    <Badge
                      variant="outline"
                      className="border-odc-error/30 text-odc-error"
                    >
                      Complet
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-odc-text-muted">
                      Indisponible
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}