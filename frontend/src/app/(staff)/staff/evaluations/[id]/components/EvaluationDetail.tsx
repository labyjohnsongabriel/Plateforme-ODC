// src/app/(staff)/staff/evaluations/[id]/components/EvaluationDetail.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ClipboardCheck,
  Calendar,
  Clock,
  Target,
  Percent,
  FileText,
  ListChecks,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
  Award,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { EvaluationFormModal } from '../../components/EvaluationFormModal';
import { api } from '@/lib/api';
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
  description?: string | null;
  consignes?: string | null;
  publiee?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  session?: {
    id?: string;
    codeSession?: string;
    dateDebut?: string | null;
    dateFin?: string | null;
    formation?: { id?: string; titre?: string | null } | null;
  } | null;
  notesCount?: number | null;
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

function formatDate(value?: string | null): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return '—';
  }
}

function extractEvaluation(response: unknown): Evaluation | null {
  if (!response || typeof response !== 'object') return null;
  const r = response as Record<string, unknown>;
  const root = (r.data ?? r) as Record<string, unknown>;
  const e = (root.evaluation ?? root) as Evaluation;
  return e?.id ? e : null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function EvaluationDetail({ evaluationId }: { evaluationId: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  /* ─── Query évaluation ─── */
  const { data: evaluation, isLoading, isError, refetch, isFetching } = useQuery<Evaluation | null>({
    queryKey: ['staff', 'evaluation', evaluationId],
    queryFn: async () => {
      const response = await api.get(`/staff/evaluations/${evaluationId}`);
      return extractEvaluation(response.data);
    },
    enabled: !!evaluationId,
  });

  /* ─── Mutation delete ─── */
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/staff/evaluations/${evaluationId}`);
    },
    onSuccess: () => {
      toast.success('Évaluation supprimée');
      qc.invalidateQueries({ queryKey: ['staff', 'evaluations'] });
      router.push('/staff/evaluations');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  /* ─── Erreur ─── */
  if (isError || !evaluation) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Retour
        </Button>
        <Card>
          <CardContent className="p-6">
            <QueryErrorState
              onRetry={() => void refetch()}
              isRetrying={isFetching}
              description="Cette évaluation n'existe pas ou n'est pas accessible."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ─── Rendu ─── */
  const typeLabel = TYPE_LABELS[evaluation.type] ?? evaluation.type;
  const typeColor =
    TYPE_COLORS[evaluation.type] ??
    'bg-muted text-muted-foreground border border-border';

  return (
    <div className="space-y-6">
      {/* Retour */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Retour
      </Button>

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md ring-1 ring-primary/20">
            <ClipboardCheck
              className="h-6 w-6 text-primary-foreground"
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                {evaluation.titre}
              </h1>
              <Badge className={cn('text-xs font-semibold', typeColor)}>
                {typeLabel}
              </Badge>
              <Badge
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-semibold',
                  evaluation.publiee
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'border border-border bg-muted text-muted-foreground',
                )}
              >
                {evaluation.publiee ? (
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <XCircle className="h-3 w-3" aria-hidden="true" />
                )}
                {evaluation.publiee ? 'Publiée' : 'Brouillon'}
              </Badge>
            </div>
            {evaluation.session?.formation?.titre && (
              <p className="mt-1 text-sm text-muted-foreground">
                {evaluation.session.formation.titre}
                {evaluation.session.codeSession && (
                  <span className="ml-2 font-mono text-xs">
                    • {evaluation.session.codeSession}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Modifier */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
            Modifier
          </Button>

          {/* Supprimer */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (
                confirm(
                  `Supprimer définitivement "${evaluation.titre}" ?`,
                )
              ) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Supprimer
          </Button>
        </div>
      </header>

      {/* Grille : main + sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ─── Colonne principale ─── */}
        <div className="space-y-6">
          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Saisir les notes */}
                <Button
                  asChild
                  className="justify-start bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link href={`/staff/notes?evaluationId=${evaluation.id}`}>
                    <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                    Saisir les notes
                  </Link>
                </Button>

                {/* Voir les notes existantes */}
                <Button variant="outline" asChild className="justify-start">
                  <Link href={`/staff/notes?evaluationId=${evaluation.id}&view=list`}>
                    <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                    Voir les notes
                  </Link>
                </Button>

                {/* Session associée */}
                {evaluation.session?.id && (
                  <Button variant="outline" asChild className="justify-start">
                    <Link href={`/staff/sessions/${evaluation.session.id}`}>
                      <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                      Voir la session
                    </Link>
                  </Button>
                )}

                {/* Formation associée */}
                {evaluation.session?.formation?.id && (
                  <Button variant="outline" asChild className="justify-start">
                    <Link href={`/staff/formations/${evaluation.session.formation.id}`}>
                      <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
                      Voir la formation
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={Calendar}
                  label="Date d'évaluation"
                  value={formatDate(evaluation.dateEvaluation)}
                />
                <InfoItem
                  icon={Clock}
                  label="Durée"
                  value={
                    evaluation.dureeMinutes != null
                      ? `${evaluation.dureeMinutes} min`
                      : '—'
                  }
                />
                <InfoItem
                  icon={Target}
                  label="Note maximale"
                  value={
                    evaluation.noteMax != null
                      ? `${evaluation.noteMax} points`
                      : '—'
                  }
                />
                <InfoItem
                  icon={Award}
                  label="Note de passage"
                  value={
                    evaluation.noteMinPassage != null
                      ? `${evaluation.noteMinPassage} points`
                      : '—'
                  }
                />
                <InfoItem
                  icon={Percent}
                  label="Coefficient"
                  value={
                    evaluation.coefficient != null
                      ? `× ${evaluation.coefficient}`
                      : '—'
                  }
                />
                <InfoItem
                  icon={Users}
                  label="Notes saisies"
                  value={
                    evaluation.notesCount != null
                      ? `${evaluation.notesCount} étudiant${evaluation.notesCount > 1 ? 's' : ''}`
                      : '—'
                  }
                />
              </div>

              {/* Description */}
              {evaluation.description && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Description
                    </p>
                    <p className="whitespace-pre-line text-sm text-foreground">
                      {evaluation.description}
                    </p>
                  </div>
                </>
              )}

              {/* Consignes */}
              {evaluation.consignes && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                      Consignes
                    </p>
                    <p className="whitespace-pre-line text-sm text-foreground">
                      {evaluation.consignes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Sidebar ─── */}
        <aside className="space-y-4">
          {/* Barème */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Barème</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-2">
                <p className="font-display text-4xl font-bold tabular-nums text-foreground">
                  {evaluation.noteMax ?? '—'}
                </p>
                <span className="text-sm text-muted-foreground">points max</span>
              </div>

              {evaluation.noteMinPassage != null && evaluation.noteMax != null && (
                <div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                      style={{
                        width: `${Math.min(
                          100,
                          (evaluation.noteMinPassage / evaluation.noteMax) * 100,
                        )}%`,
                      }}
                      role="progressbar"
                      aria-valuenow={evaluation.noteMinPassage}
                      aria-valuemin={0}
                      aria-valuemax={evaluation.noteMax}
                    />
                  </div>
                  <p className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Seuil de passage
                    </span>
                    <span className="font-medium text-foreground">
                      {evaluation.noteMinPassage} / {evaluation.noteMax}
                    </span>
                  </p>
                </div>
              )}

              {evaluation.coefficient != null && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Coefficient</span>
                    <span className="font-medium tabular-nums text-foreground">
                      × {evaluation.coefficient}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Statut publication */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Publication
                </span>
                <Badge
                  variant={evaluation.publiee ? 'default' : 'outline'}
                  className={
                    evaluation.publiee
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : 'text-muted-foreground'
                  }
                >
                  {evaluation.publiee ? 'Publiée' : 'Brouillon'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Métadonnées */}
          {evaluation.createdAt && (
            <Card>
              <CardContent className="space-y-2 p-4 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Créée le</span>
                  <span className="tabular-nums">{formatDate(evaluation.createdAt)}</span>
                </div>
                {evaluation.updatedAt && (
                  <div className="flex items-center justify-between">
                    <span>Modifiée le</span>
                    <span className="tabular-nums">{formatDate(evaluation.updatedAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      {/* Modal édition */}
      <EvaluationFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        evaluationId={editOpen ? evaluationId : null}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 dark:bg-primary/15">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}