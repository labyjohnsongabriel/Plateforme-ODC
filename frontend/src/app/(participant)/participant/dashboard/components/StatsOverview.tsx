// src/app/(participant)/participant/dashboard/components/StatsOverview.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Award,
  TrendingUp,
  CheckCircle2,
  Clock,
  UserCheck,
  XCircle,
  Hourglass,
  Ban,
  Percent,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { dashboardApi, type ParticipantStats } from '@/lib/dashboard.api';
import { cn } from '@/lib/utils';

/* ============================================================================
   TYPES
   ============================================================================ */

type Tone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'neutral';

interface KpiCard {
  label: string;
  value: number | string;
  subtitle: string;
  icon: React.ElementType;
  tone: Tone;
  highlight?: boolean;
}

/* ============================================================================
   TONES — variantes light + dark explicites, tokens shadcn
   ============================================================================ */

const TONES: Record<
  Tone,
  {
    iconBg: string;
    iconColor: string;
    ring: string;
    bar: string;
    valueColor: string;
  }
> = {
  primary: {
    iconBg: 'bg-primary/10 dark:bg-primary/15',
    iconColor: 'text-primary',
    ring: 'ring-primary/20',
    bar: 'from-primary to-primary/60',
    valueColor: 'text-primary',
  },
  success: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-200 dark:ring-emerald-500/30',
    bar: 'from-emerald-400 to-emerald-600',
    valueColor: 'text-emerald-700 dark:text-emerald-300',
  },
  warning: {
    iconBg: 'bg-amber-50 dark:bg-amber-500/10',
    iconColor: 'text-amber-700 dark:text-amber-300',
    ring: 'ring-amber-200 dark:ring-amber-500/30',
    bar: 'from-amber-400 to-amber-600',
    valueColor: 'text-amber-700 dark:text-amber-300',
  },
  error: {
    iconBg: 'bg-red-50 dark:bg-red-500/10',
    iconColor: 'text-red-700 dark:text-red-300',
    ring: 'ring-red-200 dark:ring-red-500/30',
    bar: 'from-red-400 to-red-600',
    valueColor: 'text-red-700 dark:text-red-300',
  },
  info: {
    iconBg: 'bg-sky-50 dark:bg-sky-500/10',
    iconColor: 'text-sky-700 dark:text-sky-300',
    ring: 'ring-sky-200 dark:ring-sky-500/30',
    bar: 'from-sky-400 to-sky-600',
    valueColor: 'text-sky-700 dark:text-sky-300',
  },
  purple: {
    iconBg: 'bg-violet-50 dark:bg-violet-500/10',
    iconColor: 'text-violet-700 dark:text-violet-300',
    ring: 'ring-violet-200 dark:ring-violet-500/30',
    bar: 'from-violet-400 to-violet-600',
    valueColor: 'text-violet-700 dark:text-violet-300',
  },
  neutral: {
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    ring: 'ring-border',
    bar: 'from-border to-border',
    valueColor: 'text-foreground',
  },
};

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function StatsOverview() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery<ParticipantStats | null>({
    queryKey: ['participant', 'dashboard'],
    queryFn: async () => {
      // ✅ /dashboard/me renvoie les stats du rôle courant (Participant ici)
      const me = await dashboardApi.getMyStats<ParticipantStats>();
      if (me) return me;
      // 🔁 Fallback endpoint dédié
      return await dashboardApi.getParticipantStats();
    },
    staleTime: 30_000,
  });

  /* 🔍 DIAGNOSTIC */
  // if (data) console.log('🔍 ParticipantStats:', data);

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 11 }).map((_, i) => (
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
    return <QueryErrorState onRetry={() => void refetch()} isRetrying={isFetching} />;
  }

  /* ⭐ Cartes configurées */
  const cards: KpiCard[] = [
    {
      label: 'Inscriptions',
      value: data.totalInscriptions ?? 0,
      subtitle: 'Toutes vos demandes',
      icon: FileText,
      tone: 'info',
    },
    {
      label: 'Formations en cours',
      value: data.formationsEnCours ?? 0,
      subtitle: 'Actuellement',
      icon: TrendingUp,
      tone: 'primary',
      highlight: (data.formationsEnCours ?? 0) > 0,
    },
    {
      label: 'Formations terminées',
      value: data.formationsTerminees ?? 0,
      subtitle: 'Parcours achevés',
      icon: CheckCircle2,
      tone: 'success',
    },
    {
      label: 'Attestations',
      value: data.attestationsObtenues ?? 0,
      subtitle: 'Obtenues',
      icon: Award,
      tone: 'purple',
      highlight: (data.attestationsObtenues ?? 0) > 0,
    },
    {
      label: 'Inscriptions acceptées',
      value: data.inscriptionsAcceptees ?? 0,
      subtitle: 'Demandes confirmées',
      icon: CheckCircle2,
      tone: 'success',
    },
    {
      label: 'Inscriptions en attente',
      value: data.inscriptionsEnAttente ?? 0,
      subtitle: 'En cours de traitement',
      icon: Clock,
      tone: 'warning',
      highlight: (data.inscriptionsEnAttente ?? 0) > 0,
    },
    {
      label: 'Inscriptions refusées',
      value: data.inscriptionsRefusees ?? 0,
      subtitle: 'Demandes refusées',
      icon: XCircle,
      tone: 'error',
    },
    {
      label: "Liste d'attente",
      value: data.inscriptionsEnListeAttente ?? 0,
      subtitle: 'En attente de place',
      icon: Hourglass,
      tone: 'warning',
    },
    {
      label: 'Inscriptions annulées',
      value: data.inscriptionsAnnulees ?? 0,
      subtitle: 'Demandes annulées',
      icon: Ban,
      tone: 'neutral',
    },
    {
      label: 'Présences enregistrées',
      value: data.totalPresences ?? 0,
      subtitle: 'Nombre de pointages',
      icon: UserCheck,
      tone: 'info',
    },
    {
      label: 'Taux de présence',
      value: data.tauxPresenceMoyen == null ? '—' : `${data.tauxPresenceMoyen}%`,
      subtitle:
        data.tauxPresenceMoyen == null
          ? 'Aucune présence enregistrée'
          : 'Sur vos séances enregistrées',
      icon: Percent,
      tone:
        data.tauxPresenceMoyen == null
          ? 'neutral'
          : data.tauxPresenceMoyen >= 75
            ? 'success'
            : data.tauxPresenceMoyen >= 50
              ? 'warning'
              : 'error',
      highlight: (data.tauxPresenceMoyen ?? 0) >= 75,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        const tone = TONES[c.tone];
        const isEmpty = c.value === 0 || c.value === '—';

        return (
          <Card
            key={c.label}
            className={cn(
              'group relative animate-fade-in overflow-hidden transition-all duration-300',
              'hover:-translate-y-1 hover:border-primary/30 hover:shadow-md',
              c.highlight && 'ring-1 ring-primary/20',
            )}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Barre accent top */}
            <span
              aria-hidden="true"
              className={cn(
                'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
                tone.bar,
                'opacity-60 transition-opacity duration-300 group-hover:opacity-100',
              )}
            />

            <CardContent className="p-5 pt-6">
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

                {c.highlight && !isEmpty && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary ring-1 ring-primary/20 dark:bg-primary/15">
                    <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                    Actif
                  </span>
                )}
              </div>

              <p
                className={cn(
                  'font-display mb-0.5 text-3xl font-bold tabular-nums tracking-tight',
                  isEmpty ? 'text-muted-foreground/60' : tone.valueColor,
                )}
              >
                {c.value}
              </p>

              <p className="truncate text-sm font-semibold text-foreground">
                {c.label}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {c.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}