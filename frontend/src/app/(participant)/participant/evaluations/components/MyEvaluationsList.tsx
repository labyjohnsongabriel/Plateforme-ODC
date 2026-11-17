// src/components/participant/MyEvaluationsList.tsx
'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ClipboardCheck,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  Lock,
  AlertCircle,
  Award,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import {
  ParticipantEvaluation,
  normalizeEvaluations,
  computeStatus,
  sortEvaluations,
  EvaluationStatus,
} from '@/lib/evaluations/participant';

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTES
   ═══════════════════════════════════════════════════════════════════════════ */

const TYPE_LABELS: Record<string, string> = {
  PRE_TEST: 'Pré-test',
  POST_TEST: 'Post-test',
  QUIZ: 'Quiz',
  PROJET: 'Projet',
  EXAMEN: 'Examen',
  TP: 'Travaux pratiques',
  ORAL: 'Oral',
};

const STATUS_META: Record<
  EvaluationStatus,
  {
    label: string;
    className: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  DISPONIBLE: {
    label: 'Disponible',
    className: 'bg-odc-success-bg text-odc-success',
    icon: CheckCircle2,
  },
  EN_COURS: {
    label: 'En cours',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    icon: Clock,
  },
  SOUMISE: {
    label: 'Soumise',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    icon: CheckCircle2,
  },
  A_VENIR: {
    label: 'À venir',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    icon: Lock,
  },
  EXPIREE: {
    label: 'Expirée',
    className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
    icon: AlertCircle,
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function MyEvaluationsList() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['participant', 'evaluations'],
    queryFn: async () => {
      const { data } = await api.get('/participant/evaluations');
      // ⚠️ Logs de diagnostic (à retirer après validation)
      if (process.env.NODE_ENV === 'development') {
        console.log('[MyEvaluationsList] réponse brute:', data);
      }
      const normalized = normalizeEvaluations(data);
      if (process.env.NODE_ENV === 'development') {
        console.log('[MyEvaluationsList] normalisé:', normalized);
      }
      return normalized;
    },
    staleTime: 30_000,
    retry: 1,
  });

  const evaluations = useMemo(() => sortEvaluations(data ?? []), [data]);

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56" />
        ))}
      </div>
    );
  }

  /* ── Erreur ───────────────────────────────────────────────────────────── */
  if (isError) {
    return (
      <Card>
        <CardContent>
          <QueryErrorState
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
        </CardContent>
      </Card>
    );
  }

  /* ── Vide ─────────────────────────────────────────────────────────────── */
  if (!evaluations.length) {
    return (
      <Card>
        <EmptyState
          icon={ClipboardCheck}
          title="Aucune évaluation"
          description="Aucune évaluation n'est disponible pour le moment."
        />
      </Card>
    );
  }

  /* ── Liste ────────────────────────────────────────────────────────────── */
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {evaluations.map((e) => {
        /* ⚠️ Garde-fou : id obligatoire */
        if (!e?.id) {
          console.warn('[MyEvaluationsList] Évaluation sans id ignorée:', e);
          return null;
        }

        const status = computeStatus(e);
        const meta = STATUS_META[status] ?? STATUS_META.A_VENIR;
        const StatusIcon = meta.icon;
        const isAvailable = status === 'DISPONIBLE';
        const isSubmitted = status === 'SOUMISE';

        return (
          <Card
            key={e.id}
            className="group flex flex-col overflow-hidden transition-all hover:shadow-odc-lg"
          >
            <div className="h-2 bg-gradient-to-r from-odc-primary to-odc-primary/70" />

            <CardContent className="flex flex-1 flex-col p-5">
              {/* Header : type + statut */}
              <div className="mb-3 flex items-start justify-between gap-2">
                <Badge variant="outline" className="text-xs">
                  {TYPE_LABELS[e.type] ?? e.type ?? 'Évaluation'}
                </Badge>
                <Badge className={`text-xs ${meta.className}`}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {meta.label}
                </Badge>
              </div>

              {/* Titre */}
              <h3 className="mb-2 line-clamp-2 min-h-[3rem] font-display font-semibold transition-colors group-hover:text-odc-primary">
                {e.titre || 'Sans titre'}
              </h3>

              {/* Description */}
              <p className="mb-3 line-clamp-2 text-xs text-odc-muted">
                {e.description?.trim() ||
                  `${TYPE_LABELS[e.type] ?? 'Évaluation'} — ${e.noteMax ?? 20} points`}
              </p>

              {/* Meta */}
              <div className="mb-4 space-y-1.5 text-xs text-odc-muted">
                {e.dateEvaluation && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(e.dateEvaluation)}</span>
                  </div>
                )}
                {e.dureeMinutes ? (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{e.dureeMinutes} minutes</span>
                  </div>
                ) : null}
                {isSubmitted && typeof e.noteObtenue === 'number' && (
                  <div className="flex items-center gap-1.5 font-medium text-odc-primary">
                    <Award className="h-3.5 w-3.5" />
                    <span>
                      Note : {e.noteObtenue} / {e.noteMax ?? 20}
                    </span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="mt-auto">
                {isAvailable && (
                  <Button variant="odc" size="sm" className="w-full" asChild>
                    <Link href={`/participant/evaluations/${e.id}`}>
                      Passer l&apos;évaluation
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </Button>
                )}

                {isSubmitted && (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/participant/evaluations/${e.id}`}>
                      Consulter ma réponse
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </Button>
                )}

                {status === 'A_VENIR' && (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    <Lock className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    Non disponible
                  </Button>
                )}

                {status === 'EXPIREE' && (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    <AlertCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    Échéance dépassée
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}