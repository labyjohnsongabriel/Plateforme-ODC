// src/app/(admin)/admin/formations/components/FormationStats.tsx
'use client';

import * as React from 'react';
import {
  BookOpen,
  Eye,
  FileEdit,
  Users,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useFormationsStats } from '@/hooks/useFormations';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

type Tone = 'primary' | 'success' | 'info' | 'muted' | 'warning';

interface StatCardProps {
  label: string;
  value: number | null | undefined;
  icon: React.ElementType;
  tone: Tone;
  hint?: string;
}

interface StatsData {
  total: number;
  published: number;
  draft: number;
  totalSessions: number;
  totalInscriptions: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   NORMALISATION — accepte plusieurs formats de réponse
   ═══════════════════════════════════════════════════════════════════════════ */

function pickNumber(obj: any, ...keys: string[]): number {
  for (const key of keys) {
    const v = obj?.[key];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v))) {
      return Number(v);
    }
  }
  return 0;
}

function normalizeStats(raw: any): StatsData {
  // Déballer les wrappers possibles : { data: ... }, { stats: ... }
  let root = raw;
  if (root && typeof root === 'object') {
    if (root.data && typeof root.data === 'object') root = root.data;
    else if (root.stats && typeof root.stats === 'object') root = root.stats;
  }

  return {
    total: pickNumber(root, 'total', 'totalFormations', 'total_formations', 'formations'),
    published: pickNumber(root, 'published', 'publiees', 'publiées', 'published_formations'),
    draft: pickNumber(root, 'draft', 'brouillons', 'drafts', 'draft_formations'),
    totalSessions: pickNumber(root, 'totalSessions', 'total_sessions', 'sessions', 'sessions_count'),
    totalInscriptions: pickNumber(root, 'totalInscriptions', 'total_inscriptions', 'inscriptions', 'inscriptions_count'),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   PALETTE
   ═══════════════════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════════════════
   CARTE
   ═══════════════════════════════════════════════════════════════════════════ */

function StatCard({ label, value, icon: Icon, tone, hint }: StatCardProps) {
  const t = TONES[tone];
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : null;
  const formatted = numeric !== null
    ? new Intl.NumberFormat('fr-FR').format(numeric)
    : '—';

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
              numeric === null ? 'text-odc-text-disabled' : 'text-odc-text-primary',
            )}
          >
            {formatted}
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

/* ═══════════════════════════════════════════════════════════════════════════
   SQUELETTE
   ═══════════════════════════════════════════════════════════════════════════ */

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
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

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */

export function FormationStats() {
  const { data: rawData, isLoading, isError, error, refetch } = useFormationsStats();

  // 🔍 Log pour diagnostic
  React.useEffect(() => {
    if (rawData) console.log('[FormationStats] data brute:', rawData);
    if (error) console.error('[FormationStats] erreur:', error);
  }, [rawData, error]);

  if (isLoading) return <StatsSkeleton />;

  if (isError) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="text-xs text-odc-text-muted">Erreur</p>
                <p className="mt-1 font-display text-xl font-bold text-odc-text-disabled">
                  —
                </p>
              </div>
            </div>
          </Card>
        ))}
        <Card className="col-span-full p-4 border-destructive/30 bg-destructive/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" aria-hidden />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                Impossible de charger les statistiques
              </p>
              {error instanceof Error && (
                <p className="text-xs text-odc-text-muted mt-1">{error.message}</p>
              )}
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-2 text-xs font-medium text-odc-primary underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const stats = normalizeStats(rawData);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard
        label="Total formations"
        value={stats.total}
        icon={BookOpen}
        tone="primary"
        hint="Toutes catégories"
      />
      <StatCard
        label="Publiées"
        value={stats.published}
        icon={Eye}
        tone="success"
        hint="Visibles sur le site"
      />
      <StatCard
        label="Brouillons"
        value={stats.draft}
        icon={FileEdit}
        tone="muted"
        hint="En attente"
      />
      <StatCard
        label="Sessions"
        value={stats.totalSessions}
        icon={Calendar}
        tone="info"
        hint="Toutes formations"
      />
      <StatCard
        label="Inscriptions"
        value={stats.totalInscriptions}
        icon={Users}
        tone="warning"
        hint="Toutes sessions"
      />
    </div>
  );
}