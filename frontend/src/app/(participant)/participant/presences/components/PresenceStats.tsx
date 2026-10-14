// src/app/(participant)/participant/presences/components/PresenceStats.tsx
'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface PresenceStatsData {
  total: number;
  presents: number;
  absents: number;
  retards: number;
  excuses: number;
  tauxPresence: number;
}

type Tone = 'primary' | 'success' | 'error' | 'warning';

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
  warning: {
    bg: 'bg-odc-warning-soft',
    icon: 'text-odc-warning',
    ring: 'ring-odc-warning/30',
    value: 'text-odc-warning-dark',
  },
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  tone: Tone;
  hint?: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  hint,
}: StatCardProps) {
  const t = TONES[tone];
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
          <p
            className={cn(
              'mt-2 font-display text-2xl font-bold tabular-nums leading-none',
              t.value,
            )}
          >
            {formattedValue}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-odc-text-muted">{hint}</p>
          )}
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
            <div className="h-10 w-10 animate-pulse rounded-lg bg-odc-surface-alt" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function PresenceStats() {
  const { data, isLoading } = useQuery<PresenceStatsData>({
    queryKey: ['participant', 'presences', 'stats'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/participant/presences/stats');
        return data?.data ?? {
          total: 0,
          presents: 0,
          absents: 0,
          retards: 0,
          excuses: 0,
          tauxPresence: 0,
        };
      } catch {
        return {
          total: 0,
          presents: 0,
          absents: 0,
          retards: 0,
          excuses: 0,
          tauxPresence: 0,
        };
      }
    },
    staleTime: 60_000,
    retry: 0,
  });

  if (isLoading) return <StatsSkeleton />;

  const stats = data ?? {
    total: 0,
    presents: 0,
    absents: 0,
    retards: 0,
    excuses: 0,
    tauxPresence: 0,
  };

  const tauxTone: Tone =
    stats.tauxPresence >= 75
      ? 'success'
      : stats.tauxPresence >= 50
        ? 'warning'
        : 'error';

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total sessions"
        value={stats.total}
        icon={Calendar}
        tone="primary"
      />
      <StatCard
        label="Présences"
        value={stats.presents}
        icon={CheckCircle2}
        tone="success"
        hint={
          stats.retards > 0 ? `+ ${stats.retards} retard(s)` : undefined
        }
      />
      <StatCard
        label="Absences"
        value={stats.absents}
        icon={XCircle}
        tone="error"
        hint={
          stats.excuses > 0 ? `+ ${stats.excuses} excusée(s)` : undefined
        }
      />
      <StatCard
        label="Taux de présence"
        value={`${stats.tauxPresence}%`}
        icon={TrendingUp}
        tone={tauxTone}
        hint={
          stats.tauxPresence >= 75
            ? 'Excellent'
            : stats.tauxPresence >= 50
              ? 'À améliorer'
              : 'Critique'
        }
      />
    </div>
  );
}