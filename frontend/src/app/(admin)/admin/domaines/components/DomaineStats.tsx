'use client';

import * as React from 'react';
import { FolderTree, BookOpen, Eye, FileEdit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useDomainesStats } from '@/hooks/useDomaines';

/* ============================================================================
   TYPES
   ============================================================================ */

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  tone: 'primary' | 'success' | 'info' | 'muted';
  hint?: string;
}

/* ============================================================================
   PALETTE DE COULEURS PAR TONALITÉ
   ============================================================================ */

const TONES = {
  primary: {
    bg: 'bg-odc-primary-soft',
    text: 'text-odc-primary-active',
    icon: 'text-odc-primary',
  },
  success: {
    bg: 'bg-odc-success-soft',
    text: 'text-odc-success-dark',
    icon: 'text-odc-success',
  },
  info: {
    bg: 'bg-odc-info-soft',
    text: 'text-odc-info-dark',
    icon: 'text-odc-info',
  },
  muted: {
    bg: 'bg-odc-surface-alt',
    text: 'text-odc-text-secondary',
    icon: 'text-odc-text-muted',
  },
} as const;

/* ============================================================================
   CARTE STATISTIQUE
   ============================================================================ */

function StatCard({ label, value, icon: Icon, tone, hint }: StatCardProps) {
  const t = TONES[tone];

  return (
    <Card className="p-5 transition-shadow hover:shadow-odc-md">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-odc-text-muted">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums text-odc-text-primary">
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-odc-text-muted">{hint}</p>
          )}
        </div>

        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            t.bg,
          )}
        >
          <Icon className={cn('h-5 w-5', t.icon)} aria-hidden="true" />
        </div>
      </div>
    </Card>
  );
}

/* ============================================================================
   SQUELETTE DE CHARGEMENT
   ============================================================================ */

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="h-3 w-24 animate-pulse rounded bg-odc-surface-alt" />
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

export function DomaineStats() {
  const { data, isLoading, isError } = useDomainesStats();

  /* -------------------- Chargement -------------------- */
  if (isLoading) return <StatsSkeleton />;

  /* -------------------- Erreur -------------------- */
  if (isError) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <p className="text-xs text-odc-text-muted">Erreur de chargement</p>
            <p className="mt-2 font-display text-3xl font-bold text-odc-text-disabled">
              —
            </p>
          </Card>
        ))}
      </div>
    );
  }

  /* -------------------- Données -------------------- */
  const stats = {
    total: data?.total ?? 0,
    published: data?.published ?? 0,
    draft: data?.draft ?? 0,
    totalFormations: data?.totalFormations ?? 0,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total domaines"
        value={stats.total}
        icon={FolderTree}
        tone="primary"
        hint="Tous statuts confondus"
      />
      <StatCard
        label="Publiés"
        value={stats.published}
        icon={Eye}
        tone="success"
        hint="Visibles sur le site public"
      />
      <StatCard
        label="Brouillons"
        value={stats.draft}
        icon={FileEdit}
        tone="muted"
        hint="En attente de publication"
      />
      <StatCard
        label="Formations liées"
        value={stats.totalFormations}
        icon={BookOpen}
        tone="info"
        hint="Toutes catégories"
      />
    </div>
  );
}