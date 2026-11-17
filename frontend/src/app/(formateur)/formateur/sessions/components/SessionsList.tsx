// src/app/(formateur)/formateur/sessions/components/SessionsList.tsx
'use client';

import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Session {
  id: string;
  dateDebut: string;
  statut: string;
  lieu?: string | null;
  capacite: number;
  inscriptionsCount?: number;
  formation?: { titre: string } | null;
}

const STATUT_STYLES: Record<string, { label: string; className: string; dot: string }> = {
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

export function SessionsList({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar
          className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-foreground">Aucune session</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Vos sessions apparaîtront ici
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sessions.map((s) => {
        const statut = STATUT_STYLES[s.statut] ?? STATUT_STYLES.PLANIFIEE;
        const date = new Date(s.dateDebut);
        const inscrits = s.inscriptionsCount ?? 0;
        const ratio = s.capacite > 0 ? inscrits / s.capacite : 0;

        return (
          <Link
            key={s.id}
            href={`/formateur/sessions/${s.id}`}
            className={cn(
              'group flex flex-col overflow-hidden rounded-xl border p-4 transition-all',
              'border-border bg-card',
              'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          >
            {/* Header : date + statut */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-[9px] font-semibold uppercase leading-none">
                    {date.toLocaleDateString('fr-FR', { month: 'short' })}
                  </span>
                  <span className="text-sm font-bold leading-none">
                    {date.getDate()}
                  </span>
                </div>
                <div>
                  <p className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary">
                    {s.formation?.titre ?? 'Session'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {date.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1',
                  statut.className,
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', statut.dot)} />
                {statut.label}
              </span>
            </div>

            {/* Meta */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
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

            {/* Barre de remplissage */}
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
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

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
              <span className="text-[11px] text-muted-foreground">
                Voir les détails
              </span>
              <ArrowRight
                className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}