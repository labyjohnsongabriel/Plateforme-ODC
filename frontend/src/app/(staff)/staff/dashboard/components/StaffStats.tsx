// src/app/(staff)/staff/dashboard/components/StaffStats.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  BookOpen,
  Handshake,
  ListChecks,
  TrendingUp,
  ArrowUpRight,
  Award,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { dashboardApi, type StaffStats as StaffStatsType } from '@/lib/dashboard.api';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

type Tone = 'primary' | 'warning' | 'success' | 'info' | 'purple' | 'neutral';

interface KpiCard {
  label: string;
  value: number | string;
  icon: React.ElementType;
  tone: Tone;
  href?: string;
  trend?: 'up' | 'flat';
  trendValue?: string;
  hint?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   TONES — light + dark explicites
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
   HELPER — Extraction sûre
   ═══════════════════════════════════════════════════════════════════════════ */

function toNum(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  const n = Number(value);
  return isNaN(n) ? fallback : n;
}

function toNumOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

function extractStats(raw: any): StaffStatsType {
  const payload = raw?.kpis ?? raw?.data ?? raw ?? {};

  return {
    inscriptionsEnAttente: toNum(payload.inscriptionsEnAttente ?? payload.enAttente),
    inscriptionsAcceptees: toNum(payload.inscriptionsAcceptees ?? payload.acceptees),
    inscriptionsRefusees: toNum(payload.inscriptionsRefusees ?? payload.refusees),
    inscriptionsDuJour: toNum(payload.inscriptionsDuJour),
    totalInscriptions: toNum(payload.totalInscriptions),
    tauxPresenceMoyen: toNumOrNull(payload.tauxPresenceMoyen ?? payload.tauxPresence),
    totalPresences: toNum(payload.totalPresences ?? payload.presences),
    sessionsActives: toNum(payload.sessionsActives ?? payload.sessionsEnCours),
    sessionsOuvertes: toNum(payload.sessionsOuvertes),
    totalSessions: toNum(payload.totalSessions),
    formationsPubliees: toNum(payload.formationsPubliees),
    totalFormations: toNum(payload.totalFormations),
    totalPartenaires: toNum(payload.totalPartenaires),
    totalUsers: toNum(payload.totalUsers),
    totalAttestations: toNum(payload.totalAttestations),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function StaffStats() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery<StaffStatsType | null>({
    queryKey: ['staff', 'dashboard', 'stats'],
    queryFn: async () => {
      // ✅ endpoint unifié + fallback
      const me = await dashboardApi.getMyStats<StaffStatsType>();
      if (me) return me;
      const fallback = await dashboardApi.getStaffStats();
      return fallback ? extractStats(fallback) : null;
    },
    staleTime: 30_000,
  });

  /* 🔍 DIAGNOSTIC */
  // if (data) console.log('🔍 StaffStats:', data);

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="mb-4 h-11 w-11 rounded-xl" />
              <Skeleton className="mb-2 h-8 w-20" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  /* ─── Erreur ─── */
  if (isError || !data) {
    return (
      <QueryErrorState
        onRetry={() => void refetch()}
        isRetrying={isFetching}
        description="Impossible de charger les statistiques du tableau de bord."
      />
    );
  }

  /* ─── Cartes ─── */
  const cards: KpiCard[] = [
    {
      label: 'Inscriptions en attente',
      value: data.inscriptionsEnAttente,
      icon: Clock,
      tone: 'warning',
      href: '/staff/selections',
      trend: data.inscriptionsEnAttente > 0 ? 'up' : 'flat',
      trendValue: data.inscriptionsEnAttente > 0 ? 'À traiter' : 'Aucune',
      hint: 'Candidatures à valider',
    },
    {
      label: 'Sessions actives',
      value: data.sessionsActives,
      icon: Calendar,
      tone: 'info',
      href: '/staff/sessions',
      hint: 'En cours ou ouvertes',
    },
    {
      label: 'Inscriptions du jour',
      value: data.inscriptionsDuJour,
      icon: Users,
      tone: 'primary',
      href: '/staff/selections',
      hint: "Aujourd'hui",
    },
    {
      label: 'Taux de présence',
      value: data.tauxPresenceMoyen == null ? '—' : `${data.tauxPresenceMoyen}%`,
      icon: CheckCircle2,
      tone:
        data.tauxPresenceMoyen == null
          ? 'neutral'
          : data.tauxPresenceMoyen >= 75
            ? 'success'
            : 'warning',
      href: '/staff/presences',
      hint: 'Moyenne globale',
    },
    {
      label: 'Sessions au total',
      value: data.totalSessions,
      icon: Calendar,
      tone: 'info',
      href: '/staff/sessions',
      hint: 'Toutes périodes',
    },
    {
      label: 'Sessions ouvertes',
      value: data.sessionsOuvertes,
      icon: ListChecks,
      tone: 'primary',
      href: '/staff/sessions',
      hint: 'Acceptent inscriptions',
    },
    {
      label: 'Formations publiées',
      value: data.formationsPubliees,
      icon: BookOpen,
      tone: 'primary',
      href: '/staff/formations',
      hint: 'Catalogue actif',
    },
    {
      label: 'Partenaires',
      value: data.totalPartenaires,
      icon: Handshake,
      tone: 'purple',
      href: '/staff/partenaires',
      hint: 'Partenariats actifs',
    },
    {
      label: 'Inscriptions acceptées',
      value: data.inscriptionsAcceptees,
      icon: CheckCircle2,
      tone: 'success',
      href: '/staff/selections',
      hint: 'Validées',
    },
    {
      label: 'Présences enregistrées',
      value: data.totalPresences,
      icon: GraduationCap,
      tone: 'info',
      href: '/staff/presences',
      hint: 'Total pointages',
    },
    {
      label: 'Utilisateurs',
      value: data.totalUsers,
      icon: Users,
      tone: 'info',
      href: '/staff/utilisateurs',
      hint: 'Comptes actifs',
    },
    {
      label: 'Attestations',
      value: data.totalAttestations,
      icon: Award,
      tone: 'purple',
      href: '/staff/attestations',
      hint: 'Générées',
    },
  ];

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
            <span
              aria-hidden="true"
              className={cn(
                'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
                tone.bar,
                'opacity-60 transition-opacity duration-300 group-hover:opacity-100',
              )}
            />

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

              {c.trend === 'up' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
                  <TrendingUp className="h-2.5 w-2.5" aria-hidden="true" />
                  {c.trendValue}
                </span>
              )}

              {c.trend === 'flat' && c.trendValue && (
                <span className="text-[10px] font-medium text-muted-foreground">
                  {c.trendValue}
                </span>
              )}
            </div>

            <p
              className={cn(
                'mb-1 font-display text-3xl font-bold tabular-nums tracking-tight',
                isEmpty ? 'text-muted-foreground/60' : 'text-foreground',
              )}
            >
              {c.value}
            </p>

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
          <Link key={c.label} href={c.href} className={wrapperClass} style={{ animationDelay: `${i * 50}ms` }}>
            {content}
          </Link>
        ) : (
          <div key={c.label} className={wrapperClass} style={{ animationDelay: `${i * 50}ms` }}>
            {content}
          </div>
        );
      })}
    </div>
  );
}