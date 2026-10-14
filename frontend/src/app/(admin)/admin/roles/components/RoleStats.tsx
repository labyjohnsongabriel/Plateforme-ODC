// src/app/(admin)/admin/roles/components/RoleStats.tsx
'use client';

import * as React from 'react';
import { Shield, Lock, Users, Key, UserCog } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRolesStats } from '@/hooks/useRoles';

type Tone = 'primary' | 'success' | 'info' | 'warning' | 'muted';

const TONES: Record<Tone, { bg: string; icon: string; ring: string }> = {
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
  warning: {
    bg: 'bg-odc-warning-soft',
    icon: 'text-odc-warning',
    ring: 'ring-odc-warning/30',
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
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

export function RoleStats() {
  const { data, isLoading } = useRolesStats();

  if (isLoading) return <StatsSkeleton />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Total rôles"
        value={data?.total ?? 0}
        icon={Shield}
        tone="primary"
      />
      <StatCard
        label="Système"
        value={data?.systemes ?? 0}
        icon={Lock}
        tone="muted"
        hint="Non modifiables"
      />
      <StatCard
        label="Personnalisés"
        value={data?.personnalises ?? 0}
        icon={UserCog}
        tone="info"
      />
      <StatCard
        label="Utilisateurs"
        value={data?.totalUtilisateurs ?? 0}
        icon={Users}
        tone="success"
        hint="Assignés à un rôle"
      />
      <StatCard
        label="Permissions"
        value={data?.totalPermissions ?? 0}
        icon={Key}
        tone="warning"
        hint="Toutes catégories"
      />
    </div>
  );
}