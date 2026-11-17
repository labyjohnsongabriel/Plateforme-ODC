// src/app/(participant)/participant/dashboard/components/ProchainesSessions.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  ArrowRight,
  MapPin,
  Clock,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

/* ============================================================================
   TYPES
   ============================================================================ */

interface ParticipantInscription {
  id: string;
  statut: string;
  session?: {
    id?: string;
    dateDebut: string;
    dateFin?: string;
    lieu?: string | null;
    formation?: { titre: string } | null;
  } | null;
}

type UpcomingInscription = ParticipantInscription & {
  session: NonNullable<ParticipantInscription['session']>;
};

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function ProchainesSessions() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery<ParticipantInscription[]>({
    queryKey: ['participant', 'inscriptions', 'upcoming'],
    queryFn: async () => {
      const { data } = await api.get('/participant/inscriptions');
      const list = data?.data ?? [];
      return Array.isArray(list)
        ? list.filter((i) => i !== null && i !== undefined)
        : [];
    },
    staleTime: 60_000,
  });

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  /* ─── Erreur ─── */
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prochaines sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <QueryErrorState onRetry={() => void refetch()} isRetrying={isFetching} />
        </CardContent>
      </Card>
    );
  }

  /* ⭐ Filtrer les sessions à venir */
  const upcoming = (data ?? [])
    .filter(
      (i): i is UpcomingInscription =>
        i.statut === 'ACCEPTEE' &&
        i.session !== null &&
        i.session !== undefined &&
        new Date(i.session.dateDebut) > new Date(),
    )
    .sort(
      (a, b) =>
        new Date(a.session.dateDebut).getTime() -
        new Date(b.session.dateDebut).getTime(),
    )
    .slice(0, 4);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
            Prochaines sessions
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {upcoming.length > 0
              ? `${upcoming.length} session${upcoming.length > 1 ? 's' : ''} à venir`
              : 'Aucune session planifiée'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <Link href="/participant/inscriptions" className="group">
            Voir tout
            <ArrowRight
              className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
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
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/formations">
                  <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
                  Voir le catalogue
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {upcoming.map((i, index) => {
              const date = new Date(i.session.dateDebut);
              const isNext = index === 0;

              return (
                <Link
                  key={i.id}
                  href={`/participant/inscriptions`}
                  className={cn(
                    'group relative flex items-center gap-3 overflow-hidden rounded-xl border p-3.5 transition-all',
                    'border-border bg-card',
                    'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    isNext && 'ring-1 ring-primary/20',
                  )}
                >
                  {/* Barre accent gauche */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute bottom-3 left-0 top-3 w-0.5 rounded-r-full',
                      isNext ? 'bg-primary' : 'bg-border',
                    )}
                  />

                  {/* Date badge */}
                  <div
                    className={cn(
                      'flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl transition-transform group-hover:scale-105',
                      isNext
                        ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md'
                        : 'bg-primary/10 text-primary',
                    )}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wide opacity-90">
                      {date.toLocaleDateString('fr-FR', { month: 'short' })}
                    </span>
                    <span className="font-display text-lg font-bold leading-none">
                      {date.getDate()}
                    </span>
                  </div>

                  {/* Infos */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                        {i.session?.formation?.titre ?? 'Session'}
                      </p>
                      {isNext && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-primary">
                          Prochaine
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {date.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        {i.session?.lieu || 'En ligne'}
                      </span>
                    </div>
                  </div>

                  {/* Statut + flèche */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30 text-[11px] font-semibold">
                      <CheckCircle2 className="mr-1 h-2.5 w-2.5" aria-hidden="true" />
                      Acceptée
                    </Badge>
                    <ArrowRight
                      aria-hidden="true"
                      className={cn(
                        'h-4 w-4 text-muted-foreground opacity-0 transition-all',
                        'group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100',
                      )}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}