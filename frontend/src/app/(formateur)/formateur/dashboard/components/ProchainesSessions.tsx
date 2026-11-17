// src/app/(formateur)/formateur/dashboard/components/ProchainesSessions.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  ArrowRight,
  MapPin,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { dashboardApi } from '@/lib/dashboard.api';
import { cn } from '@/lib/utils';

interface TrainerSession {
  id: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  lieu?: string | null;
  capacite: number;
  inscriptionsCount?: number;
  formation?: { titre: string } | null;
}

const STATUT_STYLES: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  PLANIFIEE: {
    label: 'Planifiée',
    className:
      'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30',
    dot: 'bg-sky-500',
  },
  OUVERTE: {
    label: 'Ouverte',
    className:
      'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  EN_COURS: {
    label: 'En cours',
    className:
      'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
    dot: 'bg-amber-500',
  },
  TERMINEE: {
    label: 'Terminée',
    className: 'bg-muted text-muted-foreground ring-border',
    dot: 'bg-muted-foreground',
  },
  ANNULEE: {
    label: 'Annulée',
    className:
      'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30',
    dot: 'bg-red-500',
  },
};

export function ProchainesSessions() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery<TrainerSession[]>({
    queryKey: ['formateur', 'sessions', 'upcoming'],
    queryFn: () => dashboardApi.getMySessions<TrainerSession>(),
  });

  /* 🔍 DIAGNOSTIC */
  // console.log('🔍 Sessions:', data);

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

  const now = new Date();
  const upcoming = (data ?? [])
    .filter((s) => new Date(s.dateDebut) > now)
    .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())
    .slice(0, 5);

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
          <Link href="/formateur/sessions" className="group">
            Voir tout
            <ArrowRight
              aria-hidden="true"
              className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Aucune session à venir"
            description="Toutes vos sessions sont passées. Planifiez-en une nouvelle !"
          />
        ) : (
          <div className="space-y-2.5">
            {upcoming.map((s, index) => {
              const statut = STATUT_STYLES[s.statut] ?? STATUT_STYLES.PLANIFIEE;
              const date = new Date(s.dateDebut);
              const isFirst = index === 0;
              const inscrits = s.inscriptionsCount ?? 0;
              const ratio = s.capacite > 0 ? inscrits / s.capacite : 0;

              return (
                <Link
                  key={s.id}
                  href={`/formateur/sessions/${s.id}`}
                  className={cn(
                    'group relative flex items-center gap-3 overflow-hidden rounded-xl border p-3.5 transition-all',
                    'border-border bg-card',
                    'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    isFirst && 'ring-1 ring-primary/20',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute bottom-3 left-0 top-3 w-0.5 rounded-r-full',
                      isFirst ? 'bg-primary' : 'bg-border',
                    )}
                  />

                  <div className="flex shrink-0 flex-col items-center gap-1">
                    <div
                      className={cn(
                        'flex h-14 w-14 flex-col items-center justify-center rounded-xl transition-transform group-hover:scale-105',
                        isFirst
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
                    <div className="h-1 w-14 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          'h-full transition-all',
                          ratio >= 1
                            ? 'bg-destructive'
                            : ratio >= 0.8
                              ? 'bg-amber-500'
                              : 'bg-emerald-500',
                        )}
                        style={{ width: `${Math.min(100, ratio * 100)}%` }}
                        role="progressbar"
                        aria-valuenow={inscrits}
                        aria-valuemin={0}
                        aria-valuemax={s.capacite}
                        aria-label={`${inscrits} participants sur ${s.capacite}`}
                      />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                        {s.formation?.titre ?? 'Session'}
                      </p>
                      {isFirst && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-primary">
                          <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
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
                        {s.lieu || 'En ligne'}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 tabular-nums',
                          ratio >= 1
                            ? 'font-medium text-destructive'
                            : ratio >= 0.8
                              ? 'font-medium text-amber-600 dark:text-amber-400'
                              : '',
                        )}
                      >
                        <Users className="h-3 w-3" aria-hidden="true" />
                        {inscrits} / {s.capacite}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1',
                        statut.className,
                      )}
                    >
                      <span className={cn('h-1.5 w-1.5 rounded-full', statut.dot)} />
                      <span className="hidden sm:inline">{statut.label}</span>
                    </span>
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