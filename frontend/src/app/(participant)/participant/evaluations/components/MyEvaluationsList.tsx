// src/app/(participant)/participant/evaluations/components/MyEvaluationsList.tsx
'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ClipboardCheck, Calendar, Clock, ArrowRight, CheckCircle2,
  Lock, AlertCircle, Award, Timer, PlayCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { EvaluationStatus } from '@/types/evaluation.types'; // ✅ Import direct de l'enum
import {
  type ParticipantEvaluation, normalizeEvaluations, computeStatus, sortEvaluations, isPublished,
} from '@/lib/evaluations/participant';

const TYPE_LABELS: Record<string, string> = {
  PRE_TEST: 'Pré-test', POST_TEST: 'Post-test', QUIZ: 'Quiz',
  PROJET: 'Projet', EXAMEN: 'Examen', TP: 'Travaux pratiques', ORAL: 'Oral',
};

const STATUS_META: Record<EvaluationStatus, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  [EvaluationStatus.DISPONIBLE]: { label: 'Disponible', className: 'bg-odc-success-bg text-odc-success', icon: CheckCircle2 },
  [EvaluationStatus.EN_COURS]: { label: 'En cours', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', icon: Timer },
  [EvaluationStatus.SOUMISE]: { label: 'Soumise', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300', icon: CheckCircle2 },
  [EvaluationStatus.A_VENIR]: { label: 'À venir', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: Lock },
  [EvaluationStatus.EXPIREE]: { label: 'Expirée', className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400', icon: AlertCircle },
};

export function MyEvaluationsList() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['participant', 'evaluations'],
    queryFn: async () => {
      const { data } = await api.get('/participant/evaluations');
      return normalizeEvaluations(data);
    },
    staleTime: 30_000,
    retry: 1,
  });

  const evaluations = useMemo(() => sortEvaluations((data ?? []).filter(isPublished)), [data]);

  if (isLoading) {
    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56" />)}</div>;
  }

  if (isError) {
    return <Card><CardContent><QueryErrorState onRetry={() => void refetch()} isRetrying={isFetching} /></CardContent></Card>;
  }

  if (!evaluations.length) {
    return (
      <Card>
        <EmptyState icon={ClipboardCheck} title="Aucune évaluation" description="Aucune évaluation publiée n'est disponible pour le moment." />
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {evaluations.map((e: ParticipantEvaluation) => {
        const status = computeStatus(e);
        const meta = STATUS_META[status];
        const StatusIcon = meta.icon;
        const typeLabel = TYPE_LABELS[e.type || ''] || e.type || 'Évaluation';
        const detailHref = `/participant/evaluations/${e.id}`;

        return (
          <Card key={e.id} className="group flex flex-col overflow-hidden transition-all hover:shadow-odc-lg">
            <div className="h-2 bg-gradient-to-r from-odc-primary to-odc-primary/70" />
            <CardContent className="flex flex-1 flex-col p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <Badge variant="outline" className="text-xs">{typeLabel}</Badge>
                <Badge className={`text-xs ${meta.className}`}><StatusIcon className="mr-1 h-3 w-3" aria-hidden />{meta.label}</Badge>
              </div>

              <h3 className="mb-2 line-clamp-2 min-h-[3rem] font-display font-semibold transition-colors group-hover:text-odc-primary">
                {e.titre || 'Sans titre'}
              </h3>

              <p className="mb-3 line-clamp-2 text-xs text-odc-muted">
                {e.description || `${typeLabel} — ${e.noteMax ?? 20} points`}
              </p>

              <div className="mb-4 space-y-1.5 text-xs text-odc-muted">
                {e.dateEvaluation && <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" aria-hidden /><span>{formatDate(e.dateEvaluation)}</span></div>}
                {typeof e.dureeMinutes === 'number' && e.dureeMinutes > 0 && <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden /><span>{e.dureeMinutes} minutes</span></div>}
                {status === EvaluationStatus.SOUMISE && typeof e.noteObtenue === 'number' && (
                  <div className="flex items-center gap-1.5 font-medium text-odc-primary"><Award className="h-3.5 w-3.5" aria-hidden /><span>Note : {e.noteObtenue} / {e.noteMax ?? 20}</span></div>
                )}
              </div>

              <div className="mt-auto">
                {status === EvaluationStatus.DISPONIBLE && (
                  <Button variant="odc" size="sm" className="w-full" asChild>
                    <Link href={detailHref}>Passer l&apos;évaluation<ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden /></Link>
                  </Button>
                )}
                
                {status === EvaluationStatus.EN_COURS && (
                  <Button variant="odc" size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white" asChild>
                    <Link href={detailHref}><PlayCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden />Reprendre l&apos;évaluation</Link>
                  </Button>
                )}

                {status === EvaluationStatus.SOUMISE && (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={detailHref}>Consulter ma réponse<ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden /></Link>
                  </Button>
                )}

                {status === EvaluationStatus.A_VENIR && (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    <Lock className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    Ouvre le {e.dateDebut ? formatDate(e.dateDebut) : 'bientôt'}
                  </Button>
                )}

                {status === EvaluationStatus.EXPIREE && (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    <AlertCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden />Échéance dépassée
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