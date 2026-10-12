'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ClipboardCheck, Calendar, FileText, BarChart3, Edit, Users,
  Eye, EyeOff,
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

const TYPE_COLORS: Record<string, string> = {
  PRE_TEST: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  POST_TEST: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  QUIZ: 'bg-odc-primary-soft text-odc-primary',
  PROJET: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  EXAMEN: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  TP: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  ORAL: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
};

export function EvaluationsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['formateur', 'evaluations'],
    queryFn: async () => {
      const { data } = await api.get('/formateur/evaluations');
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
          description="Créez votre première évaluation pour vos sessions."
          action={
            <Button variant="odc" asChild>
              <Link href="/formateur/evaluations/nouveau">
                <Plus className="h-4 w-4 mr-2" /> Créer
              </Link>
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {evaluations.map((e: any) => (
        <Card key={e.id} className="overflow-hidden hover:shadow-odc-lg transition-all group">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-700" />

          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[e.type]}`}
              >
                {TYPE_LABELS[e.type] ?? e.type}
              </span>
              {e.publiee ? (
                <Badge className="bg-odc-success-bg text-odc-success text-xs">
                  <Eye className="h-3 w-3 mr-1" /> Publiée
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <EyeOff className="h-3 w-3 mr-1" /> Brouillon
                </Badge>
              )}
            </div>

            <h3 className="font-display font-semibold mb-2 line-clamp-2 min-h-[3rem] group-hover:text-odc-primary transition-colors">
              {e.titre}
            </h3>

            <div className="space-y-2 text-sm text-odc-muted mb-4">
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-odc-primary" />
                <span className="truncate">{e.session?.formation?.titre}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-odc-primary" />
                <span>
                  {e.noteMax} pts
                  {e.noteMinPassage && ` • Min. ${e.noteMinPassage}`}
                  {e.coefficient && ` • Coef. ${e.coefficient}`}
                </span>
              </div>
              {e.dateEvaluation && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-odc-primary" />
                  <span>{formatDate(e.dateEvaluation)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/formateur/evaluations/${e.id}`}>
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Modifier
                </Link>
              </Button>
              <Button variant="odc" size="sm" asChild>
                <Link
                  href={`/formateur/notes?evaluationId=${e.id}`}
                  aria-label="Saisir les notes"
                >
                  <Users className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}