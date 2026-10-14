'use client';

import * as React from 'react';
import {
  QrCode,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Lock,
  Unlock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/formatters';
import {
  useTogglePresenceSession,
  type Session,
} from '@/hooks/useSessions';

interface SessionPresencesCardProps {
  session: Session;
}

export function SessionPresencesCard({
  session,
}: SessionPresencesCardProps) {
  const togglePresence = useTogglePresenceSession();

  const { data: presences = [], isLoading } = useQuery({
    queryKey: ['admin', 'sessions', session.id, 'presences'],
    queryFn: async () => {
      const { data } = await api.get(
        `/admin/sessions/${session.id}/presences`,
      );
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      return Array.isArray(list) ? list : [];
    },
    enabled: !!session.id,
    refetchInterval: session.presenceOuverte ? 15_000 : false, // Auto-refresh si ouverte
  });

  const handleToggle = () => {
    togglePresence.mutate({
      id: session.id,
      ouverte: !session.presenceOuverte,
    });
  };

  /* ✅ Peut ouvrir la présence uniquement si OUVERTE ou EN_COURS */
  const canOpenPresence = ['OUVERTE', 'EN_COURS'].includes(session.statut);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-odc-primary" />
          Présences
          {presences.length > 0 && (
            <span className="text-sm font-normal text-odc-text-muted">
              ({presences.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bouton ouvrir/fermer */}
        <div
          className={cn(
            'rounded-lg border-2 p-4 transition-colors',
            session.presenceOuverte
              ? 'border-odc-success bg-odc-success-soft/30'
              : 'border-odc-border bg-odc-surface-alt/30',
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {session.presenceOuverte ? (
                  <Unlock className="h-4 w-4 text-odc-success" />
                ) : (
                  <Lock className="h-4 w-4 text-odc-text-muted" />
                )}
                <p className="text-sm font-semibold text-odc-text-primary">
                  {session.presenceOuverte ? 'Ouverte' : 'Fermée'}
                </p>
              </div>
              <p className="mt-1 text-xs text-odc-text-muted">
                {session.presenceOuverte
                  ? 'Les participants peuvent scanner le QR code'
                  : canOpenPresence
                    ? 'Ouvrez pour permettre le pointage'
                    : 'Impossible : la session doit être OUVERTE ou EN_COURS'}
              </p>
            </div>

            {session.presenceOuverte ? (
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-odc-success opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-odc-success" />
              </span>
            ) : null}
          </div>

          <Button
            variant={session.presenceOuverte ? 'outline' : 'odc'}
            size="sm"
            onClick={handleToggle}
            disabled={togglePresence.isPending || (!canOpenPresence && !session.presenceOuverte)}
            loading={togglePresence.isPending}
            className="mt-3 w-full"
            leftIcon={<QrCode className="h-4 w-4" />}
          >
            {session.presenceOuverte
              ? 'Fermer la présence'
              : 'Ouvrir la présence'}
          </Button>
        </div>

        {/* Liste des présences */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : presences.length === 0 ? (
          <div className="py-6 text-center">
            <Users className="mx-auto mb-2 h-8 w-8 text-odc-text-muted" />
            <p className="text-sm text-odc-text-muted">
              Aucune présence enregistrée
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {presences.slice(0, 10).map((p: any) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-lg border border-odc-border p-2.5"
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    p.estPresent
                      ? 'bg-odc-success-soft'
                      : 'bg-odc-error-soft',
                  )}
                >
                  {p.estPresent ? (
                    <CheckCircle2 className="h-4 w-4 text-odc-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-odc-error" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-odc-text-primary">
                    {p.participant?.prenom} {p.participant?.nom}
                  </p>
                  <p className="truncate text-xs text-odc-text-muted">
                    {p.createdAt ? formatDateTime(p.createdAt) : '—'}
                  </p>
                </div>
              </li>
            ))}
            {presences.length > 10 && (
              <li className="text-center text-xs text-odc-text-muted">
                +{presences.length - 10} autres présences
              </li>
            )}
          </ul>
        )}

        {/* Auto-refresh indicator */}
        {session.presenceOuverte && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-odc-text-muted">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Mise à jour automatique toutes les 15s
          </div>
        )}
      </CardContent>
    </Card>
  );
}