// src/app/(admin)/admin/sessions/components/SessionStats.tsx
'use client';

import * as React from 'react';
import {
  Calendar,
  CalendarClock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useSessionsStats } from '@/hooks/useSessions';

type Tone = 'primary' | 'info' | 'success' | 'warning' | 'error' | 'muted';

const TONES: Record<Tone, { bg: string; icon: string; ring: string }> = {
  primary: {
    bg: 'bg-odc-primary-soft',
    icon: 'text-odc-primary',
    ring: 'ring-odc-primary-light/40',
  },
  info: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    ring: 'ring-blue-200',
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
  error: {
    bg: 'bg-odc-error-soft',
    icon: 'text-odc-error',
    ring: 'ring-odc-error/30',
  },
  muted: {
    bg: 'bg-odc-surface-alt',
    icon: 'text-odc-text-muted',
    ring: 'ring-odc-border',
  },
};

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: Tone;
  hint?: string;
}

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
          <p className="mt-2 font-display text-3xl font-bold tabular-nums leading-none text-odc-text-primary">
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

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
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

export function SessionStats() {
  const { data, isLoading, isError } = useSessionsStats();

  if (isLoading) return <StatsSkeleton />;
  if (isError) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        label="Total"
        value={data?.total ?? 0}
        icon={Calendar}
        tone="primary"
      />
      <StatCard
        label="Planifiées"
        value={data?.planifiees ?? 0}
        icon={CalendarClock}
        tone="info"
      />
      <StatCard
        label="Ouvertes"
        value={data?.ouvertes ?? 0}
        icon={PlayCircle}
        tone="success"
      />
      <StatCard
        label="En cours"
        value={data?.enCours ?? 0}
        icon={PlayCircle}
        tone="warning"
      />
      <StatCard
        label="Terminées"
        value={data?.terminees ?? 0}
        icon={CheckCircle2}
        tone="muted"
      />
      <StatCard
        label="Inscriptions"
        value={data?.totalInscriptions ?? 0}
        icon={Users}
        tone="success"
        hint="Toutes sessions"
      />
    </div>
  );
}