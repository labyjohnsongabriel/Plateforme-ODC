// src/app/(admin)/admin/audit-logs/components/AuditLogStats.tsx
'use client';

import { Activity, Calendar, TrendingUp, AlertOctagon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { cn } from '@/lib/utils';
import { useAuditLogsStats } from '@/hooks/useAuditLogs';

type Tone = 'primary' | 'success' | 'info' | 'error';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: Tone;
  hint?: string;
}

const TONES: Record<Tone, { bg: string; icon: string; ring: string; bar: string }> = {
  primary: {
    bg: 'bg-primary/10 dark:bg-primary/15',
    icon: 'text-primary',
    ring: 'ring-primary/20',
    bar: 'from-primary to-primary/60',
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    icon: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-200 dark:ring-emerald-500/30',
    bar: 'from-emerald-400 to-emerald-600',
  },
  info: {
    bg: 'bg-sky-50 dark:bg-sky-500/10',
    icon: 'text-sky-700 dark:text-sky-300',
    ring: 'ring-sky-200 dark:ring-sky-500/30',
    bar: 'from-sky-400 to-sky-600',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    icon: 'text-red-700 dark:text-red-300',
    ring: 'ring-red-200 dark:ring-red-500/30',
    bar: 'from-red-400 to-red-600',
  },
};

function StatCard({ label, value, icon: Icon, tone, hint }: StatCardProps) {
  const t = TONES[tone];
  const formattedValue = new Intl.NumberFormat('fr-FR').format(value);

  return (
    <Card className="hover:border-primary/30 group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
          t.bar,
          'opacity-60 transition-opacity group-hover:opacity-100',
        )}
      />
      <CardContent className="p-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              {label}
            </p>
            <p className="font-display text-foreground mt-2 text-3xl font-bold tabular-nums leading-none">
              {formattedValue}
            </p>
            {hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}
          </div>
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-110',
              t.bg,
              t.ring,
            )}
          >
            <Icon className={cn('h-5 w-5', t.icon)} aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AuditLogStats() {
  const { data, isLoading, isError, refetch, isFetching } = useAuditLogsStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="mb-3 h-4 w-24" />
              <Skeleton className="mb-2 h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <QueryErrorState onRetry={() => void refetch()} isRetrying={isFetching} />
        </CardContent>
      </Card>
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
