'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, ClipboardCheck, Calendar, Clock, Send, CheckCircle2,
  AlertCircle, Award, FileText, ListChecks, Lock, Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import {
  ParticipantEvaluationDetail, Reponse, Question,
  isAnswered,
} from '@/lib/evaluations/participant-detail';
import { QuestionField } from '../../components/QuestionField';
import { Timer } from '../../components/Timer';
import { SubmitConfirmDialog } from '../../components/SubmitConfirmDialog';

interface Props {
  evaluationId: string;
}

export function EvaluationDetail({ evaluationId }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const [reponses, setReponses] = useState<Record<string, Reponse>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const { data: evaluation, isLoading, isError, isFetching, refetch } =
    useQuery<ParticipantEvaluationDetail>({
      queryKey: ['participant', 'evaluation', evaluationId],
      queryFn: async () => {
        const { data } = await api.get(`/participant/evaluations/${evaluationId}`);
        return data.data;
      },
    });

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post(`/participant/evaluations/${evaluationId}/soumettre`, {
        reponses: {
          parQuestion: reponses,
        },
      });
    },
    onSuccess: () => {
      toast.success('Évaluation soumise avec succès');
      setSuccess(true);
      setConfirmOpen(false);
      qc.invalidateQueries({ queryKey: ['participant', 'evaluations'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const questions = evaluation?.questions ?? [];
  const hasQuestions = questions.length > 0;

  const answered = useMemo(() => {
    if (!hasQuestions) return 0;
    return questions.filter((q) => isAnswered(reponses[q.id])).length;
  }, [questions, reponses, hasQuestions]);

  const unanswered = hasQuestions ? questions.length - answered : 0;
  const progress = hasQuestions ? (answered / questions.length) * 100 : 0;

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (isError || !evaluation) {
    return (
      <QueryErrorState
        onRetry={() => { void refetch(); }}
        isRetrying={isFetching}
      />
    );
  }

  // ─── Écran succès ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">
              Évaluation soumise !
            </h2>
            <p className="text-odc-muted mb-6 max-w-md mx-auto">
              Votre évaluation a bien été transmise. Vous recevrez votre note
              dès qu'elle sera corrigée.
            </p>
            <Button
              variant="odc"
              onClick={() => router.push('/participant/evaluations')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux évaluations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dejaSoumise = !!evaluation.maSoumission;
  const locked = !evaluation.publiee;

  // ─── Rendu principal ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-odc-primary-soft text-odc-primary">
                {evaluation.type}
              </Badge>
              {locked && (
                <Badge variant="outline" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" /> Non publiée
                </Badge>
              )}
              {dejaSoumise && (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Soumise
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {evaluation.dureeMinutes && !dejaSoumise && (
                <Timer minutes={evaluation.dureeMinutes} />
              )}
              <span className="text-sm text-odc-muted">
                {evaluation.noteMax} points
              </span>
            </div>
          </div>

          <CardTitle className="text-2xl">{evaluation.titre}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-odc-muted">
            {evaluation.dateEvaluation && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(evaluation.dateEvaluation)}
              </span>
            )}
            {evaluation.dureeMinutes && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {evaluation.dureeMinutes} minutes
              </span>
            )}
            {hasQuestions && (
              <span className="flex items-center gap-1.5">
                <ListChecks className="h-4 w-4" />
                {questions.length} question{questions.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {evaluation.description && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-odc-primary" />
                  Description
                </h3>
                <p className="text-sm text-odc-secondary whitespace-pre-line">
                  {evaluation.description}
                </p>
              </div>
            </>
          )}

          {evaluation.consignes && (
            <div className="p-4 rounded-lg bg-odc-info-bg">
              <h3 className="font-medium text-odc-info mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Consignes
              </h3>
              <p className="text-sm whitespace-pre-line">
                {evaluation.consignes}
              </p>
            </div>
          )}

          <Separator />

          {/* ─── Déjà soumise : consultation ─────────────────────────── */}
          {dejaSoumise ? (
            <ConsultationView evaluation={evaluation} />
          ) : locked ? (
            <div className="rounded-lg border border-odc-border p-6 text-center text-odc-muted">
              <Lock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                Cette évaluation n'est pas encore disponible.
              </p>
            </div>
          ) : (
            <>
              {/* ─── Progression ─────────────────────────────────────── */}
              {hasQuestions && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-odc-muted">Progression</span>
                    <span className="font-medium">
                      {answered} / {questions.length}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* ─── Questions ───────────────────────────────────────── */}
              {hasQuestions && (
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-odc-primary" />
                    Questions
                  </h3>
                  {questions.map((q, i) => (
                    <QuestionField
                      key={q.id}
                      question={q}
                      index={i}
                      value={reponses[q.id]}
                      onChange={(r) =>
                        setReponses((prev) => ({ ...prev, [q.id]: r }))
                      }
                      disabled={mutation.isPending}
                    />
                  ))}
                </div>
              )}

              {/* ─── Pas de questions structurées : texte libre ──────── */}
              {!hasQuestions && (
                <div className="space-y-2">
                  <h3 className="font-medium">Votre réponse</h3>
                  <textarea
                    className="w-full min-h-40 rounded-lg border border-odc-border bg-transparent p-3 text-sm"
                    placeholder="Rédigez votre réponse ici…"
                    value={
                      (reponses['__global__'] as any)?.texte ?? ''
                    }
                    onChange={(e) =>
                      setReponses((prev) => ({
                        ...prev,
                        __global__: { type: 'TEXTE_LONG', texte: e.target.value },
                      }))
                    }
                    disabled={mutation.isPending}
                  />
                </div>
              )}

              {/* ─── Action ──────────────────────────────────────────── */}
              <div className="pt-2">
                <Button
                  variant="odc"
                  className="w-full"
                  onClick={() => setConfirmOpen(true)}
                  disabled={
                    mutation.isPending ||
                    (hasQuestions
                      ? answered === 0
                      : !(reponses['__global__'] as any)?.texte?.trim())
                  }
                >
                  <Send className="h-4 w-4 mr-2" />
                  Soumettre l'évaluation
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <SubmitConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => mutation.mutate()}
        unanswered={unanswered}
        total={questions.length}
        submitting={mutation.isPending}
      />
    </div>
  );
}

// ─── Sous-composant consultation ─────────────────────────────────────────────

function ConsultationView({ evaluation }: { evaluation: ParticipantEvaluationDetail }) {
  const s = evaluation.maSoumission!;
  const questions = evaluation.questions ?? [];
  const parQuestion = s.reponses.parQuestion ?? {};

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-odc-success/30 bg-odc-success-bg p-4">
        <div className="flex items-center gap-2 font-medium text-odc-success">
          <CheckCircle2 className="h-5 w-5" />
          Réponse envoyée le {formatDate(s.soumisAt)}
        </div>
        {typeof s.reponses.noteObtenue === 'number' && (
          <div className="flex items-center gap-2 mt-2 font-semibold text-odc-primary">
            <Award className="h-4 w-4" />
            Note obtenue : {s.reponses.noteObtenue} / {evaluation.noteMax}
          </div>
        )}
        {s.reponses.commentaireCorrecteur && (
          <div className="mt-3 pt-3 border-t border-odc-success/20">
            <p className="text-xs font-medium text-odc-muted mb-1">
              Commentaire du correcteur
            </p>
            <p className="text-sm whitespace-pre-line">
              {s.reponses.commentaireCorrecteur}
            </p>
          </div>
        )}
      </div>

      {questions.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Eye className="h-4 w-4 text-odc-primary" />
            Vos réponses
          </h3>
          {questions.map((q, i) => {
            const r = parQuestion[q.id];
            return (
              <div
                key={q.id}
                className="rounded-lg border border-odc-border p-4 space-y-2"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-odc-surface-alt text-odc-secondary text-xs font-semibold">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium whitespace-pre-line">
                      {q.enonce}
                    </p>
                  </div>
                </div>
                <div className="pl-10">
                  <ReponseDisplay question={q} reponse={r} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        s.reponses.contenu && (
          <div>
            <h3 className="font-medium mb-2">Votre réponse</h3>
            <p className="whitespace-pre-line text-sm text-odc-secondary">
              {s.reponses.contenu}
            </p>
          </div>
        )
      )}
    </div>
  );
}

function ReponseDisplay({
  question, reponse,
}: { question: Question; reponse?: Reponse }) {
  if (!reponse) {
    return (
      <p className="text-sm italic text-odc-muted">Non répondu</p>
    );
  }
  switch (reponse.type) {
    case 'QCM': {
      const opt = question.options?.find((o) => o.id === reponse.optionId);
      return <p className="text-sm">{opt?.label ?? '—'}</p>;
    }
    case 'QCM_MULTIPLE': {
      const labels = reponse.optionIds.map(
        (id) => question.options?.find((o) => o.id === id)?.label ?? id,
      );
      return (
        <ul className="text-sm list-disc pl-5">
          {labels.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      );
    }
    case 'VRAI_FAUX':
      return <p className="text-sm">{reponse.valeur ? 'Vrai' : 'Faux'}</p>;
    case 'TEXTE_COURT':
    case 'TEXTE_LONG':
      return (
        <p className="text-sm whitespace-pre-line">{reponse.texte}</p>
      );
    case 'CODE':
      return (
        <pre className="text-xs font-mono bg-odc-surface-alt rounded p-2 overflow-x-auto whitespace-pre-wrap">
          {reponse.texte}
        </pre>
      );
    case 'FICHIER':
      return (
        <a
          href={reponse.fichierUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-odc-primary underline"
        >
          {reponse.nomFichier}
        </a>
      );
  }
}