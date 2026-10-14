// src/app/(admin)/admin/attestations/components/AttestationsStats.tsx
'use client';

import * as React from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAttestationsStats } from '@/hooks/useAttestations';

/* ============================================================================
   TYPES
   ============================================================================ */

type Tone = 'primary' | 'success' | 'error' | 'info';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: Tone;
  hint?: string;
}

/* ============================================================================
   PALETTE
   ============================================================================ */

const TONES: Record<
  Tone,
  { bg: string; icon: string; ring: string; value: string }
> = {
  primary: {
    bg: 'bg-odc-primary-soft',
    icon: 'text-odc-primary',
    ring: 'ring-odc-primary-light/40',
    value: 'text-odc-primary-active',
  },
  success: {
    bg: 'bg-odc-success-soft',
    icon: 'text-odc-success',
    ring: 'ring-odc-success/30',
    value: 'text-odc-success-dark',
  },
  error: {
    bg: 'bg-odc-error-soft',
    icon: 'text-odc-error',
    ring: 'ring-odc-error/30',
    value: 'text-odc-error-dark',
  },
  info: {
    bg: 'bg-odc-info-soft',
    icon: 'text-odc-info',
    ring: 'ring-odc-info/30',
    value: 'text-odc-info-dark',
  },
};

/* ============================================================================
   CARTE
   ============================================================================ */

function StatCard({ label, value, icon: Icon, tone, hint }: StatCardProps) {
  const t = TONES[tone];
  const formattedValue = new Intl.NumberFormat('fr-FR').format(value);

  return (
    <Card className="p-5 transition-shadow hover:shadow-odc-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-odc-text-muted">
            {label}
          </p>
          <p
            className={cn(
              'mt-2 font-display text-3xl font-bold tabular-nums leading-none',
              t.value,
            )}
          >
            {formattedValue}
          </p>
          {hint && <p className="mt-1 text-xs text-odc-text-muted">{hint}</p>}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
            t.bg,
            t.ring,
          )}
        >
          <Icon className={cn('h-5 w-5', t.icon)} aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}

/* ============================================================================
   SQUELETTE
   ============================================================================ */

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="h-3 w-20 animate-pulse rounded bg-odc-surface-alt" />
              <div className="h-8 w-16 animate-pulse rounded bg-odc-surface-alt" />
            </div>
            <div className="h-11 w-11 animate-pulse rounded-xl bg-odc-surface-alt" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ============================================================================
   COMPOSANT PRINCIPAL
   ============================================================================ */

export function AttestationsStats() {
  const { data, isLoading } = useAttestationsStats();

  if (isLoading) return <StatsSkeleton />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total attestations"
        value={data?.total ?? 0}
        icon={Award}
        tone="primary"
        hint="Toutes périodes"
      />
      <StatCard
        label="Valides"
        value={data?.valides ?? 0}
        icon={CheckCircle2}
        tone="success"
        hint="Vérifiables en ligne"
      />
      <StatCard
        label="Invalidées"
        value={data?.invalides ?? 0}
        icon={XCircle}
        tone="error"
        hint="Non vérifiables"
      />
      <StatCard
        label="Ce mois"
        value={data?.ceMois ?? 0}
        icon={Sparkles}
        tone="info"
        hint="Émises ce mois-ci"
      />
    </div>
  );
}