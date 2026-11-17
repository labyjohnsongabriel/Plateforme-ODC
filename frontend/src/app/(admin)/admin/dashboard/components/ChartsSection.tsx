// src/app/(admin)/admin/dashboard/components/ChartsSection.tsx
'use client';

import { CalendarClock, Layers, PieChart, TrendingUp, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { PanelCard } from '@/components/dashboard/PanelCard';
import { AreaChartODC } from '@/components/charts/AreaChartODC';
import { BarChartODC } from '@/components/charts/BarChartODC';
import { ChartEmpty } from '@/components/charts/ChartEmpty';
import { DonutChartODC } from '@/components/charts/DonutChartODC';
import {
  buildChartSummary,
  formatNumber,
  formatPercent,
  getRoleColor,
  getStatutMeta,
  resolveColor,
} from '@/lib/chart-theme';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { cn } from '@/lib/utils';

/* ============================================================================
   HELPERS — mois « 2025-11 » → « nov. 25 » / « novembre 2025 »
   ============================================================================ */

const MONTH_PATTERN = /^(\d{4})-(\d{2})/;
const shortMonth = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' });
const longMonth = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });

function parseMonth(value: string): Date | null {
  const match = MONTH_PATTERN.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, 1) : null;
}

const formatMonthShort = (value: string): string => {
  const date = parseMonth(value);
  return date ? shortMonth.format(date) : value;
};

const formatMonthLong = (value: string): string => {
  const date = parseMonth(value);
  return date ? longMonth.format(date) : value;
};

/* ============================================================================
   SESSIONS PAR STATUT — barre proportionnelle empilée + légende détaillée
   Design : segment hover, séparateurs nets, pourcentages alignés.
   ============================================================================ */

function SessionsStatusBreakdown({
  items,
}: {
  items: Array<{ statut: string; count: number }>;
}) {
  const rows = items
    .map((item) => ({ ...getStatutMeta(item.statut), value: Number(item.count) }))
    .sort((a, b) => b.value - a.value);
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  if (total === 0) return <ChartEmpty height={240} />;

  return (
    <div>
      {/* Total — chiffre principal proéminent */}
      <div className="flex items-baseline gap-2">
        <p className="font-display text-4xl font-bold tabular-nums text-foreground">
          {formatNumber(total)}
        </p>
        <span className="text-sm font-normal text-muted-foreground">
          {total > 1 ? 'sessions' : 'session'}
        </span>
      </div>

      {/* Barre proportionnelle empilée (segments avec séparateur) */}
      <div
        role="img"
        aria-label={buildChartSummary(
          'Répartition des sessions par statut',
          rows.map((row) => ({ name: row.label, value: row.value })),
        )}
        className="mt-5 flex h-3.5 w-full gap-1 overflow-hidden rounded-full bg-muted"
      >
        {rows
          .filter((row) => row.value > 0)
          .map((row) => (
            <div
              key={row.label}
              title={`${row.label} : ${formatNumber(row.value)} (${formatPercent(row.value / total)})`}
              className="h-full cursor-default transition-opacity hover:opacity-80 first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${(row.value / total) * 100}%`,
                backgroundColor: row.color,
              }}
            />
          ))}
      </div>

      {/* Légende détaillée — puces avec ring pour séparation */}
      <ul className="mt-5 space-y-0 divide-y divide-border/60">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center gap-3 py-3 text-sm transition-colors hover:bg-muted/30 -mx-2 px-2 rounded-md"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-background"
              style={{ backgroundColor: row.color }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate text-foreground/90">{row.label}</span>
            <span className="font-semibold tabular-nums text-foreground">
              {formatNumber(row.value)}
            </span>
            <span className="w-14 text-right text-xs tabular-nums text-muted-foreground">
              {formatPercent(row.value / total)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================================
   SKELETON — mêmes proportions que le contenu final
   ============================================================================ */

function ChartsSkeleton() {
  return (
    <div
      className="grid gap-6 lg:grid-cols-2"
      aria-busy="true"
      aria-label="Chargement des graphiques"
    >
      {/* Carte large */}
      <Skeleton className="h-[460px] rounded-xl lg:col-span-2" />
      {/* Cartes standard */}
      <Skeleton className="h-[420px] rounded-xl" />
      <Skeleton className="h-[420px] rounded-xl" />
      <Skeleton className="h-[420px] rounded-xl" />
      <Skeleton className="h-[420px] rounded-xl" />
    </div>
  );
}

/* ============================================================================
   KPI INLINE — affichage compact dans l'en-tête de la carte
   ============================================================================ */

function InlineKpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-right">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="font-display text-lg font-bold tabular-nums text-foreground">
        {formatNumber(value)}
      </dd>
    </div>
  );
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function ChartsSection() {
  const { data, isLoading, isError, isFetching, refetch } = useAdminDashboard();

  if (isLoading) return <ChartsSkeleton />;

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

  /* -------------------- Données -------------------- */
  const monthly = data.inscriptionsParMois.map((m) => ({
    mois: m.mois,
    count: Number(m.count),
  }));
  const monthlyTotal = monthly.reduce((sum, m) => sum + m.count, 0);
  const monthlyAverage = monthly.length > 0 ? Math.round(monthlyTotal / monthly.length) : 0;

  const usersByRole = data.usersByRole.map((r) => ({
    name: r.role,
    value: Number(r.count),
    color: getRoleColor(r.role),
  }));

  const formationsByDomaine = data.formationsByDomaine
    .map((d, index) => ({
      name: d.domaine,
      value: Number(d.count),
      color: resolveColor(d.couleur, index),
    }))
    .sort((a, b) => b.value - a.value);

  const topFormations = data.topFormations
    .map((f) => ({ name: f.titre, value: Number(f.inscriptions) }))
    .sort((a, b) => b.value - a.value);

  return (
    <section
      aria-label="Graphiques"
      className={cn(
        'grid gap-6 lg:grid-cols-2',
        // Cohérence verticale : toutes les cartes ont une hauteur similaire
        '[&>div]:min-h-[420px]',
      )}
    >
      {/* 1. Évolution mensuelle — carte promue -------------------------- */}
      <PanelCard
        className="lg:col-span-2"
        title="Évolution des inscriptions"
        description="Nombre d’inscriptions au cours des 12 derniers mois"
        icon={TrendingUp}
        action={
          monthly.length > 0 ? (
            <dl className="flex items-start gap-6">
              <InlineKpi label="Total" value={monthlyTotal} />
              <div className="h-8 w-px bg-border/60" aria-hidden="true" />
              <InlineKpi label="Moy. / mois" value={monthlyAverage} />
            </dl>
          ) : undefined
        }
      >
        {monthly.length > 0 ? (
          <AreaChartODC
            data={monthly}
            xKey="mois"
            series={[{ dataKey: 'count', name: 'Inscriptions' }]}
            height={320}
            ariaLabel="Évolution mensuelle des inscriptions"
            xTickFormatter={formatMonthShort}
            tooltipLabelFormatter={formatMonthLong}
          />
        ) : (
          <ChartEmpty height={320} />
        )}
      </PanelCard>

      {/* 2. Répartition par rôle — carte 1/2 ---------------------------- */}
      <PanelCard
        title="Répartition par rôle"
        description="Utilisateurs actifs"
        icon={PieChart}
      >
        {usersByRole.length > 0 ? (
          <DonutChartODC
            data={usersByRole}
            height={280}
            centerLabel="Utilisateurs"
            ariaLabel="Répartition des utilisateurs par rôle"
          />
        ) : (
          <ChartEmpty />
        )}
      </PanelCard>

      {/* 3. Sessions par statut — carte 1/2 ---------------------------- */}
      <PanelCard
        title="Sessions par statut"
        description="Nombre de sessions pour chaque statut"
        icon={CalendarClock}
      >
        {data.sessionsParStatut.length > 0 ? (
          <SessionsStatusBreakdown items={data.sessionsParStatut} />
        ) : (
          <ChartEmpty />
        )}
      </PanelCard>

      {/* 4. Formations par domaine — carte 1/2 ------------------------- */}
      <PanelCard
        title="Formations par domaine"
        description="Catalogue complet"
        icon={Layers}
      >
        {formationsByDomaine.length > 0 ? (
          <BarChartODC
            data={formationsByDomaine}
            series={[
              {
                dataKey: 'value',
                name: 'Formations',
                color: 'hsl(var(--chart-1))',
              },
            ]}
            layout="vertical"
            height={280}
            ariaLabel="Nombre de formations par domaine"
          />
        ) : (
          <ChartEmpty />
        )}
      </PanelCard>

      {/* 5. Top 5 formations — carte 1/2 ------------------------------- */}
      <PanelCard
        title="Top 5 formations"
        description="Par nombre d’inscriptions"
        icon={Trophy}
      >
        {topFormations.length > 0 ? (
          <BarChartODC
            data={topFormations}
            series={[
              {
                dataKey: 'value',
                name: 'Inscriptions',
                color: 'hsl(var(--chart-2))',
              },
            ]}
            layout="vertical"
            height={280}
            ariaLabel="Top des formations par nombre d’inscriptions"
          />
        ) : (
          <ChartEmpty />
        )}
      </PanelCard>
    </section>
  );
}