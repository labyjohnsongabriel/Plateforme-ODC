'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ClipboardCheck, Calendar, Clock, ArrowRight, CheckCircle2, Lock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';

const TYPE_LABELS: Record<string, string> = {
  PRE_TEST: 'Pré-test',
  POST_TEST: 'Post-test',
  QUIZ: 'Quiz',
  PROJET: 'Projet',
  EXAMEN: 'Examen',
  TP: 'Travaux pratiques',
  ORAL: 'Oral',
};

export function MyEvaluationsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['participant', 'evaluations'],
    queryFn: async () => {
      const { data } = await api.get('/participant/evaluations');
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56" />
        ))}
      </div>
    );
  }

  const evaluations = data ?? [];

  if (!evaluations.length) {
    return (
      <Card>
        <EmptyState
          icon={ClipboardCheck}
          title="Aucune évaluation"
          description="Aucune évaluation disponible pour le moment."
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {evaluations.map((e: any) => (
        <Card key={e.id} className="overflow-hidden hover:shadow-odc-lg transition-all group">
          <div className="h-2 bg-gradient-to-r from-odc-500 to-odc-700" />

          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                {TYPE_LABELS[e.type] ?? e.type}
              </Badge>
              {e.publiee ? (
                <Badge className="bg-odc-success-bg text-odc-success text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Publiée
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" /> À venir
                </Badge>
              )}
            </div>

            <h3 className="font-display font-semibold mb-2 line-clamp-2 min-h-[3rem] group-hover:text-odc-primary transition-colors">
              {e.titre}
            </h3>

            <p className="text-xs text-odc-muted line-clamp-2 mb-3">
              {e.description || `${TYPE_LABELS[e.type]} — ${e.noteMax} points`}
            </p>

            <div className="space-y-1.5 text-xs text-odc-muted mb-4">
              {e.dateEvaluation && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(e.dateEvaluation)}
                </div>
              )}
              {e.dureeMinutes && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {e.dureeMinutes} minutes
                </div>
              )}
            </div>

            <Button
              variant="odc"
              size="sm"
              className="w-full"
              disabled={!e.publiee}
              asChild={e.publiee}
            >
              {e.publiee ? (
                <Link href={`/participant/evaluations/${e.id}`}>
                  Passer l&apos;évaluation <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              ) : (
                <span>Non disponible</span>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}