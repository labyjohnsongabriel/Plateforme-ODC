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
import { cn } from '@/lib/utils';

const MEDALS = ['🥇', '🥈', '🥉'];

export function TopFormations() {
  const { data, isLoading } = useQuery({
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

  const formations = data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-odc-primary" />
          <CardTitle className="text-base">Top formations</CardTitle>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/formations">
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
            {formations.map((f: any, i: number) => (
              <li key={f.id}>
                <Link
                  href={`/admin/formations/${f.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-odc-border bg-odc-surface hover:border-odc-primary hover:bg-odc-primary-soft/30 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-odc-surface-alt flex items-center justify-center text-lg shrink-0">
                    {MEDALS[i] ?? `#${i + 1}`}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {f.titre}
                    </p>
                    <p className="text-xs text-odc-muted">
                      {f.domaineRelation?.nom ?? f.domaine}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className="shrink-0 text-xs font-medium"
                  >
                    {f.inscriptions} insc.
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}