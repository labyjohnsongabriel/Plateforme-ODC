// src/app/(admin)/admin/dashboard/components/StatsOverview.tsx
'use client';

import {
  Award,
  BookOpen,
  Calendar,
  ClipboardList,
  Handshake,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { TrendChip } from '@/components/dashboard/TrendChip';
import { TONES, type Tone } from '@/components/dashboard/tones';
import { formatNumber, formatPercent } from '@/lib/chart-theme';
import { cn } from '@/lib/utils';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

/* ============================================================================
   PRIMITIVES
   ============================================================================ */

interface Ratio {
  label: string;
  value: number;
  total: number;
  tone?: Tone;
}

/** Jauge « part du total » : chiffre + pourcentage + barre (role="meter"). */
function MeterBar({ label, value, total, tone }: Ratio & { tone: Tone }) {
  const ratio = total > 0 ? Math.min(Math.max(value / total, 0), 1) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs">
        <span className="text-odc-text-secondary">{label}</span>
        <span className="tabular-nums text-odc-muted">
          <span className="font-semibold text-odc-text">{formatNumber(value)}</span>
          {' · '}
          {formatPercent(ratio)}
        </span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={value}
        className="h-1.5 overflow-hidden rounded-full bg-odc-surface-alt"
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-500', TONES[tone].bar)}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

/** Anneau de progression (taux de présence). */
function RingGauge({ percent, label }: { percent: number; label: string }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(percent, 0), 100);

  return (
    <svg
      viewBox="0 0 44 44"
      className="h-12 w-12 shrink-0 -rotate-90"
      role="img"
      aria-label={`${label} : ${clamped} %`}
    >
      <circle cx="22" cy="22" r={radius} fill="none" strokeWidth="5" style={{ stroke: 'var(--odc-surface-alt)' }} />
      <circle
        cx="22"
        cy="22"
        r={radius}
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - clamped / 100)}
        style={{ stroke: 'var(--odc-success)', transition: 'stroke-dashoffset 600ms ease' }}
      />
    </svg>
  );
}

/* ============================================================================
   CARTES
   ============================================================================ */

interface Kpi {
  key: string;
  label: string;
  value: number;
  icon: LucideIcon;
  tone: Tone;
  trend?: number;
  ratios: Ratio[];
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;

  return (
    <Card className="border-odc-border bg-odc-surface">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', TONES[kpi.tone].chip)}
              aria-hidden="true"
            >
              <Icon className="h-5 w-5" />
            </span>
            <p className="truncate text-sm font-medium text-odc-text-secondary">{kpi.label}</p>
          </div>
          {typeof kpi.trend === 'number' && <TrendChip value={kpi.trend} />}
        </div>

        <p className="mt-4 font-display text-4xl font-bold tracking-tight tabular-nums text-odc-text">
          {formatNumber(kpi.value)}
        </p>

        {kpi.ratios.length > 0 && (
          <div className="mt-5 space-y-3 border-t border-odc-border pt-4">
            {kpi.ratios.map((ratio) => (
              <MeterBar key={ratio.label} {...ratio} tone={ratio.tone ?? kpi.tone} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CompactStatProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone: Tone;
  /** 0..100 — affiche un anneau si défini */
  ring?: number | null;
}

function CompactStat({ label, value, hint, icon: Icon, tone, ring }: CompactStatProps) {
  return (
    <Card className="border-odc-border bg-odc-surface">
      <CardContent className="flex items-center gap-4 p-4">
        <span
          className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', TONES[tone].chip)}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm text-odc-muted">{label}</p>
          <p className="font-display text-2xl font-bold tabular-nums text-odc-text">{value}</p>
          {hint && <p className="text-xs text-odc-muted">{hint}</p>}
        </div>

        {typeof ring === 'number' && <RingGauge percent={ring} label={label} />}
      </CardContent>
    </Card>
  );
}

/* ============================================================================
   SKELETON — mêmes dimensions que le rendu final (aucun saut de mise en page)
   ============================================================================ */

function StatsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement des indicateurs">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[212px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[92px] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function StatsOverview() {
  const { data, isLoading, isError, isFetching, refetch } = useAdminDashboard();

  if (isLoading) return <StatsSkeleton />;

  if (isError || !data) {
    return (
      <QueryErrorState
        onRetry={() => {
          void refetch();
        }}
        isRetrying={isFetching}
      />
    );
  }

  const { kpis, trends } = data;

  const primary: Kpi[] = [
    {
      key: 'users',
      label: 'Utilisateurs',
      value: kpis.totalUsers,
      icon: Users,
      tone: 'info',
      trend: trends.users,
      ratios: [{ label: 'Comptes actifs', value: kpis.usersActifs, total: kpis.totalUsers }],
    },
    {
      key: 'formations',
      label: 'Formations',
      value: kpis.totalFormations,
      icon: BookOpen,
      tone: 'primary',
      trend: trends.formations,
      ratios: [{ label: 'Formations publiées', value: kpis.formationsPubliees, total: kpis.totalFormations }],
    },
    {
      key: 'sessions',
      label: 'Sessions',
      value: kpis.totalSessions,
      icon: Calendar,
      tone: 'success',
      trend: trends.sessions,
      ratios: [
        { label: 'Sessions ouvertes', value: kpis.sessionsOuvertes, total: kpis.totalSessions },
        { label: 'Sessions en cours', value: kpis.sessionsEnCours, total: kpis.totalSessions },
      ],
    },
    {
      key: 'inscriptions',
      label: 'Inscriptions',
      value: kpis.totalInscriptions,
      icon: ClipboardList,
      tone: 'primary',
      trend: trends.inscriptions,
      ratios: [
        {
          label: 'En attente de validation',
          value: kpis.inscriptionsEnAttente,
          total: kpis.totalInscriptions,
          tone: 'warning',
        },
      ],
    },
  ];

  const presence = kpis.tauxPresenceMoyen;

  return (
    <section aria-label="Indicateurs clés" className="space-y-4">
      <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {primary.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

      <div className="stagger grid gap-4 sm:grid-cols-3">
        <CompactStat
          label="Attestations délivrées"
          value={formatNumber(kpis.totalAttestations)}
          icon={Award}
          tone="purple"
        />
        <CompactStat
          label="Partenaires"
          value={formatNumber(kpis.totalPartenaires)}
          icon={Handshake}
          tone="info"
        />
        <CompactStat
          label="Taux de présence moyen"
          value={presence == null ? '—' : `${formatNumber(presence)} %`}
          hint={presence == null ? 'Aucune donnée de présence' : undefined}
          icon={UserCheck}
          tone="success"
          ring={presence}
        />
      </div>
    </section>
  );
}