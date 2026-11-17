// src/app/(public)/formations/[slug]/components/SessionList.tsx
'use client';

import Link from 'next/link';
import {
  Calendar, MapPin, Users, Clock, ArrowRight, Video, AlertCircle,
  Sparkles, CheckCircle2, XCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDate, formatDuration } from '@/lib/formatters';
import { useSessionsByFormation } from '@/hooks/queries/useSessions';
import { useInscriptionModal } from '@/components/inscription/InscriptionModalProvider';

/* ═══════════════════════════════════════════════════════════════════════════
   PROPS
   ═══════════════════════════════════════════════════════════════════════════ */

interface SessionListProps {
  formationId: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG STATUTS
   ═══════════════════════════════════════════════════════════════════════════ */

const STATUT_CONFIG = {
  OUVERTE: {
    label: 'Inscriptions ouvertes',
    className:
      'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
    icon: CheckCircle2,
  },
  PLANIFIEE: {
    label: 'Planifiée',
    className:
      'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    icon: Clock,
  },
  EN_COURS: {
    label: 'En cours',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    icon: Clock,
  },
  TERMINEE: {
    label: 'Terminée',
    className:
      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    icon: XCircle,
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function SessionList({ formationId }: SessionListProps) {
  const { data: sessions = [], isLoading } = useSessionsByFormation(formationId);
  const { open: openInscriptionModal } = useInscriptionModal();

  /* ═══════ Loading ═══════ */
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  /* ═══════ Filtrage ═══════ */
  const visibleSessions = sessions.filter((s) => s.statut !== 'ANNULEE');

  /* ═══════ Vide ═══════ */
  if (visibleSessions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/40">
            <Calendar className="h-8 w-8 text-orange-500" aria-hidden />
          </div>
          <p className="font-display text-lg font-semibold text-foreground">
            Aucune session programmée
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Revenez bientôt pour consulter les prochaines dates.
          </p>
        </CardContent>
      </Card>
    );
  }

  /* ═══════ Tri : OUVERTE en premier, puis par date ═══════ */
  const sorted = [...visibleSessions].sort((a, b) => {
    const order = { OUVERTE: 0, PLANIFIEE: 1, EN_COURS: 2, TERMINEE: 3 };
    const oa = order[a.statut as keyof typeof order] ?? 99;
    const ob = order[b.statut as keyof typeof order] ?? 99;
    if (oa !== ob) return oa - ob;
    return new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime();
  });

  /* ═══════ Rendu ═══════ */
  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Sessions disponibles
          </h3>
          <p className="text-sm text-muted-foreground">
            {visibleSessions.length} session{visibleSessions.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          <Sparkles className="mr-1 h-3 w-3 text-orange-500" aria-hidden />
          {sorted.filter((s) => s.statut === 'OUVERTE').length} ouverte
          {sorted.filter((s) => s.statut === 'OUVERTE').length > 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Liste */}
      {sorted.map((session, index) => {
        const config =
          STATUT_CONFIG[session.statut as keyof typeof STATUT_CONFIG] ??
          STATUT_CONFIG.PLANIFIEE;
        const StatusIcon = config.icon;
        const restantes = session.capacite - (session.inscriptionsCount ?? 0);
        const isFull = restantes <= 0;
        const canRegister = session.statut === 'OUVERTE' && !isFull;
        const fillPercent =
          session.capacite > 0
            ? Math.min(
                100,
                ((session.inscriptionsCount ?? 0) / session.capacite) * 100,
              )
            : 0;

        return (
          <Card
            key={session.id}
            className={cn(
              'group overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg animate-fade-in',
              canRegister &&
                'border-green-300 ring-2 ring-green-500/20 dark:border-green-900',
            )}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* ═══════ Infos ═══════ */}
                <div className="min-w-0 flex-1 space-y-3">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                      {session.codeSession}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        config.className,
                      )}
                    >
                      <StatusIcon className="h-3 w-3" aria-hidden />
                      {config.label}
                    </span>
                    {isFull && session.statut === 'OUVERTE' && (
                      <Badge
                        variant="outline"
                        className="border-destructive/30 text-xs text-destructive"
                      >
                        <AlertCircle className="mr-1 h-3 w-3" aria-hidden />
                        Complet
                      </Badge>
                    )}
                  </div>

                  {/* Détails */}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar
                        className="h-4 w-4 shrink-0 text-orange-500"
                        aria-hidden
                      />
                      <span>
                        {formatDate(session.dateDebut)} →{' '}
                        {formatDate(session.dateFin)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock
                        className="h-4 w-4 shrink-0 text-orange-500"
                        aria-hidden
                      />
                      <span>
                        {formatDuration(session.dateDebut, session.dateFin)}
                      </span>
                    </div>
                    {session.lieu && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin
                          className="h-4 w-4 shrink-0 text-orange-500"
                          aria-hidden
                        />
                        <span className="truncate">{session.lieu}</span>
                      </div>
                    )}
                    {session.lienVisio && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Video
                          className="h-4 w-4 shrink-0 text-blue-500"
                          aria-hidden
                        />
                        <span>En ligne</span>
                      </div>
                    )}
                  </div>

                  {/* Barre de remplissage */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" aria-hidden />
                        {isFull
                          ? 'Complet'
                          : `${restantes} place${restantes > 1 ? 's' : ''} sur ${session.capacite}`}
                      </span>
                      <span
                        className={cn(
                          'font-semibold tabular-nums',
                          isFull
                            ? 'text-destructive'
                            : fillPercent >= 70
                              ? 'text-amber-600'
                              : 'text-green-600',
                        )}
                      >
                        {Math.round(fillPercent)}%
                      </span>
                    </div>
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
                  </div>
                </div>

                {/* ═══════ Action ═══════ */}
                <div className="shrink-0 sm:self-center">
                  {canRegister ? (
                    <Button
                      onClick={() =>
                        openInscriptionModal({
                          sessionId: session.id,
                        })
                      }
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 sm:w-auto"
                    >
                      S&apos;inscrire
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                    </Button>
                  ) : isFull ? (
                    <Button variant="outline" disabled>
                      Complet
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      {config.label}
                    </Button>
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