// src/app/(admin)/admin/partenaires/components/PartnerStats.tsx
'use client';

import * as React from 'react';
import { Building2, Eye, FileEdit, CheckCircle2, PieChart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { usePartenairesStats } from '@/hooks/usePartenaires';

type Tone = 'primary' | 'success' | 'muted' | 'info';

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

export function PartnerStats() {
  const { data, isLoading } = usePartenairesStats();

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
        label="Total partenaires"
        value={data?.total ?? 0}
        icon={Building2}
        tone="primary"
      />
      <StatCard
        label="Publiés"
        value={data?.published ?? 0}
        icon={Eye}
        tone="success"
      />
      <StatCard
        label="Brouillons"
        value={data?.draft ?? 0}
        icon={FileEdit}
        tone="muted"
      />
      <StatCard
        label="Actifs"
        value={data?.actifs ?? 0}
        icon={CheckCircle2}
        tone="info"
        hint="Disponibles dans la plateforme"
      />
    </div>
  );
}