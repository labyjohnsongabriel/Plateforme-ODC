// src/app/(formateur)/formateur/presences/components/SessionsPresenceSelector.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  QrCode,
  PlayCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Session {
  id: string;
  codeSession: string;
  dateDebut: string;
  dateFin?: string;
  lieu?: string | null;
  capacite: number;
  inscriptionsCount?: number;
  statut: string;
  presenceOuverte?: boolean;
  formation?: { titre: string } | null;
}

interface StatutConfig {
  label: string;
  className: string;
  icon: LucideIcon;
}

const STATUT_CONFIG: Record<string, StatutConfig> = {
  PLANIFIEE: {
    label: 'Planifiée',
    className:
      'bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30',
    icon: Clock,
  },
  OUVERTE: {
    label: 'Ouverte',
    className:
      'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
    icon: CheckCircle2,
  },
  EN_COURS: {
    label: 'En cours',
    className:
      'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
    icon: PlayCircle,
  },
  TERMINEE: {
    label: 'Terminée',
    className:
      'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',
    icon: CheckCircle2,
  },
  ANNULEE: {
    label: 'Annulée',
    className:
      'bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30',
    icon: XCircle,
  },
};

function toSafeArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v.filter((x) => x != null) as T[]) : [];
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function SessionsPresenceSelector() {
  const { data, isLoading, isError } = useQuery<Session[]>({
    queryKey: ['formateur', 'sessions', 'presence'],
    queryFn: async () => {
      const { data } = await api.get('/formateur/sessions');
      return toSafeArray<Session>(data?.data);
    },
  });

  /* ── Loading ────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  /* ── Erreur ─────────────────────────────────────────── */
  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50 p-8 text-center text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-300">
        Impossible de charger les sessions. Réessayez.
      </Card>
    );
  }

  const sessions = (data ?? []).filter((s) =>
    ['OUVERTE', 'EN_COURS', 'PLANIFIEE'].includes(s.statut),
  );

  /* ── Vide ───────────────────────────────────────────── */
  if (!sessions.length) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <EmptyState
          icon={QrCode}
          title="Aucune session active"
          description="Vous n'avez aucune session en cours ou à venir."
        />
      </Card>
    );
  }

  /* ── Rendu principal ────────────────────────────────── */
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((s) => {
        const config = STATUT_CONFIG[s.statut] ?? STATUT_CONFIG.PLANIFIEE;
        const StatutIcon = config.icon;
        const inscrits = s.inscriptionsCount ?? 0;
        const fillPercent =
          s.capacite > 0 ? Math.round((inscrits / s.capacite) * 100) : 0;

        return (
          <Card
            key={s.id}
            className={cn(
              'group flex flex-col overflow-hidden transition-all duration-300',
              'border-slate-200 bg-white',
              'hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg',
              'dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700',
            )}
          >
            {/* Bandeau orange */}
            <div className="h-1.5 bg-gradient-to-r from-orange-500 to-orange-700" />

            <div className="flex flex-1 flex-col p-5">
              {/* Header : code + statut */}
              <div className="mb-3 flex items-start justify-between gap-2">
                <Badge
                  variant="outline"
                  className="border-slate-200 font-mono text-[11px] text-slate-700 dark:border-slate-700 dark:text-slate-300"
                >
                  {s.codeSession}
                </Badge>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                    config.className,
                  )}
                >
                  <StatutIcon className="h-3 w-3" aria-hidden />
                  {config.label}
                </span>
              </div>

              {/* Titre */}
              <h3 className="mb-3 line-clamp-2 min-h-[3rem] font-display font-semibold text-slate-900 transition-colors group-hover:text-orange-600 dark:text-slate-50 dark:group-hover:text-orange-400">
                {s.formation?.titre ?? 'Session de formation'}
              </h3>

              {/* Métadonnées */}
              <div className="mb-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar
                    className="h-3.5 w-3.5 shrink-0 text-orange-600 dark:text-orange-400"
                    aria-hidden
                  />
                  <span className="truncate">
                    {formatDate(s.dateDebut)}
                    {s.dateFin && s.dateFin !== s.dateDebut
                      ? ` → ${formatDate(s.dateFin)}`
                      : ''}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <MapPin
                    className="h-3.5 w-3.5 shrink-0 text-orange-600 dark:text-orange-400"
                    aria-hidden
                  />
                  <span className="truncate">{s.lieu || 'En ligne'}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Users
                    className="h-3.5 w-3.5 shrink-0 text-orange-600 dark:text-orange-400"
                    aria-hidden
                  />
                  <span>
                    {inscrits} / {s.capacite} inscrits
                  </span>
                </div>
              </div>

              {/* Barre de remplissage */}
              <div className="mb-4">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      fillPercent >= 90
                        ? 'bg-red-500'
                        : fillPercent >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500',
                    )}
                    style={{ width: `${Math.min(fillPercent, 100)}%` }}
                    role="progressbar"
                    aria-valuenow={fillPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${fillPercent}% rempli`}
                  />
                </div>
                <p className="mt-1 text-right text-[10px] text-slate-500 dark:text-slate-400">
                  {fillPercent}% rempli
                </p>
              </div>

              {/* Indicateur "présences ouvertes" */}
              {s.presenceOuverte && (
                <div className="mb-4 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:ring-emerald-500/30">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    Présences ouvertes
                  </span>
                </div>
              )}

              {/* Bouton */}
              <Button
                variant="primary"
                size="md"
                className="mt-auto w-full rounded-lg"
                asChild
              >
                <Link href={`/formateur/presences/${s.id}`}>
                  <PlayCircle className="mr-2 h-4 w-4" aria-hidden />
                  Ouvrir la session
                  <ArrowRight className="ml-2 h-3.5 w-3.5" aria-hidden />
                </Link>
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}