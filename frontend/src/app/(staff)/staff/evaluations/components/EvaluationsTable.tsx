// src/app/(staff)/staff/evaluations/components/EvaluationsTable.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  MoreVertical, Edit, Trash2, ClipboardCheck, FileText, Plus, Eye,
  CheckCircle2, XCircle, Clock, Target,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { Pagination } from '@/components/shared/Pagination';
import { EvaluationFormModal } from './EvaluationFormModal';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Evaluation {
  id: string;
  titre: string;
  type: string;
  noteMax?: number | null;
  noteMinPassage?: number | null;
  coefficient?: number | null;
  dateEvaluation?: string | null;
  dureeMinutes?: number | null;
  publiee?: boolean;
  session?: {
    id?: string;
    codeSession?: string;
    formation?: { titre?: string | null } | null;
  } | null;
}

interface EvaluationsResponse {
  data: Evaluation[];
  pagination?: { page: number; totalPages: number; total?: number };
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG
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

const TYPE_COLORS: Record<string, string> = {
  PRE_TEST:
    'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30',
  POST_TEST:
    'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  QUIZ:
    'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30',
  PROJET:
    'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  EXAMEN:
    'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30',
  TP:
    'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30',
  ORAL:
    'bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-500/10 dark:text-pink-300 dark:border-pink-500/30',
};

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function extractEvaluations(response: unknown): EvaluationsResponse {
  if (!response || typeof response !== 'object') return { data: [] };
  const r = response as Record<string, unknown>;
  const root = (r.data ?? r) as Record<string, unknown>;

  const rawList =
    (Array.isArray(root.evaluations) && root.evaluations) ||
    (Array.isArray(root.data) && root.data) ||
    (Array.isArray(root.items) && root.items) ||
    (Array.isArray(root) && root) ||
    [];

  const evaluations = (rawList as unknown[])
    .filter((e): e is Evaluation => e != null && typeof e === 'object' && 'id' in e)
    .filter((e) => typeof e.id === 'string' && e.id.length > 0);

  return {
    data: evaluations,
    pagination: (root.pagination as EvaluationsResponse['pagination']) ?? undefined,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function EvaluationsTable() {
  const router = useRouter();
  const qc = useQueryClient();
  const searchParams = useSearchParams();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const openCreate = () => {
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    setEditId(id);
    setModalOpen(true);
  };

  const closeModal = (open: boolean) => {
    setModalOpen(open);
    if (!open) setEditId(null);
  };

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    limit: 10,
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery<EvaluationsResponse>({
    queryKey: ['staff', 'evaluations', filters],
    queryFn: async () => {
      const response = await api.get('/staff/evaluations', { params: filters });
      return extractEvaluations(response.data);
    },
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/staff/evaluations/${id}`);
    },
    onSuccess: () => {
      toast.success('Évaluation supprimée');
      qc.invalidateQueries({ queryKey: ['staff', 'evaluations'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ─── Header ─── */
  const header = (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Évaluations
        </h1>
        <p className="mt-1 text-muted-foreground">
          Créez et gérez les évaluations de vos sessions
        </p>
      </div>
      <Button
        onClick={openCreate}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="mr-2 h-4 w-4" aria-hidden />
        Nouvelle évaluation
      </Button>
    </header>
  );

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </CardContent>
        </Card>
        <EvaluationFormModal open={modalOpen} onOpenChange={closeModal} evaluationId={editId} />
      </div>
    );
  }

  /* ─── Erreur ─── */
  if (isError) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="p-6">
            <QueryErrorState onRetry={() => void refetch()} isRetrying={isFetching} />
          </CardContent>
        </Card>
        <EvaluationFormModal open={modalOpen} onOpenChange={closeModal} evaluationId={editId} />
      </div>
    );
  }

  const evaluations = data?.data ?? [];

  /* ─── Vide ─── */
  if (evaluations.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={ClipboardCheck}
              title="Aucune évaluation"
              description="Créez votre première évaluation pour une session."
              action={
                <Button
                  onClick={openCreate}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="mr-2 h-4 w-4" aria-hidden />
                  Créer une évaluation
                </Button>
              }
            />
          </CardContent>
        </Card>
        <EvaluationFormModal open={modalOpen} onOpenChange={closeModal} evaluationId={editId} />
      </div>
    );
  }

  /* ─── Rendu principal ─── */
  return (
    <div className="space-y-6">
      {header}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Évaluation</TableHead>
                <TableHead className="hidden md:table-cell">Session</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden lg:table-cell">Barème</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.map((e) => {
                const typeLabel = TYPE_LABELS[e.type] ?? e.type;
                const typeColor =
                  TYPE_COLORS[e.type] ??
                  'bg-muted text-muted-foreground border border-border';

                return (
                  <TableRow key={e.id} className="group">
                    {/* Évaluation */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/15">
                          <ClipboardCheck className="h-5 w-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {e.titre ?? 'Sans titre'}
                          </p>
                          {e.dateEvaluation && (
                            <p className="truncate text-[11px] text-muted-foreground">
                              <Clock className="mr-1 inline h-3 w-3" aria-hidden />
                              {formatDate(e.dateEvaluation)}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Session */}
                    <TableCell className="hidden md:table-cell">
                      <p className="truncate text-sm text-foreground">
                        {e.session?.formation?.titre ?? '—'}
                      </p>
                      {e.session?.codeSession && (
                        <p className="truncate font-mono text-[11px] text-muted-foreground">
                          {e.session.codeSession}
                        </p>
                      )}
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <Badge className={cn('text-[11px] font-medium', typeColor)}>
                        {typeLabel}
                      </Badge>
                    </TableCell>

                    {/* Barème */}
                    <TableCell className="hidden lg:table-cell">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                        <Target className="h-3.5 w-3.5" aria-hidden />
                        {e.noteMax ? `${e.noteMax} pts` : '—'}
                        {e.noteMinPassage != null && (
                          <span className="text-[10px] opacity-70">
                            (min {e.noteMinPassage})
                          </span>
                        )}
                      </span>
                    </TableCell>

                    {/* Statut */}
                    <TableCell>
                      {e.publiee ? (
                        <Badge className="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" aria-hidden />
                          Publiée
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="inline-flex items-center gap-1 text-muted-foreground"
                        >
                          <XCircle className="h-3 w-3" aria-hidden />
                          Brouillon
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-foreground group-hover:opacity-100"
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
                          <DropdownMenuItem
                            onClick={() => router.push(`/staff/evaluations/${e.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" aria-hidden />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/staff/notes?evaluationId=${e.id}`)}
                          >
                            <FileText className="mr-2 h-4 w-4" aria-hidden />
                            Saisir les notes
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm(`Supprimer "${e.titre}" ?`)) {
                                deleteMutation.mutate(e.id);
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" aria-hidden />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="border-t border-border p-4">
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
            />
          </div>
        )}
      </Card>

      <EvaluationFormModal open={modalOpen} onOpenChange={closeModal} evaluationId={editId} />
    </div>
  );
}