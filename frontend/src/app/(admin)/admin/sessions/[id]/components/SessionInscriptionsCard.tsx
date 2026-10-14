'use client';

import * as React from 'react';
import { Users, Search, UserCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

interface SessionInscriptionsCardProps {
  sessionId: string;
}

const STATUT_CONFIG: Record<string, { label: string; className: string }> = {
  EN_ATTENTE: {
    label: 'En attente',
    className: 'bg-odc-warning-soft text-odc-warning-dark',
  },
  VALIDEE: {
    label: 'Validée',
    className: 'bg-odc-success-soft text-odc-success-dark',
  },
  REJETEE: {
    label: 'Rejetée',
    className: 'bg-odc-error-soft text-odc-error-dark',
  },
  ANNULEE: {
    label: 'Annulée',
    className: 'bg-odc-surface-alt text-odc-text-secondary',
  },
};

export function SessionInscriptionsCard({
  sessionId,
}: SessionInscriptionsCardProps) {
  const [search, setSearch] = React.useState('');

  const { data: inscriptions = [], isLoading } = useQuery({
    queryKey: ['admin', 'sessions', sessionId, 'inscriptions'],
    queryFn: async () => {
      const { data } = await api.get(
        `/admin/sessions/${sessionId}/inscriptions`,
      );
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      return Array.isArray(list) ? list : [];
    },
    enabled: !!sessionId,
  });

  /* Filtrer par recherche */
  const filtered = React.useMemo(() => {
    if (!search.trim()) return inscriptions;
    const q = search.toLowerCase();
    return inscriptions.filter(
      (i: any) =>
        i.participant?.prenom?.toLowerCase().includes(q) ||
        i.participant?.nom?.toLowerCase().includes(q) ||
        i.participant?.email?.toLowerCase().includes(q),
    );
  }, [inscriptions, search]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-odc-primary" />
            Inscriptions
            <span className="text-sm font-normal text-odc-text-muted">
              ({inscriptions.length})
            </span>
          </CardTitle>
        </div>

        {/* Recherche */}
        {inscriptions.length > 0 && (
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-odc-text-muted" />
            <Input
              placeholder="Rechercher un participant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center">
            <UserCheck className="mx-auto mb-2 h-8 w-8 text-odc-text-muted" />
            <p className="text-sm text-odc-text-muted">
              {search
                ? 'Aucun participant trouvé'
                : 'Aucune inscription pour le moment'}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((i: any) => (
              <li
                key={i.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-odc-border p-3 transition-colors hover:bg-odc-surface-hover"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-odc-text-primary">
                    {i.participant?.prenom} {i.participant?.nom}
                  </p>
                  <p className="truncate text-xs text-odc-text-muted">
                    {i.participant?.email}
                  </p>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    STATUT_CONFIG[i.statut]?.className ??
                    'bg-odc-surface-alt text-odc-text-secondary'
                  }`}
                >
                  {STATUT_CONFIG[i.statut]?.label ?? i.statut}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}