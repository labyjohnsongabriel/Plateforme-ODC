// src/app/(admin)/admin/dashboard/components/PendingApprovals.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Clock, UserCheck, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface PendingInscription {
  id: string;
  createdAt: string;
  participant?: {
    id: string;
    nom?: string | null;
    prenom?: string | null;
    photoUrl?: string | null;
  } | null;
  session?: {
    formation?: { titre: string } | null;
  } | null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function normalizeInscriptions(payload: unknown): PendingInscription[] {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;

    if (Array.isArray(obj.data)) return obj.data as PendingInscription[];

    if (obj.data && typeof obj.data === 'object') {
      const nested = obj.data as Record<string, unknown>;
      if (Array.isArray(nested.data)) return nested.data as PendingInscription[];
      if (Array.isArray(nested.items)) return nested.items as PendingInscription[];
    }

    if (Array.isArray(obj.items)) return obj.items as PendingInscription[];
  }

  return [];
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function PendingApprovals() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery<PendingInscription[]>({
    queryKey: ['admin', 'dashboard', 'pending'],
    queryFn: async () => {
      const { data } = await api.get('/admin/inscriptions', {
        params: { statut: 'EN_ATTENTE', limit: 5 },
      });
      return normalizeInscriptions(data);
    },
  });

  /* ── Loading ────────────────────────────────────────── */
  if (isLoading) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  /* ── Erreur ─────────────────────────────────────────── */
  if (isError) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardHeader>
          <CardTitle className="text-base text-slate-900 dark:text-slate-50">
            En attente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QueryErrorState
            onRetry={() => {
              void refetch();
            }}
            isRetrying={isFetching}
          />
        </CardContent>
      </Card>
    );
  }

  const items = Array.isArray(data) ? data : [];

  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden />
          <CardTitle className="text-base text-slate-900 dark:text-slate-50">
            En attente
          </CardTitle>
          {items.length > 0 && (
            <Badge
              variant="outline"
              className={cn(
                'border-amber-200 bg-amber-50 text-xs font-medium text-amber-700',
                'dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
              )}
            >
              {items.length}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link
            href="/admin/inscriptions?statut=EN_ATTENTE"
            className="text-slate-500 hover:bg-orange-50 hover:text-orange-600 dark:text-slate-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
          >
            Voir tout
            <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="Aucune demande"
            description="Tout est à jour"
            size="sm"
          />
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/admin/inscriptions/${item.id}`}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg border p-3 transition-all',
                    'border-amber-200/60 bg-amber-50/40',
                    'hover:border-amber-300 hover:bg-amber-50',
                    'dark:border-amber-500/20 dark:bg-amber-500/[0.04]',
                    'dark:hover:border-amber-500/40 dark:hover:bg-amber-500/[0.08]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2',
                    'dark:focus-visible:ring-orange-500',
                  )}
                >
                  {/* ⭐ Avatar avec photo */}
                  <UserAvatar
                    user={{
                      prenom: item.participant?.prenom ?? undefined,
                      nom: item.participant?.nom ?? undefined,
                      photoUrl: item.participant?.photoUrl ?? null,
                    }}
                    size="md"
                    className="shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'truncate text-sm font-medium text-slate-900 transition-colors',
                        'group-hover:text-amber-700 dark:text-slate-50 dark:group-hover:text-amber-300',
                      )}
                    >
                      {item.participant?.prenom} {item.participant?.nom}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {item.session?.formation?.titre}
                    </p>
                  </div>

                  <span className="shrink-0 text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}