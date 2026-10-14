// src/app/(participant)/participant/presences/components/MyPresencesList.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  QrCode,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Camera,
  Keyboard,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/formatters';

/* ============================================================================
   CONFIGURATION
   ============================================================================ */

const STATUT_CONFIG = {
  PRESENT: {
    label: 'Présent',
    className: 'bg-odc-success-soft text-odc-success-dark ring-odc-success/30',
    icon: CheckCircle2,
    iconColor: 'text-odc-success',
  },
  ABSENT: {
    label: 'Absent',
    className: 'bg-odc-error-soft text-odc-error-dark ring-odc-error/30',
    icon: XCircle,
    iconColor: 'text-odc-error',
  },
  RETARD: {
    label: 'Retard',
    className: 'bg-odc-warning-soft text-odc-warning-dark ring-odc-warning/30',
    icon: Clock,
    iconColor: 'text-odc-warning',
  },
  EXCUSE: {
    label: 'Excusé',
    className: 'bg-odc-surface-alt text-odc-text-secondary ring-odc-border',
    icon: AlertCircle,
    iconColor: 'text-odc-text-muted',
  },
} as const;

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function MyPresencesList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['participant', 'presences'],
    queryFn: async () => {
      const { data } = await api.get('/participant/presences');
      return data?.data ?? [];
    },
    staleTime: 30_000,
  });

  const presences = data ?? [];

  /* -------------------- Statistiques -------------------- */
  const stats = React.useMemo(() => {
    const total = presences.length;
    const presents = presences.filter(
      (p: any) => p.statut === 'PRESENT',
    ).length;
    const taux = total > 0 ? Math.round((presents / total) * 100) : 0;
    return { total, presents, taux };
  }, [presences]);

  /* -------------------- Chargement -------------------- */
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  /* -------------------- Erreur -------------------- */
  if (isError) {
    return (
      <Card>
        <EmptyState
          icon={AlertCircle}
          title="Erreur de chargement"
          description="Impossible de charger vos présences."
          action={
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          }
        />
      </Card>
    );
  }

  /* -------------------- Vide -------------------- */
  if (!presences.length) {
    return (
      <Card className="p-8">
        <EmptyState
          icon={QrCode}
          title="Aucune présence enregistrée"
          description="Scannez le QR code affiché par votre formateur pour enregistrer votre présence."
          action={
            <Button variant="odc" asChild>
              <Link href="/participant/presences/scanner">
                <Camera className="mr-2 h-4 w-4" />
                Scanner un QR code
              </Link>
            </Button>
          }
        />
      </Card>
    );
  }

  /* -------------------- Rendu -------------------- */
  return (
    <div className="space-y-6">
      {/* ================================================================
          STATS
          ================================================================ */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total présences"
          value={stats.total}
          icon={QrCode}
          tone="primary"
        />
        <StatCard
          label="Présent"
          value={stats.presents}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Taux de présence"
          value={`${stats.taux}%`}
          icon={TrendingUp}
          tone={stats.taux >= 75 ? 'success' : 'warning'}
        />
      </div>

      {/* ================================================================
          LISTE
          ================================================================ */}
      <div className="space-y-3">
        {presences.map((p: any) => (
          <PresenceCard key={p.id} presence={p} />
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   SOUS-COMPOSANTS
   ============================================================================ */

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  tone: 'primary' | 'success' | 'warning';
}

const STAT_TONES = {
  primary: {
    bg: 'bg-odc-primary-soft',
    icon: 'text-odc-primary',
    ring: 'ring-odc-primary-light/40',
  },
  success: {
    bg: 'bg-odc-success-soft',
    icon: 'text-odc-success',
    ring: 'ring-odc-success/30',
  },
  warning: {
    bg: 'bg-odc-warning-soft',
    icon: 'text-odc-warning',
    ring: 'ring-odc-warning/30',
  },
};

function StatCard({ label, value, icon: Icon, tone }: StatCardProps) {
  const t = STAT_TONES[tone];
  const formattedValue =
    typeof value === 'number'
      ? new Intl.NumberFormat('fr-FR').format(value)
      : value;

  return (
    <Card className="p-5 transition-shadow hover:shadow-odc-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-odc-text-muted">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums leading-none text-odc-text-primary">
            {formattedValue}
          </p>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset',
            t.bg,
            t.ring,
          )}
        >
          <Icon className={cn('h-4 w-4', t.icon)} aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}

/* ============================================================================
   CARTE PRÉSENCE
   ============================================================================ */

function PresenceCard({ presence }: { presence: any }) {
  const config =
    STATUT_CONFIG[presence.statut as keyof typeof STATUT_CONFIG] ??
    STATUT_CONFIG.ABSENT;
  const StatusIcon = config.icon;

  const isQrCode = presence.methode === 'QR_CODE';

  return (
    <Card className="group transition-all duration-odc-base hover:shadow-odc-md">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* -------------------- Infos -------------------- */}
          <div className="min-w-0 flex-1">
            {/* Ligne 1 : Statut + Code session */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
                  config.className,
                )}
              >
                <StatusIcon
                  className={cn('h-3 w-3', config.iconColor)}
                  aria-hidden="true"
                />
                {config.label}
              </span>

              {presence.session?.codeSession && (
                <span className="font-mono text-xs text-odc-text-muted">
                  {presence.session.codeSession}
                </span>
              )}

              {isQrCode && (
                <Badge
                  variant="outline"
                  className="border-odc-primary-light/40 text-xs text-odc-primary"
                >
                  <QrCode className="mr-1 h-3 w-3" />
                  QR Code
                </Badge>
              )}

              {presence.methode === 'MANUEL' && (
                <Badge variant="outline" className="text-xs">
                  <Keyboard className="mr-1 h-3 w-3" />
                  Manuel
                </Badge>
              )}
            </div>

            {/* Ligne 2 : Titre formation */}
            {presence.session?.formation?.titre && (
              <h3 className="mb-2 font-display text-base font-semibold text-odc-text-primary">
                {presence.session.formation.titre}
              </h3>
            )}

            {/* Ligne 3 : Métadonnées */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-odc-text-muted">
              {presence.datePresence && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-odc-primary" />
                  {formatDate(presence.datePresence)}
                </span>
              )}

              {presence.session?.lieu && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-odc-primary" />
                  {presence.session.lieu}
                </span>
              )}

              {presence.scanneLe && (
                <span className="flex items-center gap-1.5 text-xs">
                  <Clock className="h-3 w-3 shrink-0" />
                  Enregistré le {formatDateTime(presence.scanneLe)}
                </span>
              )}
            </div>
          </div>

          {/* -------------------- Détails session -------------------- */}
          {presence.session?.id && (
            <div className="shrink-0">
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/participant/presences/${presence.session.id}`}
                >
                  Détails
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}