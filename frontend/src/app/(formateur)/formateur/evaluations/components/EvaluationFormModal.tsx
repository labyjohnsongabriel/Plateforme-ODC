// src/components/evaluations/EvaluationFormModal.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Save, AlertTriangle } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import {
  EVALUATION_TYPES, EvaluationType, Question, RubricCriterion,
  getTypeConfig, isEvaluationType, isQuestionType,
  DEFAULT_EVALUATION_TYPE,
} from '@/lib/evaluations/types';
import {
  SessionOption,
  loadSessionsForEvaluation,
  isValidUuid,
  formatSessionLabel,
} from '@/lib/sessions';
import { SessionSelect } from '@/components/sessions/SessionSelect';
import { QuestionEditor } from './QuestionEditor';
import { RubricEditor } from './RubricEditor';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  evaluationId?: string;
  defaultSessionId?: string;
}

interface FormState {
  sessionId: string;
  titre: string;
  type: EvaluationType;
  noteMax: number;
  noteMinPassage: number;
  coefficient: number;
  dateEvaluation: string;
  dateDebut: string;  // ✅ Ajouté
  dateFin: string;    // ✅ Ajouté
  dureeMinutes: number;
  description: string;
  consignes: string;
  publiee: boolean;
  livrables: string;
  critereOral: string;
  outils: string;
  questions: Question[];
  rubric: RubricCriterion[];
}

const emptyForm = (sessionId: string, type: EvaluationType = 'QUIZ'): FormState => {
  const cfg = getTypeConfig(type);
  return {
    sessionId,
    titre: '',
    type,
    noteMax: cfg.defaultNoteMax,
    noteMinPassage: cfg.defaultNoteMinPassage,
    coefficient: cfg.defaultCoefficient,
    dateEvaluation: '',
    dateDebut: '',
    dateFin: '',
    dureeMinutes: cfg.defaultDureeMinutes,
    description: '',
    consignes: '',
    publiee: false,
    livrables: '',
    critereOral: '',
    outils: '',
    questions: [],
    rubric: [],
  };
};

/* Formate une date pour l'input[type="datetime-local"] de manière sécurisée */
const formatDateTimeForInput = (dateValue: any): string => {
  if (!dateValue) return '';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localIso = new Date(date.getTime() - tzOffset).toISOString();
    return localIso.slice(0, 16); // YYYY-MM-DDTHH:mm
  } catch {
    return '';
  }
};

export function EvaluationFormModal({
  open, onOpenChange, mode, evaluationId, defaultSessionId,
}: Props) {
  const qc = useQueryClient();
  const isEdit = mode === 'edit';
  const [tab, setTab] = useState('infos');
  const [form, setForm] = useState<FormState>(emptyForm(defaultSessionId ?? ''));

  const cfg = getTypeConfig(form.type);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleTypeChange = (type: EvaluationType) => {
    const c = getTypeConfig(type);
    setForm((f) => ({
      ...f,
      type,
      coefficient: c.defaultCoefficient,
      dureeMinutes: c.defaultDureeMinutes,
      noteMax: c.defaultNoteMax,
      noteMinPassage: c.defaultNoteMinPassage,
      questions: c.showQuestions ? f.questions : [],
      rubric: c.showRubric ? f.rubric : [],
    }));
  };

  const {
    data: sessions = [],
    isLoading: sessionsLoading,
    isError: sessionsError,
    error: sessionsErrorObj,
    refetch: refetchSessions,
    isFetching: sessionsFetching,
  } = useQuery<SessionOption[]>({
    queryKey: ['formateur', 'sessions', 'evaluation-form'],
    queryFn: () => loadSessionsForEvaluation({ includeArchived: true, limit: 100 }),
    enabled: open,                 
    staleTime: 60_000,             
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['formateur', 'evaluation', evaluationId],
    queryFn: async () => {
      const { data } = await api.get(`/formateur/evaluations/${evaluationId}`);
      return (data?.data ?? data) as any;
    },
    enabled: open && isEdit && !!evaluationId,
  });

  useEffect(() => {
    if (isEdit && existing) {
      const e = existing;
      setForm({
        sessionId: e.sessionId ?? e.session_id ?? '',
        titre: e.titre ?? '',
        type: (isEvaluationType(e.type) ? e.type : DEFAULT_EVALUATION_TYPE) as EvaluationType,
        noteMax: Number(e.noteMax ?? e.note_max ?? 20),
        noteMinPassage: Number(e.noteMinPassage ?? e.note_min_passage ?? 10),
        coefficient: Number(e.coefficient ?? 1),
        dateEvaluation: e.dateEvaluation ?? e.date_evaluation ? formatDateTimeForInput(e.dateEvaluation ?? e.date_evaluation).split('T')[0] : '',
        dateDebut: formatDateTimeForInput(e.dateDebut ?? e.date_debut),
        dateFin: formatDateTimeForInput(e.dateFin ?? e.date_fin),
        dureeMinutes: Number(e.dureeMinutes ?? e.duree_minutes ?? 60),
        description: e.description ?? '',
        consignes: e.consignes ?? '',
        publiee: Boolean(e.publiee),
        livrables: e.livrables ?? '',
        critereOral: e.critereOral ?? e.critere_oral ?? '',
        outils: e.outils ?? '',
        questions: (e.questions ?? []).map((q: any) => ({
          id: q.id,
          type: isQuestionType(q.type) ? q.type : 'QCM',
          enonce: q.enonce ?? '',
          points: Number(q.points ?? 1),
          obligatoire: Boolean(q.obligatoire),
          ordre: Number(q.ordre ?? 0),
          bonneReponse: q.bonneReponse ?? q.bonne_reponse ?? null,
          explication: q.explication ?? null,
          options: (q.options ?? q.question_options ?? []).map((o: any) => ({
            id: o.id,
            label: o.label ?? '',
            correct: Boolean(o.correct),
            ordre: Number(o.ordre ?? 0),
            explication: o.explication ?? null,
          })),
        })),
        rubric: (e.rubric ?? e.rubricCriteria ?? e.rubric_criteria ?? []).map((c: any) => ({
          id: c.id,
          label: c.label ?? '',
          description: c.description ?? '',
          poids: Number(c.poids ?? 1),
          noteMax: Number(c.noteMax ?? c.note_max ?? 5),
          ordre: Number(c.ordre ?? 0),
        })),
      });
    }
  }, [existing, isEdit]);

  useEffect(() => {
    if (!open) {
      setTab('infos');
      if (!isEdit) setForm(emptyForm(defaultSessionId ?? ''));
    }
  }, [open, isEdit, defaultSessionId]);

  const currentSessionFallback = useMemo(() => {
    if (!isEdit || !existing) return undefined;
    const id = form.sessionId;
    if (!id) return undefined;
    if (sessions.some((s) => s.id === id)) return undefined;

    const e = existing;
    const label = e.session?.codeSession ?? e.session?.code_session ?? e.sessionCode ?? e.session_code ?? formatSessionLabel({ id, codeSession: '', formationTitre: e.session?.formation?.titre ?? '' });
    return { id, label };
  }, [isEdit, existing, form.sessionId, sessions]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!isValidUuid(form.sessionId)) throw new Error('Session invalide : un UUID est requis');

      const payload = {
        sessionId: form.sessionId,
        titre: form.titre.trim(),
        type: form.type,
        noteMax: form.noteMax,
        noteMinPassage: form.noteMinPassage,
        coefficient: form.coefficient,
        dateEvaluation: form.dateEvaluation || null,
        dateDebut: form.dateDebut || null, // ✅ Ajouté au payload
        dateFin: form.dateFin || null,     // ✅ Ajouté au payload
        dureeMinutes: cfg.showDuree ? form.dureeMinutes : null,
        description: form.description.trim() || null,
        consignes: form.consignes.trim() || null,
        publiee: form.publiee,
        livrables: cfg.extraFields?.includes('livrables') ? form.livrables.trim() || null : null,
        outils: cfg.extraFields?.includes('outils') ? form.outils.trim() || null : null,
        critereOral: cfg.extraFields?.includes('critereOral') ? form.critereOral.trim() || null : null,
        questions: cfg.showQuestions ? form.questions.map((q) => ({
          type: q.type, enonce: q.enonce.trim(), points: q.points, obligatoire: q.obligatoire, ordre: q.ordre, bonneReponse: q.bonneReponse ?? null, explication: q.explication ?? null,
          options: q.type === 'QCM' || q.type === 'QCM_MULTIPLE' || q.type === 'VRAI_FAUX' ? q.options.map((o, i) => ({ label: o.label.trim(), correct: o.correct, ordre: o.ordre ?? i, explication: o.explication ?? null })) : [],
        })) : [],
        rubric: cfg.showRubric ? form.rubric.map((c, i) => ({ label: c.label.trim(), description: c.description?.trim() ?? '', poids: c.poids, noteMax: c.noteMax, ordre: c.ordre ?? i })) : [],
      };

      if (isEdit) {
        await api.put(`/formateur/evaluations/${evaluationId}`, payload);
      } else {
        await api.post('/formateur/evaluations', payload);
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Évaluation mise à jour' : 'Évaluation créée');
      qc.invalidateQueries({ queryKey: ['formateur', 'evaluations'] });
      qc.invalidateQueries({ queryKey: ['formateur', 'evaluation', evaluationId] });
      onOpenChange(false);
    },
    onError: (e) => {
      toast.error(getErrorMessage(e));
    },
  });

  const canSubmit = useMemo(() => !!form.sessionId && isValidUuid(form.sessionId) && !!form.titre.trim() && !mutation.isPending, [form.sessionId, form.titre, mutation.isPending]);

  const errorMessage = sessionsErrorObj instanceof Error ? sessionsErrorObj.message : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier l'évaluation" : 'Nouvelle évaluation'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Ajustez les informations ci-dessous.' : "Le formulaire s'adapte au type d'évaluation choisi."}</DialogDescription>
        </DialogHeader>

        {loadingExisting ? (
          <div className="h-64 animate-pulse rounded-lg bg-odc-surface-alt" />
        ) : (
          <form id="evaluation-form" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full">
                <TabsTrigger value="infos" className="flex-1">Informations</TabsTrigger>
                {cfg.showQuestions && <TabsTrigger value="questions" className="flex-1">Questions ({form.questions.length})</TabsTrigger>}
                {cfg.showRubric && <TabsTrigger value="rubric" className="flex-1">Grille ({form.rubric.length})</TabsTrigger>}
                <TabsTrigger value="publication" className="flex-1">Publication</TabsTrigger>
              </TabsList>

              <TabsContent value="infos" className="space-y-5 mt-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <SessionSelect sessions={sessions} value={form.sessionId} onChange={(v) => set('sessionId', v)} disabled={false} isLoading={sessionsLoading} isError={sessionsError} errorMessage={errorMessage} isFetching={sessionsFetching} onRetry={() => void refetchSessions()} currentSessionFallback={currentSessionFallback} required />
                    {isEdit && <p className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400"><AlertTriangle className="h-3 w-3" /> Modifier la session peut affecter les participants.</p>}
                  </div>
                  <div>
                    <Label>Type *</Label>
                    <Select value={form.type} onValueChange={(v) => handleTypeChange(v as EvaluationType)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {EVALUATION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}><span className="mr-2" aria-hidden>{t.icon}</span>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="titre">Titre *</Label>
                  <Input id="titre" value={form.titre} onChange={(e) => set('titre', e.target.value)} required className="mt-1.5" placeholder="Titre de l'évaluation" />
                </div>

                <Separator />

                <div className={`grid gap-4 ${cfg.showCoefficient ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                  <div><Label htmlFor="noteMax">Note max</Label><Input id="noteMax" type="number" value={form.noteMax} onChange={(e) => set('noteMax', Number(e.target.value))} min={1} max={100} className="mt-1.5" /></div>
                  <div><Label htmlFor="noteMin">Note min. passage</Label><Input id="noteMin" type="number" value={form.noteMinPassage} onChange={(e) => set('noteMinPassage', Number(e.target.value))} min={0} max={100} className="mt-1.5" /></div>
                  {cfg.showCoefficient && <div><Label htmlFor="coefficient">Coefficient</Label><Input id="coefficient" type="number" step="0.5" value={form.coefficient} onChange={(e) => set('coefficient', Number(e.target.value))} min={0.5} max={10} className="mt-1.5" /></div>}
                </div>

                {/* ✅ AJOUT DES DATES DE DÉBUT ET DE FIN */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="dateDebut">Date d'ouverture (Début)</Label>
                    <Input id="dateDebut" type="datetime-local" value={form.dateDebut} onChange={(e) => set('dateDebut', e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="dateFin">Date de fermeture (Fin)</Label>
                    <Input id="dateFin" type="datetime-local" value={form.dateFin} onChange={(e) => set('dateFin', e.target.value)} className="mt-1.5" />
                  </div>
                </div>

                <div className={`grid gap-4 ${cfg.showDuree ? 'sm:grid-cols-2' : ''}`}>
                  {cfg.showDate && <div><Label htmlFor="dateEvaluation">Date prévue</Label><Input id="dateEvaluation" type="date" value={form.dateEvaluation} onChange={(e) => set('dateEvaluation', e.target.value)} className="mt-1.5" /></div>}
                  {cfg.showDuree && <div><Label htmlFor="duree">Durée (minutes)</Label><Input id="duree" type="number" value={form.dureeMinutes} onChange={(e) => set('dureeMinutes', Number(e.target.value))} min={5} className="mt-1.5" /></div>}
                </div>

                <div><Label htmlFor="description">Description</Label><Textarea id="description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className="mt-1.5" placeholder={cfg.descriptionHint} /></div>
                <div><Label htmlFor="consignes">Consignes</Label><Textarea id="consignes" value={form.consignes} onChange={(e) => set('consignes', e.target.value)} rows={4} className="mt-1.5" placeholder={cfg.consignesHint} /></div>
              </TabsContent>

              {cfg.showQuestions && <TabsContent value="questions" className="mt-4"><QuestionEditor questions={form.questions} onChange={(qs) => set('questions', qs)} /></TabsContent>}
              {cfg.showRubric && <TabsContent value="rubric" className="mt-4"><RubricEditor criteria={form.rubric} onChange={(rs) => set('rubric', rs)} /></TabsContent>}

              <TabsContent value="publication" className="space-y-4 mt-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div><Label htmlFor="publiee">Publier l'évaluation</Label><p className="text-xs text-odc-muted mt-0.5">Les participants pourront la voir et la passer</p></div>
                  <Switch id="publiee" checked={form.publiee} onCheckedChange={(v) => set('publiee', v)} />
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                  <strong>Rappel :</strong> une évaluation publiée est immédiatement visible par les participants.
                </div>
              </TabsContent>
            </Tabs>
          </form>
        )}

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>Annuler</Button>
          <Button type="submit" form="evaluation-form" variant="odc" disabled={!canSubmit}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isEdit ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}