'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, Award, TrendingUp, ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';

export function MyNotesList() {
  const { data, isLoading } = useQuery({
    queryKey: ['participant', 'notes'],
    queryFn: async () => {
      const { data } = await api.get('/participant/notes');
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }

  const notes = data ?? [];

  if (!notes.length) {
    return (
      <Card>
        <EmptyState
          icon={BookOpen}
          title="Aucune note"
          description="Vos notes apparaîtront ici après les évaluations."
        />
      </Card>
    );
  }

  // Grouper par évaluation
  const byEvaluation = notes.reduce((acc: any, note: any) => {
    const evalId = note.evaluation?.id ?? 'unknown';
    if (!acc[evalId]) {
      acc[evalId] = {
        evaluation: note.evaluation,
        notes: [],
      };
    }
    acc[evalId].notes.push(note);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.values(byEvaluation).map((group: any) => {
        const { evaluation, notes: evalNotes } = group;
        const note = evalNotes[0];
        const isPassed = note.note >= (evaluation?.noteMinPassage ?? 10);
        const percent = (note.note / (evaluation?.noteMax ?? 20)) * 100;

        return (
          <Card key={evaluation?.id} className="overflow-hidden hover:shadow-odc-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={isPassed ? 'bg-odc-success-bg text-odc-success border-odc-success' : 'bg-odc-error-bg text-odc-error border-odc-error'}
                    >
                      {isPassed ? '✓ Validé' : '✗ Non validé'}
                    </Badge>
                    <span className="text-xs text-odc-muted">
                      {evaluation?.type}
                    </span>
                  </div>

                  <h3 className="font-display font-semibold mb-1">
                    {evaluation?.titre}
                  </h3>
                  <p className="text-xs text-odc-muted">
                    {evaluation?.session?.formation?.titre}
                  </p>

                  {note.commentaire && (
                    <p className="text-xs text-odc-secondary mt-2 italic">
                      « {note.commentaire} »
                    </p>
                  )}

                  {/* Barre de progression */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-xs text-odc-muted">
                      <span>Progression</span>
                      <span>{Math.round(percent)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-odc-surface-alt overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isPassed
                            ? 'bg-odc-success'
                            : 'bg-odc-error'
                        }`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`font-display text-4xl font-bold ${isPassed ? 'text-odc-success' : 'text-odc-error'}`}>
                    {note.note}
                  </p>
                  <p className="text-xs text-odc-muted">
                    / {evaluation?.noteMax ?? 20}
                  </p>
                  {note.dateSaisie && (
                    <p className="text-[10px] text-odc-muted mt-1">
                      {formatDate(note.dateSaisie)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}