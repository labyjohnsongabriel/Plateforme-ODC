// src/app/(partenaire)/partenaire/dashboard/components/StatsOverview.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, Calendar, FileCheck, Award, Library } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { dashboardApi, type PartenaireStats } from '@/lib/dashboard.api';
import { cn } from '@/lib/utils';

interface StatCardConfig {
  label: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  tone: { icon: string; ring: string };
}

export function StatsOverview() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery<PartenaireStats | null>({
    queryKey: ['partenaire', 'dashboard'],
    queryFn: async () => {
      // ✅ /dashboard/me renvoie les stats du rôle courant (Partenaire ici)
      const me = await dashboardApi.getMyStats<PartenaireStats>();
      if (me) return me;
      // 🔁 Fallback sur endpoint dédié
      return await dashboardApi.getPartenaireStats();
    },
  });

  /* 🔍 DIAGNOSTIC — décommentez pour vérifier */
  // if (data) console.log('🔍 PartenaireStats:', data);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <Skeleton className="mb-3 h-11 w-11 rounded-lg" />
            <Skeleton className="mb-2 h-8 w-16" />
            <Skeleton className="mb-1 h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

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

  const cards: StatCardConfig[] = [
    {
      label: 'Formations au total',
      value: data.chiffres?.totalFormations ?? 0,
      subtitle: 'Catalogue ODC',
      icon: BookOpen,
      tone: {
        icon: 'bg-primary/10 text-primary dark:bg-primary/15',
        ring: 'ring-primary/20',
      },
    },
    {
      label: 'Formations publiées',
      value: data.formationsPubliees ?? 0,
      subtitle: 'Catalogue ODC',
      icon: Library,
      tone: {
        icon: 'bg-primary/10 text-primary dark:bg-primary/15',
        ring: 'ring-primary/20',
      },
    },
    {
      label: 'Sessions au total',
      value: data.chiffres?.totalSessions ?? 0,
      subtitle: 'Sessions ODC',
      icon: Calendar,
      tone: {
        icon: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
        ring: 'ring-sky-200 dark:ring-sky-500/30',
      },
    },
    {
      label: 'Sessions publiées',
      value: data.sessionsPubliques ?? 0,
      subtitle: 'Sessions ODC',
      icon: Calendar,
      tone: {
        icon: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
        ring: 'ring-sky-200 dark:ring-sky-500/30',
      },
    },
    {
      label: 'Inscriptions acceptées',
      value: data.chiffres?.totalParticipants ?? 0,
      subtitle: 'Total ODC',
      icon: FileCheck,
      tone: {
        icon: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
        ring: 'ring-emerald-200 dark:ring-emerald-500/30',
      },
    },
    {
      label: 'Attestations émises',
      value: data.chiffres?.totalAttestations ?? 0,
      subtitle: 'Diplômés',
      icon: Award,
      tone: {
        icon: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
        ring: 'ring-violet-200 dark:ring-violet-500/30',
      },
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Indicateurs globaux de la plateforme ODC ; ils ne sont pas attribués à votre
        compte partenaire.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card
              key={c.label}
              className="group animate-fade-in overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <CardContent className="relative p-5">
                <div
                  className={cn(
                    'mb-4 flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110',
                    c.tone.icon,
                    c.tone.ring,
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="font-display mb-0.5 text-3xl font-bold tabular-nums text-foreground">
                  {c.value.toLocaleString('fr-FR')}
                </p>
                <p className="text-sm font-semibold text-foreground">{c.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{c.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(data.parDomaine ?? []).length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Formations par domaine (ODC)
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(data.parDomaine ?? []).map((item) => (
                <li
                  key={item.domaine}
                  className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2"
                >
                  <span className="text-sm text-foreground">{item.domaine}</span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {(item.count ?? 0).toLocaleString('fr-FR')}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}