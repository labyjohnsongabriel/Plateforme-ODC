// src/app/(admin)/admin/dashboard/components/TopFormations.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Trophy, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { cn } from '@/lib/utils';

const MEDALS = ['🥇', '🥈', '🥉'];

interface TopFormation {
  id: string;
  titre: string;
  slug: string;
  domaine?: string | null;
  domaineRelation?: { nom: string } | null;
  inscriptions: number;
}

export function TopFormations() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery<TopFormation[]>({
    queryKey: ['admin', 'dashboard', 'top-formations'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard/top-formations', {
        params: { limit: 5 },
      });
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top formations</CardTitle>
        </CardHeader>
        <CardContent>
          <QueryErrorState
            onRetry={() => { void refetch(); }}
            isRetrying={isFetching}
          />
        </CardContent>
      </Card>
    );
  }

  const formations = data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Top formations</CardTitle>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/formations" className="text-muted-foreground hover:text-foreground">
            Voir tout
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {formations.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Aucune formation"
            size="sm"
          />
        ) : (
          <ul className="space-y-2">
            {formations.map((f, i) => {
              const isTop = i < 3;
              return (
                <li key={f.id}>
                  <Link
                    href={`/admin/formations/${f.id}`}
                    className={cn(
                      'group flex items-center gap-3 p-3 rounded-lg border transition-all',
                      'border-border bg-card',
                      'hover:border-primary/40 hover:bg-accent/50',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    )}
                  >
                    {/* Rang / médaille */}
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums',
                        isTop
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {isTop ? (
                        <span className="text-lg leading-none">{MEDALS[i]}</span>
                      ) : (
                        <span>#{i + 1}</span>
                      )}
                    </div>

                    {/* Titre + domaine */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {f.titre}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {f.domaineRelation?.nom ?? f.domaine ?? '—'}
                      </p>
                    </div>

                    {/* Badge inscriptions */}
                    <Badge
                      variant="secondary"
                      className="shrink-0 tabular-nums text-xs font-medium"
                    >
                      {f.inscriptions} insc.
                    </Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}