// src/app/(staff)/staff/dashboard/components/RecentInscriptions.tsx
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Users,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { getMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Inscription {
  id: string;
  statut: string;
  dateInscription?: string;
  prenom?: string;
  nom?: string;
  email?: string;
  photoUrl?: string | null;   // ⭐ photo du candidat
  codeSession?: string;
  formationTitre?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATUTS
   ═══════════════════════════════════════════════════════════════════════════ */

const STATUT_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; className: string; dot: string }
> = {
  EN_ATTENTE: {
    label: 'En attente',
    icon: Clock,
    className:
      'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
    dot: 'bg-amber-500',
  },
  ACCEPTEE: {
    label: 'Acceptée',
    icon: CheckCircle2,
    className:
      'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  REFUSEE: {
    label: 'Refusée',
    icon: XCircle,
    className:
      'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30',
    dot: 'bg-red-500',
  },
  LISTE_ATTENTE: {
    label: "Liste d'attente",
    icon: Clock,
    className:
      'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30',
    dot: 'bg-sky-500',
  },
  ANNULEE: {
    label: 'Annulée',
    icon: XCircle,
    className:
      'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function extractInscriptions(data: unknown): Inscription[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.filter(
      (i): i is Inscription =>
        i != null &&
        typeof i === 'object' &&
        'id' in i &&
        typeof (i as any).id === 'string',
    );
  }
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['inscriptions', 'data', 'items', 'results']) {
      const arr = obj[key];
      if (Array.isArray(arr)) {
        return arr.filter(
          (i): i is Inscription =>
            i != null &&
            typeof i === 'object' &&
            'id' in i &&
            typeof (i as any).id === 'string',
        );
      }
    }
  }
  return [];
}

/* ═══════════════════════════════════════════════════════════════════════════
   AVATAR CANDIDAT (image + fallback initiales)
   ═══════════════════════════════════════════════════════════════════════════ */

function CandidateAvatar({
  prenom,
  nom,
  photoUrl,
}: {
  prenom?: string;
  nom?: string;
  photoUrl?: string | null;
}) {
  const [imageError, setImageError] = useState(false);

  const initials =
    `${prenom?.[0] ?? '?'}${nom?.[0] ?? ''}`.toUpperCase() || '?';

  const src = !imageError && photoUrl ? getMediaUrl(photoUrl) : null;

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-semibold text-white ring-2 ring-white dark:ring-slate-900">
      {src ? (
        <img
          src={src}
          alt={`${prenom ?? ''} ${nom ?? ''}`.trim() || 'Avatar'}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */

export function RecentInscriptions() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery<Inscription[]>({
    queryKey: ['staff', 'recent-inscriptions'],
    queryFn: async () => {
      const response = await api.get('/staff/inscriptions?limit=5');
      const root = response.data?.data ?? response.data;
      return extractInscriptions(root).slice(0, 5);
    },
    staleTime: 30_000,
  });

  const inscriptions = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data],
  );

  /* ── Loading ────────────────────────────────────────── */
  if (isLoading) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  /* ── Error ──────────────────────────────────────────── */
  if (isError) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-slate-50">
            <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden />
            Inscriptions récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QueryErrorState onRetry={() => void refetch()} isRetrying={isFetching} />
        </CardContent>
      </Card>
    );
  }

  /* ── Rendu ──────────────────────────────────────────── */
  return (
    <Card className="overflow-hidden border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
            <FileText className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <CardTitle className="text-base text-slate-900 dark:text-slate-50">
              Inscriptions récentes
            </CardTitle>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {inscriptions.length > 0
                ? `${inscriptions.length} candidature${inscriptions.length > 1 ? 's' : ''}`
                : 'Aucune candidature'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="shrink-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
        >
          <Link href="/staff/selections" className="group">
            Voir tout
            <ArrowRight
              className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {inscriptions.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aucune candidature"
            description="Les nouvelles inscriptions apparaîtront ici."
          />
        ) : (
          <div className="space-y-2">
            {inscriptions.map((i) => {
              const config = STATUT_CONFIG[i.statut] ?? STATUT_CONFIG.EN_ATTENTE;
              const StatusIcon = config.icon;

              return (
                <Link
                  key={i.id}
                  href="/staff/selections"
                  className={cn(
                    'group flex items-center gap-3 rounded-xl border p-3 transition-all duration-200',
                    'border-slate-200 bg-white',
                    'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
                    'dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
                  )}
                >
                  {/* ⭐ Avatar avec photo */}
                  <CandidateAvatar
                    prenom={i.prenom}
                    nom={i.nom}
                    photoUrl={i.photoUrl}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-slate-900 dark:text-slate-50 dark:group-hover:text-slate-50">
                      {i.prenom ?? ''} {i.nom ?? ''}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {i.formationTitre && (
                        <span className="truncate">{i.formationTitre}</span>
                      )}
                      {i.dateInscription && (
                        <>
                          <span aria-hidden>•</span>
                          <span className="tabular-nums">
                            {formatDate(i.dateInscription)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge className={cn('text-[11px] font-semibold', config.className)}>
                      <StatusIcon className="mr-1 h-3 w-3" aria-hidden />
                      {config.label}
                    </Badge>
                    <ArrowRight
                      aria-hidden
                      className={cn(
                        'h-4 w-4 text-slate-400 opacity-0 transition-all',
                        'group-hover:translate-x-0.5 group-hover:text-slate-700 group-hover:opacity-100 dark:group-hover:text-slate-200',
                      )}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}