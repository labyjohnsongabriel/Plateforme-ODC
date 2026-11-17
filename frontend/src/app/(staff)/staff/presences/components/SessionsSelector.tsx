// src/app/(staff)/staff/presences/components/SessionsSelector.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, ArrowRight, QrCode } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface StaffSession {
  id: string;
  codeSession: string;
  dateDebut: string;
  capacite: number;
  presenceOuverte?: boolean;
  formation?: { titre: string } | null;
}

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

export function SessionsSelector({
  routeBase = '/staff/presences',
}: {
  routeBase?: string;
}) {
  const { data, isLoading, isError, refetch, isFetching } = useQuery<StaffSession[]>({
    queryKey: ['staff', 'sessions', 'for-presence'],
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

  /* ── Error ──────────────────────────────────────────── */
  if (isError) {
    return (
      <Card className="border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <QueryErrorState
          onRetry={() => void refetch()}
          isRetrying={isFetching}
          description="Impossible de charger les sessions. Vérifiez vos droits et réessayez."
        />
      </Card>
    );
  }

  const sessions = data ?? [];

  /* ── Empty ──────────────────────────────────────────── */
  if (sessions.length === 0) {
    return (
      <Card className="border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <EmptyState icon={Calendar} title="Aucune session" />
      </Card>
    );
  }

  /* ── Rendu ──────────────────────────────────────────── */
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((s) => (
        <Card
          key={s.id}
          className={cn(
            'group flex h-full flex-col overflow-hidden transition-all duration-300',
            'border-slate-200 bg-white',
            'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
            'dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700',
          )}
        >
          <CardContent className="flex flex-1 flex-col p-5">
            <div className="mb-3 flex items-start justify-between gap-2">
              <Badge
                variant="outline"
                className="border-slate-200 font-mono text-[11px] tracking-wide text-slate-700 dark:border-slate-700 dark:text-slate-300"
              >
                {s.codeSession}
              </Badge>
              {s.presenceOuverte ? (
                <Badge className="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <QrCode className="h-3 w-3" aria-hidden />
                  Ouverte
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[11px] font-semibold text-slate-500 dark:text-slate-400"
                >
                  Fermée
                </Badge>
              )}
            </div>

            <h3 className="mb-3 line-clamp-2 min-h-[3rem] font-display font-semibold text-slate-900 transition-colors group-hover:text-slate-900 dark:text-slate-50 dark:group-hover:text-slate-50">
              {s.formation?.titre ?? 'Session de formation'}
            </h3>

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
                <span className="tabular-nums">{s.capacite} places</span>
              </div>
            </div>

            <div className="mt-auto">
              <Button
                asChild
                className={cn(
                  'h-9 w-full rounded-lg font-medium',
                  'bg-slate-900 text-white hover:bg-slate-800',
                  'dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
                )}
              >
                <Link href={`${routeBase}/${s.id}`} className="group/btn">
                  Voir les présences
                  <ArrowRight
                    className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}