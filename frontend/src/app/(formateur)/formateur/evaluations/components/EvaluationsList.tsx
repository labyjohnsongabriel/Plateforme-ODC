// src/app/(formateur)/formateur/evaluations/components/EvaluationsList.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ClipboardCheck, Calendar, FileText, BarChart3, Edit, Users,
  Eye, EyeOff, Plus, Trash2, MoreVertical,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { EVALUATION_TYPES, getTypeConfig } from '@/lib/evaluations/types';
import { EvaluationFormModal } from './EvaluationFormModal';
import { DeleteEvaluationDialog } from './DeleteEvaluationDialog';
import { cn } from '@/lib/utils';

const labelOf = (type: string): string => {
  if (!type) return 'Inconnu';
  return EVALUATION_TYPES.find((t) => t.value === type)?.label ?? type;
};

const getTypeColor = (type: string): { bg: string; text: string } => {
  const cfg = getTypeConfig(type);
  return {
    bg: cfg.showCoefficient
      ? 'bg-slate-100 dark:bg-slate-800'
      : 'bg-slate-100 dark:bg-slate-800',
    text: cfg.showCoefficient
      ? 'text-slate-900 dark:text-slate-50'
      : 'text-slate-600 dark:text-slate-400',
  };
};

export function EvaluationsList() {
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<string | undefined>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; titre: string } | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['formateur', 'evaluations'],
    queryFn: async () => {
      const response = await api.get('/formateur/evaluations');
      const root = response.data?.data ?? response.data;
      if (Array.isArray(root)) return root;
      if (Array.isArray(root?.evaluations)) return root.evaluations;
      if (Array.isArray(root?.data)) return root.data;
      return [];
    },
    staleTime: 30_000,
  });

  const openCreate = () => { setFormMode('create'); setEditId(undefined); setFormOpen(true); };
  const openEdit = (id: string) => { setFormMode('edit'); setEditId(id); setFormOpen(true); };
  const openDelete = (id: string, titre: string) => { setDeleteTarget({ id, titre }); setDeleteOpen(true); };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardContent className="p-6">
          <QueryErrorState onRetry={() => void refetch()} isRetrying={isFetching} />
        </CardContent>
      </Card>
    );
  }

  const evaluations: any[] = data ?? [];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
          Mes évaluations
        </h2>
        <Button
          onClick={openCreate}
          className={cn(
            'h-9 rounded-lg px-4 font-medium',
            'bg-slate-900 text-white hover:bg-slate-800',
            'dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
          )}
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Nouvelle évaluation
        </Button>
      </div>

      {evaluations.length === 0 ? (
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-6">
            <EmptyState
              icon={ClipboardCheck}
              title="Aucune évaluation"
              description="Créez votre première évaluation pour vos sessions."
              action={
                <Button
                  onClick={openCreate}
                  className={cn(
                    'h-9 rounded-lg px-4 font-medium',
                    'bg-slate-900 text-white hover:bg-slate-800',
                    'dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
                  )}
                >
                  <Plus className="mr-2 h-4 w-4" aria-hidden />
                  Créer
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {evaluations.map((e) => {
            const cfg = getTypeConfig(e.type);
            const colors = getTypeColor(e.type);
            const label = labelOf(e.type);
            const noteMax = e.noteMax ?? e.note_max ?? 20;
            const noteMinPassage = e.noteMinPassage ?? e.note_min_passage;
            const dateEval = e.dateEvaluation ?? e.date_evaluation;

            return (
              <Card
                key={e.id}
                className={cn(
                  'group flex flex-col overflow-hidden transition-all duration-300',
                  'border-slate-200 bg-white',
                  'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
                  'dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700',
                )}
              >
                <div className="h-1 bg-gradient-to-r from-slate-700 to-slate-400 dark:from-slate-400 dark:to-slate-600" />

                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${colors.bg} ${colors.text}`}
                    >
                      {label}
                    </span>

                    <div className="flex items-center gap-1">
                      {e.publiee ? (
                        <Badge className="border border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <Eye className="mr-1 h-3 w-3" aria-hidden />
                          Publiée
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-slate-500 dark:text-slate-400"
                        >
                          <EyeOff className="mr-1 h-3 w-3" aria-hidden />
                          Brouillon
                        </Badge>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-slate-400 opacity-60 transition-opacity group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                            aria-label={`Actions pour ${e.titre}`}
                          >
                            <MoreVertical className="h-4 w-4" aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(e.id)}>
                            <Edit className="mr-2 h-4 w-4" aria-hidden />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/formateur/notes?evaluationId=${e.id}`}>
                              <Users className="mr-2 h-4 w-4" aria-hidden />
                              Saisir les notes
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950/30 dark:focus:text-red-300"
                            onClick={() => openDelete(e.id, e.titre)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" aria-hidden />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <h3 className="mb-3 line-clamp-2 min-h-[3rem] font-display font-semibold text-slate-900 transition-colors group-hover:text-slate-900 dark:text-slate-50">
                    {e.titre ?? 'Sans titre'}
                  </h3>

                  <div className="mb-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <FileText
                        className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500"
                        aria-hidden
                      />
                      <span className="truncate">
                        {e.session?.formation?.titre ?? '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BarChart3
                        className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500"
                        aria-hidden
                      />
                      <span className="tabular-nums">
                        {noteMax} pts
                        {noteMinPassage != null && ` • Min. ${noteMinPassage}`}
                        {cfg.showCoefficient && e.coefficient != null && ` • Coef. ${e.coefficient}`}
                      </span>
                    </div>
                    {dateEval && (
                      <div className="flex items-center gap-1.5">
                        <Calendar
                          className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500"
                          aria-hidden
                        />
                        <span className="tabular-nums">{formatDate(dateEval)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 flex-1 rounded-lg border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                      onClick={() => openEdit(e.id)}
                    >
                      <Edit className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      asChild
                      className={cn(
                        'h-8 rounded-lg px-3 font-medium',
                        'bg-slate-900 text-white hover:bg-slate-800',
                        'dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
                      )}
                    >
                      <Link
                        href={`/formateur/notes?evaluationId=${e.id}`}
                        aria-label="Saisir les notes"
                      >
                        <Users className="h-4 w-4" aria-hidden />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <EvaluationFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        evaluationId={editId}
      />

      <DeleteEvaluationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        evaluationId={deleteTarget?.id}
        evaluationTitre={deleteTarget?.titre}
      />
    </>
  );
}