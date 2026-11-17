// src/app/(staff)/staff/selections/components/SessionsSelector.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Users,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlayCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface StaffSession {
  id: string;
  codeSession: string;
  dateDebut: string;
  dateFin?: string;
  lieu?: string | null;
  capacite: number;
  statut: string;
  inscriptionsCount?: number;
  formation?: { titre: string } | null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATUTS
   ═══════════════════════════════════════════════════════════════════════════ */

const STATUT_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    className: string;
    dot: string;
    selectable: boolean;
  }
> = {
  PLANIFIEE: {
    label: 'Planifiée',
    icon: Clock,
    className:
      'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30',
    dot: 'bg-sky-500',
    selectable: true,
  },
  OUVERTE: {
    label: 'Ouverte',
    icon: CheckCircle2,
    className:
      'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
    dot: 'bg-emerald-500',
    selectable: true,
  },
  EN_COURS: {
    label: 'En cours',
    icon: PlayCircle,
    className:
      'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
    dot: 'bg-amber-500',
    selectable: true,
  },
  TERMINEE: {
    label: 'Terminée',
    icon: CheckCircle2,
    className:
      'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400',
    selectable: false,
  },
  ANNULEE: {
    label: 'Annulée',
    icon: XCircle,
    className:
      'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30',
    dot: 'bg-red-500',
    selectable: false,
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER
   ═══════════════════════════════════════════════════════════════════════════ */

function extractSessions(data: unknown): StaffSession[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as StaffSession[];
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['sessions', 'data', 'items', 'results']) {
      const arr = obj[key];
      if (Array.isArray(arr)) return arr as StaffSession[];
    }
  }
  return [];
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function SessionsSelector() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery<StaffSession[]>({
    queryKey: ['staff', 'sessions', 'for-selection'],
    queryFn: async () => {
      const response = await api.get('/staff/sessions', { params: { limit: 100 } });
      const root = response.data?.data ?? response.data;
      return extractSessions(root);
    },
    staleTime: 30_000,
  });

  /* ── Loading ────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
          >
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  /* ── Erreur ─────────────────────────────────────────── */
  if (isError) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardContent className="p-6">
          <QueryErrorState onRetry={() => void refetch()} isRetrying={isFetching} />
        </CardContent>
      </Card>
    );
  }

  /* ── Tri : sélectionnables d'abord, puis par date ──── */
  const sessions = (data ?? []).slice().sort((a, b) => {
    const aSelectable = STATUT_CONFIG[a.statut]?.selectable ? 1 : 0;
    const bSelectable = STATUT_CONFIG[b.statut]?.selectable ? 1 : 0;
    if (aSelectable !== bSelectable) return bSelectable - aSelectable;
    return new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime();
  });

  /* ── Vide ───────────────────────────────────────────── */
  if (sessions.length === 0) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardContent className="p-6">
          <EmptyState
            icon={Calendar}
            title="Aucune session"
            description="Créez une session pour commencer les sélections."
          />
        </CardContent>
      </Card>
    );
  }

  /* ── Rendu ──────────────────────────────────────────── */
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((s) => {
        const config =
          STATUT_CONFIG[s.statut] ?? {
            label: s.statut,
            icon: AlertCircle,
            className:
              'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
            dot: 'bg-slate-400',
            selectable: false,
          };
        const StatusIcon = config.icon;
        const isSelectable = config.selectable;

        return (
          <Card
            key={s.id}
            className={cn(
              'group flex h-full flex-col overflow-hidden transition-all duration-300',
              'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950',
              isSelectable
                ? 'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:hover:border-slate-700'
                : 'opacity-75',
            )}
          >
            <CardContent className="flex flex-1 flex-col p-5">
              {/* Header : code + statut */}
              <div className="mb-3 flex items-start justify-between gap-2">
                <Badge
                  variant="outline"
                  className="border-slate-200 font-mono text-[11px] tracking-wide text-slate-700 dark:border-slate-700 dark:text-slate-300"
                >
                  {s.codeSession}
                </Badge>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    config.className,
                  )}
                >
                  <StatusIcon className="h-3 w-3" aria-hidden />
                  {config.label}
                </span>
              </div>

              {/* Titre */}
              <h3 className="mb-3 line-clamp-2 min-h-[3rem] font-display font-semibold text-slate-900 transition-colors group-hover:text-slate-900 dark:text-slate-50 dark:group-hover:text-slate-50">
                {s.formation?.titre ?? 'Session de formation'}
              </h3>

              {/* Meta */}
              <div className="mb-4 space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar
                    className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500"
                    aria-hidden
                  />
                  <span className="truncate">{formatDate(s.dateDebut)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users
                    className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500"
                    aria-hidden
                  />
                  <span className="tabular-nums">
                    {s.inscriptionsCount != null
                      ? `${s.inscriptionsCount} / ${s.capacite}`
                      : `${s.capacite} places`}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="mt-auto">
                {isSelectable ? (
                  <Button
                    asChild
                    className={cn(
                      'h-9 w-full rounded-lg font-medium',
                      'bg-slate-900 text-white hover:bg-slate-800',
                      'dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
                    )}
                  >
                    <Link
                      href={`/staff/selections/${s.id}`}
                      className="group/btn"
                    >
                      Gérer les candidats
                      <ArrowRight
                        className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5"
                        aria-hidden
                      />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    disabled
                    className="h-9 w-full cursor-not-allowed border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-500"
                  >
                    Sélection fermée
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}