// src/app/(formateur)/formateur/dashboard/components/StatsOverview.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Users,
  TrendingUp,
  Award,
  Clock,
  CalendarDays,
  CheckCircle2,
  ArrowUpRight,
  TrendingDown,
  Minus,
  UserCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { dashboardApi, type FormateurStats } from '@/lib/dashboard.api';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

type Tone =
  | 'primary'
  | 'warning'
  | 'success'
  | 'info'
  | 'purple'
  | 'neutral';

interface KpiCard {
  label: string;
  value: number | string;
  icon: React.ElementType;
  tone: Tone;
  href?: string;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  hint?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   TONES — variantes light + dark explicites (copie conforme Staff)
   ═══════════════════════════════════════════════════════════════════════════ */

const TONES: Record<
  Tone,
  { iconBg: string; iconColor: string; ring: string; bar: string }
> = {
  primary: {
    iconBg: 'bg-primary/10 dark:bg-primary/15',
    iconColor: 'text-primary',
    ring: 'ring-primary/20',
    bar: 'from-primary to-primary/60',
  },
  warning: {
    iconBg: 'bg-amber-50 dark:bg-amber-500/10',
    iconColor: 'text-amber-700 dark:text-amber-300',
    ring: 'ring-amber-200 dark:ring-amber-500/30',
    bar: 'from-amber-400 to-amber-600',
  },
  success: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-200 dark:ring-emerald-500/30',
    bar: 'from-emerald-400 to-emerald-600',
  },
  info: {
    iconBg: 'bg-sky-50 dark:bg-sky-500/10',
    iconColor: 'text-sky-700 dark:text-sky-300',
    ring: 'ring-sky-200 dark:ring-sky-500/30',
    bar: 'from-sky-400 to-sky-600',
  },
  purple: {
    iconBg: 'bg-violet-50 dark:bg-violet-500/10',
    iconColor: 'text-violet-700 dark:text-violet-300',
    ring: 'ring-violet-200 dark:ring-violet-500/30',
    bar: 'from-violet-400 to-violet-600',
  },
  neutral: {
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    ring: 'ring-border',
    bar: 'from-border to-border',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER — Badge de tendance (style Staff)
   ═══════════════════════════════════════════════════════════════════════════ */

function TrendBadge({
  direction,
  value,
}: {
  direction: 'up' | 'down' | 'flat';
  value: string;
}) {
  const Icon =
    direction === 'up'
      ? ArrowUpRight
      : direction === 'down'
        ? TrendingDown
        : Minus;

  const className =
    direction === 'up'
      ? 'text-emerald-700 bg-emerald-50 ring-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:ring-emerald-500/30'
      : direction === 'down'
        ? 'text-amber-700 bg-amber-50 ring-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:ring-amber-500/30'
        : 'text-muted-foreground bg-muted ring-border';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1',
        className,
      )}
    >
      <Icon className="h-2.5 w-2.5" aria-hidden="true" />
      {value}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function StatsOverview() {
  const { data, isLoading, isError, isFetching, refetch } =
    useQuery<FormateurStats | null>({
      queryKey: ['formateur', 'dashboard'],
      queryFn: async () => {
        const me = await dashboardApi.getMyStats<FormateurStats>();
        if (me) return me;
        return await dashboardApi.getFormateurStats();
      },
      staleTime: 30_000,
    });

  /* 🔍 DIAGNOSTIC */
  // if (data) console.log('🔍 FormateurStats:', data);

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="mb-4 h-11 w-11 rounded-xl" />
              <Skeleton className="mb-2 h-8 w-20" />
              <Skeleton className="mb-1 h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  /* ─── Erreur ─── */
  if (isError || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <QueryErrorState
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
        </CardContent>
      </Card>
    );
  }

  /* ─── Construction des cartes (style Staff) ─── */
  const taux = data.tauxPresenceMoyen;

  const cards: KpiCard[] = [
    {
      label: 'Mes sessions',
      value: data.totalSessions ?? 0,
      icon: Calendar,
      tone: 'primary',
      href: '/formateur/sessions',
      trend:
        (data.sessionsEnCours ?? 0) > 0 ? 'up' : 'flat',
      trendValue:
        (data.sessionsEnCours ?? 0) > 0
          ? `${data.sessionsEnCours} en cours`
          : undefined,
      hint: 'Toutes vos sessions',
    },
    {
      label: 'Participants',
      value: data.totalParticipants ?? 0,
      icon: Users,
      tone: 'info',
      href: '/formateur/sessions',
      hint: 'Inscriptions acceptées',
    },
    {
      label: 'Taux de présence',
      value: taux == null ? '—' : `${Math.round(taux)}%`,
      icon: TrendingUp,
      tone:
        taux == null
          ? 'neutral'
          : taux >= 80
            ? 'success'
            : taux >= 60
              ? 'warning'
              : 'neutral',
      href: '/formateur/presences',
      trend:
        taux == null
          ? undefined
          : taux >= 80
            ? 'up'
            : taux >= 60
              ? 'flat'
              : 'down',
      trendValue:
        taux == null
          ? undefined
          : taux >= 80
            ? 'Excellent'
            : taux >= 60
              ? 'Correct'
              : 'À améliorer',
      hint:
        taux == null
          ? 'Aucune présence enregistrée'
          : 'Moyenne sur vos séances',
    },
    {
      label: 'Sessions terminées',
      value: data.sessionsTerminees ?? 0,
      icon: Award,
      tone: 'purple',
      href: '/formateur/sessions',
      hint: 'Historique',
    },
    {
      label: 'Sessions ouvertes',
      value: data.sessionsOuvertes ?? 0,
      icon: CheckCircle2,
      tone: 'success',
      href: '/formateur/sessions',
      hint: 'Inscriptions possibles',
    },
    {
      label: 'Sessions à venir',
      value: data.sessionsAVenir ?? 0,
      icon: CalendarDays,
      tone: 'info',
      href: '/formateur/sessions',
      hint: 'Planifiées dans le futur',
    },
    {
      label: 'Inscriptions à traiter',
      value: data.inscriptionsEnAttente ?? 0,
      icon: Clock,
      tone:
        (data.inscriptionsEnAttente ?? 0) > 0 ? 'warning' : 'neutral',
      href: '/formateur/sessions',
      trend:
        (data.inscriptionsEnAttente ?? 0) > 0 ? 'down' : 'flat',
      trendValue:
        (data.inscriptionsEnAttente ?? 0) > 0
          ? 'À traiter'
          : undefined,
      hint: 'Toutes vos sessions',
    },
    {
      label: 'Sessions en cours',
      value: data.sessionsEnCours ?? 0,
      icon: UserCheck,
      tone:
        (data.sessionsEnCours ?? 0) > 0 ? 'primary' : 'neutral',
      href: '/formateur/sessions',
      hint: 'Actuellement',
    },
  ];

  /* ─── Rendu principal ─── */
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        const tone = TONES[c.tone];
        const isEmpty = c.value === 0 || c.value === '—';

        const content = (
          <div
            className={cn(
              'group relative h-full overflow-hidden rounded-xl border p-5 transition-all duration-300',
              'border-border bg-card',
              'hover:-translate-y-1 hover:border-primary/30 hover:shadow-md',
            )}
          >
            {/* Bandeau gradient top */}
            <span
              aria-hidden="true"
              className={cn(
                'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
                tone.bar,
                'opacity-60 transition-opacity duration-300 group-hover:opacity-100',
              )}
            />

            {/* Icône + trend */}
            <div className="mb-4 flex items-start justify-between">
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110',
                  tone.iconBg,
                  tone.iconColor,
                  tone.ring,
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>

              {c.trend && c.trendValue && (
                <TrendBadge direction={c.trend} value={c.trendValue} />
              )}
            </div>

            {/* Valeur */}
            <p
              className={cn(
                'mb-1 font-display text-3xl font-bold tabular-nums tracking-tight',
                isEmpty ? 'text-muted-foreground/60' : 'text-foreground',
              )}
            >
              {c.value}
            </p>

            {/* Label + hint + arrow */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {c.label}
                </p>
                {c.hint && (
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {c.hint}
                  </p>
                )}
              </div>
              {c.href && (
                <ArrowUpRight
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all',
                    'group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
                    'group-hover:text-primary group-hover:opacity-100',
                  )}
                />
              )}
            </div>
          </div>
        );

        const wrapperClass = cn(
          'block h-full animate-fade-in rounded-xl',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        );

        return c.href ? (
          <Link
            key={c.label}
            href={c.href}
            className={wrapperClass}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {content}
          </Link>
        ) : (
          <div
            key={c.label}
            className={wrapperClass}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}