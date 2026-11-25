// src/app/(participant)/participant/evaluations/[id]/components/EvaluationDetail.tsx
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, Calendar, Clock, Send, CheckCircle2, AlertCircle, 
  Award, FileText, ListChecks, Lock, Eye, PlayCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
  ParticipantEvaluationDetail, Reponse, Question, isAnswered 
} from '@/lib/evaluations/participant-detail';
import { QuestionField } from '../../components/QuestionField';
import { SubmitConfirmDialog } from '../../components/SubmitConfirmDialog';
import { Timer } from '../../components/Timer';

interface Props {
  evaluationId: string;
}

export function EvaluationDetail({ evaluationId }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const [reponses, setReponses] = useState<Record<string, Reponse>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // ✅ AJOUT : Timer pour mettre à jour l'UI en temps réel (si on reste sur la page)
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000); // Vérifie toutes les 10s
    return () => clearInterval(interval);
  }, []);

  // ✅ AJOUT : Avertir l'utilisateur s'il tente de quitter la page en pleine évaluation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const isDoingExam = Object.keys(reponses).length > 0 && !success;
      if (isDoingExam) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [reponses, success]);

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
        reponses: { parQuestion: reponses },
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

  // ─── 1. Loading ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  // ─── 2. Erreur ───────────────────────────────────────────────────────────
  if (isError || !evaluation) {
    return <QueryErrorState onRetry={() => { void refetch(); }} isRetrying={isFetching} />;
  }

  // ─── 3. Écran Succès ─────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-10 animate-fade-in">
        <Card className="border-odc-success/30 shadow-lg">
          <CardContent className="py-16 text-center">
            <div className="w-24 h-24 rounded-full bg-odc-success-bg flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-odc-success" />
            </div>
            <h2 className="font-display text-3xl font-bold mb-3 text-slate-900 dark:text-white">
              Évaluation soumise !
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Votre travail a bien été transmis à votre formateur. Vous recevrez votre note dès qu'elle aura été corrigée.
            </p>
            <Button variant="odc" size="lg" className="w-full sm:w-auto" onClick={() => router.push('/participant/evaluations')}>
              <ArrowLeft className="h-5 w-5 mr-2" /> Retour au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── 4. Logique des statuts ──────────────────────────────────────────────
  const dejaSoumise = !!evaluation.maSoumission;
  const locked = !evaluation.publiee;
  
  const dateDebut = evaluation.dateDebut ? new Date(evaluation.dateDebut).getTime() : null;
  const dateFin = evaluation.dateFin ? new Date(evaluation.dateFin).getTime() : null;
  
  const isAVenir = dateDebut !== null && now < dateDebut;
  const isExpiree = dateFin !== null && now > dateFin;
  const isDisponible = !locked && !isAVenir && !isExpiree && !dejaSoumise;
  
  const canSubmit = hasQuestions 
    ? answered > 0 
    : !!(reponses['__global__'] as any)?.texte?.trim();

  // ─── 5. Rendu principal ──────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 animate-fade-in relative">
      
      {/* Bouton Retour */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
      </Button>

      {/* ═══════════════ BANNIÈRE DE STATUT ═══════════════ */}
      {locked && (
        <div className="bg-gray-100 border border-gray-200 text-gray-700 p-4 rounded-xl flex items-center gap-3">
          <Lock className="h-5 w-5" />
          <p className="text-sm font-medium">Cette évaluation n'est pas encore publiée par votre formateur.</p>
        </div>
      )}
      {isAVenir && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex items-center gap-3">
          <Clock className="h-5 w-5" />
          <p className="text-sm font-medium">
            Cette évaluation sera disponible à partir du <strong>{formatDate(evaluation.dateDebut!)}</strong>.
          </p>
        </div>
      )}
      {isExpiree && !dejaSoumise && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">La date limite pour passer cette évaluation est dépassée.</p>
        </div>
      )}
      {isDisponible && (
        <div className="bg-odc-success-bg border border-odc-success/30 text-odc-success p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PlayCircle className="h-5 w-5" />
            <p className="text-sm font-medium">L'évaluation est ouverte. Vous pouvez commencer.</p>
          </div>
          {dateFin && (
            <Badge variant="outline" className="bg-white/50 text-odc-success border-odc-success/30">
              Ferme le {formatDate(evaluation.dateFin!)}
            </Badge>
          )}
        </div>
      )}

      {/* ═══════════════ CARTE PRINCIPALE ═══════════════ */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-odc-primary/10 text-odc-primary hover:bg-odc-primary/20 border-0">
                {evaluation.type}
              </Badge>
              {dejaSoumise && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Soumise
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              {evaluation.dureeMinutes && !dejaSoumise && isDisponible && (
                <div className="flex items-center gap-1.5 font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  <Timer minutes={evaluation.dureeMinutes} />
                </div>
              )}
              <span className="font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                Barème : {evaluation.noteMax} pts
              </span>
            </div>
          </div>

          <CardTitle className="text-2xl sm:text-3xl font-display font-bold leading-tight">
            {evaluation.titre}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          
          {/* Meta */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-500">
            {evaluation.dateEvaluation && (
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                Prévue le {formatDate(evaluation.dateEvaluation)}
              </span>
            )}
            {evaluation.dureeMinutes && (
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                Durée : {evaluation.dureeMinutes} min
              </span>
            )}
            {hasQuestions && (
              <span className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-slate-400" />
                {questions.length} question{questions.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Description & Consignes */}
          {(evaluation.description || evaluation.consignes) && <Separator />}
          
          {evaluation.description && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Description
              </h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {evaluation.description}
              </p>
            </div>
          )}

          {evaluation.consignes && (
            <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30">
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Consignes importantes
              </h3>
              <p className="text-sm text-amber-900/80 dark:text-amber-200/80 whitespace-pre-line leading-relaxed">
                {evaluation.consignes}
              </p>
            </div>
          )}

          <Separator />

          {/* ═══════════════ ZONE DE TRAVAIL ═══════════════ */}
          {dejaSoumise ? (
            <ConsultationView evaluation={evaluation} />
          ) : !isDisponible ? (
             // Si pas disponible, la bannière en haut gère le message, on ne montre rien ici.
             <div className="py-12 text-center text-slate-400">
               <Lock className="h-10 w-10 mx-auto mb-3 opacity-20" />
               <p>En attente d'ouverture...</p>
             </div>
          ) : (
            <>
              {/* Barre de progression */}
              {hasQuestions && (
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-sm font-medium mb-2">
                    <span className="text-slate-600 dark:text-slate-400">Progression de l'évaluation</span>
                    <span className="text-odc-primary">{answered} / {questions.length}</span>
                  </div>
                  <Progress value={progress} className="h-2.5 bg-slate-200" />
                </div>
              )}

              {/* Questions */}
              {hasQuestions ? (
                <div className="space-y-6">
                  {questions.map((q, i) => (
                    <QuestionField
                      key={q.id}
                      question={q}
                      index={i}
                      value={reponses[q.id]}
                      onChange={(r) => setReponses((prev) => ({ ...prev, [q.id]: r }))}
                      disabled={mutation.isPending}
                    />
                  ))}
                </div>
              ) : (
                /* Texte libre si aucune question structurée */
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Votre réponse</h3>
                  <textarea
                    className="w-full min-h-[250px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 text-sm focus:ring-2 focus:ring-odc-primary focus:border-transparent transition-all"
                    placeholder="Rédigez votre réponse ici…"
                    value={(reponses['__global__'] as any)?.texte ?? ''}
                    onChange={(e) => setReponses((prev) => ({ ...prev, __global__: { type: 'TEXTE_LONG', texte: e.target.value } }))}
                    disabled={mutation.isPending}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ═══════════════ BARRE D'ACTION FIXE (STICKY FOOTER) ═══════════════ */}
      {isDisponible && !dejaSoumise && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden sm:block text-sm text-slate-500">
              Assurez-vous d'avoir répondu à toutes les questions avant de soumettre.
            </div>
            <Button
              variant="odc"
              size="lg"
              className="w-full sm:w-auto shadow-lg shadow-odc-primary/20"
              onClick={() => setConfirmOpen(true)}
              disabled={mutation.isPending || !canSubmit}
            >
              <Send className="h-4 w-4 mr-2" />
              Soumettre l'évaluation
            </Button>
          </div>
        </div>
      )}

      {/* Dialogue de confirmation */}
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

// ─── SOUS-COMPOSANT : VUE CONSULTATION (Après soumission) ────────────────────
function ConsultationView({ evaluation }: { evaluation: ParticipantEvaluationDetail }) {
  const s = evaluation.maSoumission!;
  const questions = evaluation.questions ?? [];
  
  // On récupère les réponses (selon ce que renvoie l'API)
  const parQuestion = s.reponsesParQuestion ?? {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Bandeau de résultats */}
      <div className="rounded-xl border border-odc-success/30 bg-odc-success-bg/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-odc-success/20 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-odc-success" />
          </div>
          <div>
            <p className="font-semibold text-odc-success">Évaluation soumise</p>
            <p className="text-sm text-odc-success/70">Le {formatDate(s.soumisAt)}</p>
          </div>
        </div>
        
        {typeof s.noteObtenue === 'number' && (
          <div className="bg-white rounded-lg px-4 py-2 border border-odc-success/20 shadow-sm flex items-baseline gap-1">
            <span className="text-sm text-slate-500 mr-2">Note obtenue</span>
            <span className="text-2xl font-bold text-odc-primary">{s.noteObtenue}</span>
            <span className="text-sm text-slate-400">/ {s.noteMaxSnapshot ?? evaluation.noteMax}</span>
          </div>
        )}
      </div>

      {/* Feedback formateur */}
      {(s.commentaire || s.feedbackFormateur) && (
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
            <Award className="h-4 w-4 text-odc-primary" /> Feedback du formateur
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
            {s.feedbackFormateur || s.commentaire}
          </p>
        </div>
      )}

      {/* Détail des réponses */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Eye className="h-5 w-5 text-slate-400" /> Détail de vos réponses
          </h3>
          <div className="grid gap-4">
            {questions.map((q, i) => {
              const r = parQuestion[q.id];
              return (
                <div key={q.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                      {q.enonce}
                    </p>
                  </div>
                  <div className="pl-9">
                    <ReponseDisplay question={q} reponse={r} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SOUS-COMPOSANT : AFFICHAGE D'UNE RÉPONSE ────────────────────────────────
function ReponseDisplay({ question, reponse }: { question: Question; reponse?: Reponse }) {
  if (!reponse) {
    return <p className="text-sm italic text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100">Aucune réponse fournie</p>;
  }
  
  switch (reponse.type) {
    case 'QCM': {
      const opt = question.options?.find((o) => o.id === reponse.optionId);
      return <div className="text-sm font-medium p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">{opt?.label ?? 'Option inconnue'}</div>;
    }
    case 'QCM_MULTIPLE': {
      const labels = reponse.optionIds.map((id) => question.options?.find((o) => o.id === id)?.label ?? id);
      return (
        <ul className="text-sm space-y-2">
          {labels.map((l, i) => (
            <li key={i} className="p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">{l}</li>
          ))}
        </ul>
      );
    }
    case 'VRAI_FAUX':
      return <div className="text-sm font-medium p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">{reponse.valeur ? 'Vrai' : 'Faux'}</div>;
    case 'TEXTE_COURT':
    case 'TEXTE_LONG':
      return <p className="text-sm whitespace-pre-line p-4 bg-slate-50 rounded-lg border border-slate-100">{reponse.texte}</p>;
    case 'CODE':
      return <pre className="text-xs font-mono bg-slate-900 text-slate-50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">{reponse.texte}</pre>;
    case 'FICHIER':
      return <a href={reponse.fichierUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-odc-primary hover:underline p-2 bg-odc-primary/5 rounded-lg">{reponse.nomFichier}</a>;
    default:
      return null;
  }
}