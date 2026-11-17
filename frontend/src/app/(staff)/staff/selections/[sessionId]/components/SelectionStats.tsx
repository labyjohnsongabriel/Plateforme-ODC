  // src/app/(staff)/staff/selections/[sessionId]/components/SelectionStats.tsx
  'use client';

  import {
    Users,
    CheckCircle2,
    XCircle,
    Hourglass,
    ListChecks,
    TrendingUp,
    AlertCircle,
  } from 'lucide-react';
  import { Card, CardContent } from '@/components/ui/card';
  import { cn } from '@/lib/utils';

  interface SelectionStatsData {
    total?: number;
    enAttente?: number;
    acceptees?: number;
    acceptes?: number;
    refusees?: number;
    refuses?: number;
    listeAttente?: number;
    capacite?: number;
    placesRestantes?: number;
    tauxRemplissage?: number;
  }

  interface Props {
    sessionId: string;
    stats?: SelectionStatsData | null;
  }

  type Tone = 'primary' | 'warning' | 'success' | 'error' | 'info' | 'purple';

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
    error: {
      iconBg: 'bg-red-50 dark:bg-red-500/10',
      iconColor: 'text-red-700 dark:text-red-300',
      ring: 'ring-red-200 dark:ring-red-500/30',
      bar: 'from-red-400 to-red-600',
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
  };

  export function SelectionStats({ stats }: Props) {
    const total = stats?.total ?? 0;
    const enAttente = stats?.enAttente ?? 0;
    const acceptees = stats?.acceptees ?? stats?.acceptes ?? 0;
    const refusees = stats?.refusees ?? stats?.refuses ?? 0;
    const listeAttente = stats?.listeAttente ?? 0;
    const capacite = stats?.capacite ?? 0;
    const placesRestantes = stats?.placesRestantes ?? 0;
    const tauxRemplissage =
      stats?.tauxRemplissage ??
      (capacite > 0 ? Math.round((acceptees / capacite) * 100) : 0);

    const cards = [
      {
        label: 'Total candidats',
        value: total,
        icon: Users,
        tone: 'primary' as Tone,
        hint: `${capacite} places disponibles`,
      },
      {
        label: 'En attente',
        value: enAttente,
        icon: Hourglass,
        tone: 'warning' as Tone,
        hint: enAttente > 0 ? 'À traiter' : 'Aucun',
      },
      {
        label: 'Acceptés',
        value: acceptees,
        icon: CheckCircle2,
        tone: 'success' as Tone,
        hint: `${placesRestantes} place${placesRestantes > 1 ? 's' : ''} restante${placesRestantes > 1 ? 's' : ''}`,
      },
      {
        label: 'Refusés',
        value: refusees,
        icon: XCircle,
        tone: 'error' as Tone,
      },
      ...(listeAttente > 0
        ? [
            {
              label: "Liste d'attente",
              value: listeAttente,
              icon: ListChecks,
              tone: 'info' as Tone,
            },
          ]
        : []),
    ];

    return (
      <div className="space-y-4">
        {/* Barre de progression */}
        {capacite > 0 && (
          <Card>
            <CardContent className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span className="text-sm font-semibold text-foreground">
                    Taux de remplissage
                  </span>
                </div>
                <span className="font-mono text-sm font-bold tabular-nums text-primary">
                  {acceptees} / {capacite} ({tauxRemplissage}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full bg-gradient-to-r transition-all duration-500',
                    tauxRemplissage >= 100
                      ? 'from-emerald-400 to-emerald-600'
                      : tauxRemplissage >= 75
                        ? 'from-primary to-primary/60'
                        : tauxRemplissage >= 50
                          ? 'from-amber-400 to-amber-600'
                          : 'from-red-400 to-red-600',
                  )}
                  style={{ width: `${Math.min(tauxRemplissage, 100)}%` }}
                  role="progressbar"
                  aria-valuenow={tauxRemplissage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Taux de remplissage"
                />
              </div>
              {tauxRemplissage >= 100 && (
                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  Capacité maximale atteinte
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Grille */}
        <div
          className={cn(
            'grid gap-3',
            cards.length === 5
              ? 'sm:grid-cols-2 lg:grid-cols-5'
              : 'sm:grid-cols-2 lg:grid-cols-4',
          )}
        >
          {cards.map((c) => {
            const Icon = c.icon;
            const tone = TONES[c.tone];
            return (
              <Card
                key={c.label}
                className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
                    tone.bar,
                    'opacity-60 transition-opacity duration-300 group-hover:opacity-100',
                  )}
                />
                <CardContent className="p-4 pt-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110',
                        tone.iconBg,
                        tone.iconColor,
                        tone.ring,
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {c.label}
                      </p>
                      <p className="mt-0.5 font-display text-2xl font-bold tabular-nums leading-none text-foreground">
                        {c.value}
                      </p>
                      {c.hint && (
                        <p className="mt-1 truncate text-[11px] text-muted-foreground">
                          {c.hint}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }