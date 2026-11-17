// src/app/(public)/components/UpcomingEvents.tsx
'use client';

import Link from 'next/link';
import {
  ArrowRight, CalendarDays, MapPin, Users, Clock,
  RefreshCw, AlertCircle, CalendarX,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSessionsPublic } from '@/hooks/queries/useSessions';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG STATUTS
   ═══════════════════════════════════════════════════════════════════════════ */

const STATUT_LABEL: Record<
  string,
  { label: string; className: string }
> = {
  OUVERTE: {
    label: 'Inscriptions ouvertes',
    className:
      'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
  },
  EN_COURS: {
    label: 'En cours',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  },
  PLANIFIEE: {
    label: 'Prochainement',
    className:
      'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  },
  TERMINEE: {
    label: 'Terminée',
    className:
      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function UpcomingEvents() {
  const { data, isLoading, isError, refetch, isFetching } =
    useSessionsPublic({ page: 1, limit: 3 });
  const sessions = data?.data ?? [];

  return (
    <section
      className="container-page py-20 md:py-28"
      aria-labelledby="events-title"
    >
      {/* En-tête */}
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-700 ring-1 ring-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:ring-orange-900">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            Agenda
          </span>
          <h2
            id="events-title"
            className="mb-3 font-display text-3xl font-bold text-foreground md:text-5xl"
          >
            Sessions à venir
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Retrouvez les sessions publiées et les places encore disponibles.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/sessions">
            Toutes les sessions
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      )}

      {/* Erreur */}
      {isError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-8 text-center">
            <AlertCircle
              className="mx-auto mb-3 h-10 w-10 text-destructive"
              aria-hidden
            />
            <p className="mb-4 text-sm font-medium text-destructive">
              Impossible de charger les sessions.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              {isFetching ? (
                <RefreshCw
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden
                />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
              )}
              Réessayer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Vide */}
      {!isLoading && !isError && sessions.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <CalendarX
              className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-40"
              aria-hidden
            />
            <p className="text-sm text-muted-foreground">
              Aucune session publiée pour le moment.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Grille */}
      {!isLoading && !isError && sessions.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session, index) => {
            const registered = session.inscriptionsCount ?? 0;
            const seatsLeft = Math.max(0, session.capacite - registered);
            const fillPercent =
              session.capacite > 0
                ? Math.min(100, (registered / session.capacite) * 100)
                : 0;
            const statut =
              STATUT_LABEL[session.statut] ?? STATUT_LABEL.PLANIFIEE;

            return (
              <Card
                key={session.id}
                className="group flex flex-col overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <CardContent className="flex h-full flex-col p-6">
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                      <CalendarDays className="h-5 w-5" aria-hidden />
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-semibold',
                        statut.className,
                      )}
                    >
                      {statut.label}
                    </span>
                  </div>

                  {/* Catégorie */}
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    {session.formation?.domaineRelation?.nom ||
                      session.formation?.domaine ||
                      'Formation'}
                  </p>

                  {/* Titre */}
                  <h3 className="mb-4 line-clamp-2 font-display text-lg font-bold text-foreground transition-colors group-hover:text-orange-600 dark:group-hover:text-orange-400">
                    {session.formation?.titre || session.codeSession}
                  </h3>

                  {/* Détails */}
                  <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <CalendarDays
                        className="h-4 w-4 shrink-0 text-orange-500"
                        aria-hidden
                      />
                      {formatDate(session.dateDebut)}
                      {session.dateFin !== session.dateDebut &&
                        ` — ${formatDate(session.dateFin)}`}
                    </p>
                    {session.lieu && (
                      <p className="flex items-center gap-2">
                        <MapPin
                          className="h-4 w-4 shrink-0 text-orange-500"
                          aria-hidden
                        />
                        <span className="truncate">{session.lieu}</span>
                      </p>
                    )}
                    {session.dureeMinutes && (
                      <p className="flex items-center gap-2">
                        <Clock
                          className="h-4 w-4 shrink-0 text-orange-500"
                          aria-hidden
                        />
                        {session.dureeMinutes} minutes
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <Users
                        className="h-4 w-4 shrink-0 text-orange-500"
                        aria-hidden
                      />
                      {seatsLeft > 0
                        ? `${seatsLeft} place${seatsLeft > 1 ? 's' : ''} disponible${seatsLeft > 1 ? 's' : ''}`
                        : 'Capacité atteinte'}
                    </p>
                  </div>

                  {/* Barre de remplissage */}
                  <div className="mb-5 space-y-1.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          fillPercent >= 90
                            ? 'bg-destructive'
                            : fillPercent >= 70
                              ? 'bg-amber-500'
                              : 'bg-green-500',
                        )}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                    <p className="text-right text-xs text-muted-foreground">
                      {registered} / {session.capacite} inscrits
                    </p>
                  </div>

                  {/* Bouton */}
                  <Button
                    variant="outline"
                    className="mt-auto w-full border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-900 dark:hover:bg-orange-950/40"
                    asChild
                  >
                    <Link href={`/sessions/${session.codeSession}`}>
                      Détails de la session
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}