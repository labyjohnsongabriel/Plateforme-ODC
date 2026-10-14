// src/app/(admin)/admin/formations/[id]/components/FormationSessionsCard.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Plus,
  ExternalLink,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  CalendarX,
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
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';

/* ============================================================================
   CONFIGURATION
   ============================================================================ */

const STATUT_CONFIG = {
  PLANIFIEE: {
    label: 'Planifiée',
    className: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  OUVERTE: {
    label: 'Ouverte',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  EN_COURS: {
    label: 'En cours',
    className:
      'bg-odc-primary-soft text-odc-primary-active ring-odc-primary-light/40',
  },
  TERMINEE: {
    label: 'Terminée',
    className: 'bg-odc-surface-alt text-odc-text-secondary ring-odc-border',
  },
  ANNULEE: {
    label: 'Annulée',
    className: 'bg-red-50 text-red-700 ring-red-200',
  },
} as const;

/* ============================================================================
   TYPES
   ============================================================================ */

interface Session {
  id: string;
  codeSession?: string;
  titre?: string;
  statut?: keyof typeof STATUT_CONFIG;
  dateDebut?: string;
  dateFin?: string;
  lieu?: string;
  capacite?: number;
  inscriptionsCount?: number;
  formation?: {
    id: string;
    titre: string;
  };
}

interface FormationSessionsCardProps {
  formationId: string;
  onAddSession?: () => void;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function FormationSessionsCard({
  formationId,
  onAddSession,
}: FormationSessionsCardProps) {
  const {
    data: sessions = [],
    isLoading,
    isError,
  } = useQuery<Session[]>({
    queryKey: ['admin', 'formations', formationId, 'sessions'],
    queryFn: async () => {
      try {
        const { data } = await api.get(
          `/admin/formations/${formationId}/sessions`,
        );
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    enabled: !!formationId,
    retry: 0,
    staleTime: 30_000,
  });

  /* -------------------- Tri par date -------------------- */
  const sortedSessions = React.useMemo(() => {
    return [...sessions].sort((a, b) => {
      const dateA = a.dateDebut ? new Date(a.dateDebut).getTime() : 0;
      const dateB = b.dateDebut ? new Date(b.dateDebut).getTime() : 0;
      return dateB - dateA; // Plus récentes en premier
    });
  }, [sessions]);

  /* -------------------- Rendu -------------------- */
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5 text-odc-primary" />
            Sessions
          </CardTitle>

          <Badge
            variant="outline"
            className="tabular-nums text-xs"
            aria-label={`${sessions.length} session(s)`}
          >
            {sessions.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ================================================================
            CHARGEMENT
            ================================================================ */}
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        )}

        {/* ================================================================
            ERREUR
            ================================================================ */}
        {!isLoading && isError && (
          <div className="flex items-start gap-3 rounded-lg border border-odc-error/30 bg-odc-error-soft/30 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-odc-error" />
            <p className="text-xs text-odc-error-dark">
              Impossible de charger les sessions.
            </p>
          </div>
        )}

        {/* ================================================================
            VIDE
            ================================================================ */}
        {!isLoading && !isError && sessions.length === 0 && (
          <div className="rounded-lg border border-dashed border-odc-border p-6 text-center">
            <CalendarX className="mx-auto mb-2 h-8 w-8 text-odc-text-muted" />
            <p className="text-sm font-medium text-odc-text-primary">
              Aucune session
            </p>
            <p className="mt-1 text-xs text-odc-text-muted">
              Créez la première session pour cette formation.
            </p>
          </div>
        )}

        {/* ================================================================
            LISTE
            ================================================================ */}
        {!isLoading && !isError && sessions.length > 0 && (
          <ul className="space-y-2">
            {sortedSessions.slice(0, 5).map((s) => (
              <SessionItem key={s.id} session={s} />
            ))}

            {sessions.length > 5 && (
              <li className="pt-1 text-center">
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs"
                  asChild
                >
                  <Link
                    href={`/admin/sessions?formationId=${formationId}`}
                  >
                    Voir les {sessions.length} sessions
                  </Link>
                </Button>
              </li>
            )}
          </ul>
        )}

        {/* ================================================================
            ACTION
            ================================================================ */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onAddSession}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Ajouter une session
        </Button>
      </CardContent>
    </Card>
  );
}

/* ============================================================================
   SOUS-COMPOSANT — SessionItem
   ============================================================================ */

function SessionItem({ session }: { session: Session }) {
  const config =
    STATUT_CONFIG[session.statut as keyof typeof STATUT_CONFIG] ??
    STATUT_CONFIG.PLANIFIEE;

  const inscriptionsCount = session.inscriptionsCount ?? 0;
  const capacite = session.capacite ?? 0;
  const fillPercent =
    capacite > 0 ? Math.min(100, (inscriptionsCount / capacite) * 100) : 0;

  return (
    <li className="group rounded-lg border border-odc-border p-3 transition-colors hover:bg-odc-surface-hover">
      {/* Ligne 1 : Code + Statut */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {session.codeSession && (
          <span className="font-mono text-xs font-semibold text-odc-text-primary">
            {session.codeSession}
          </span>
        )}

        {session.statut && (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
              config.className,
            )}
          >
            {config.label}
          </span>
        )}
      </div>

      {/* Ligne 2 : Titre (si pas le code) */}
      {session.titre && session.titre !== session.codeSession && (
        <p className="mb-1.5 truncate text-sm font-medium text-odc-text-primary">
          {session.titre}
        </p>
      )}

      {/* Ligne 3 : Dates */}
      {(session.dateDebut || session.dateFin) && (
        <div className="flex items-center gap-1.5 text-xs text-odc-text-muted">
          <Calendar className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {session.dateDebut ? formatDate(session.dateDebut) : '—'}
            {' → '}
            {session.dateFin ? formatDate(session.dateFin) : '—'}
          </span>
        </div>
      )}

      {/* Ligne 4 : Lieu */}
      {session.lieu && (
        <div className="mt-1 flex items-center gap-1.5 text-xs text-odc-text-muted">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{session.lieu}</span>
        </div>
      )}

      {/* Ligne 5 : Barre de remplissage */}
      {capacite > 0 && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-odc-text-muted">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {inscriptionsCount} / {capacite}
            </span>
            <span className="tabular-nums">
              {Math.round(fillPercent)}%
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-odc-surface-alt">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                fillPercent >= 90
                  ? 'bg-odc-error'
                  : fillPercent >= 70
                    ? 'bg-odc-warning'
                    : 'bg-odc-success',
              )}
              style={{ width: `${fillPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Lien détails */}
      <div className="mt-2 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[10px] opacity-0 transition-opacity group-hover:opacity-100"
          asChild
        >
          <Link href={`/admin/sessions/${session.id}`}>
            Détails
            <ExternalLink className="ml-1 h-2.5 w-2.5" />
          </Link>
        </Button>
      </div>
    </li>
  );
}