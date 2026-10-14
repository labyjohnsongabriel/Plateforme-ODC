// src/app/(admin)/admin/audit-logs/components/AuditLogStats.tsx
'use client';

import * as React from 'react';
import {
  Activity,
  Calendar,
  TrendingUp,
  AlertOctagon,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuditLogsStats } from '@/hooks/useAuditLogs';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: 'primary' | 'success' | 'info' | 'error';
  hint?: string;
}

const TONES = {
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
  info: {
    bg: 'bg-odc-info-soft',
    icon: 'text-odc-info',
    ring: 'ring-odc-info/30',
  },
  error: {
    bg: 'bg-odc-error-soft',
    icon: 'text-odc-error',
    ring: 'ring-odc-error/30',
  },
} as const;

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

export function AuditLogStats() {
  const { data, isLoading } = useAuditLogsStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-28 animate-pulse bg-odc-surface-alt" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total activités"
        value={data?.total ?? 0}
        icon={Activity}
        tone="primary"
      />
      <StatCard
        label="Aujourd'hui"
        value={data?.today ?? 0}
        icon={Calendar}
        tone="info"
        hint="Dernières 24h"
      />
      <StatCard
        label="Cette semaine"
        value={data?.thisWeek ?? 0}
        icon={TrendingUp}
        tone="success"
        hint="7 derniers jours"
      />
      <StatCard
        label="Critiques"
        value={data?.criticals ?? 0}
        icon={AlertOctagon}
        tone="error"
        hint="Actions sensibles"
      />
    </div>
  );
}