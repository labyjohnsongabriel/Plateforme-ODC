// src/app/(staff)/staff/evaluations/components/QuestionEditor.tsx
'use client';

import {
  Plus, Trash2, GripVertical, CheckCircle2, Circle, ChevronUp, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  QUESTION_TYPES, Question, QuestionType, QuestionOption,
  newQuestion, newOption,
} from '@/lib/evaluations/types';

interface Props {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}

export function QuestionEditor({ questions, onChange }: Props) {
  const update = (id: string, patch: Partial<Question>) =>
    onChange(questions.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const remove = (id: string) => onChange(
    questions.filter((q) => q.id !== id).map((q, i) => ({ ...q, ordre: i })),
  );

  const addQuestion = () =>
    onChange([...questions, newQuestion('QCM', 1, questions.length)]);

  const move = (id: string, dir: -1 | 1) => {
    const idx = questions.findIndex((q) => q.id === id);
    const t = idx + dir;
    if (t < 0 || t >= questions.length) return;
    const next = [...questions];
    [next[idx], next[t]] = [next[t], next[idx]];
    onChange(next.map((q, i) => ({ ...q, ordre: i })));
  };

  const handleTypeChange = (q: Question, type: QuestionType) => {
    let options: QuestionOption[] = [];
    if (type === 'VRAI_FAUX') {
      options = [newOption('Vrai', true, 0), newOption('Faux', false, 1)];
    } else if (type === 'QCM' || type === 'QCM_MULTIPLE') {
      options = [newOption('', false, 0), newOption('', false, 1)];
    }
    update(q.id, { type, options, bonneReponse: null });
  };

  const addOption = (q: Question) =>
    update(q.id, {
      options: [...q.options, newOption('', false, q.options.length)],
    });

  const updateOption = (q: Question, optId: string, patch: Partial<QuestionOption>) =>
    update(q.id, {
      options: q.options.map((o) => (o.id === optId ? { ...o, ...patch } : o)),
    });

  const removeOption = (q: Question, optId: string) =>
    update(q.id, {
      options: q.options
        .filter((o) => o.id !== optId)
        .map((o, i) => ({ ...o, ordre: i })),
    });

  const setCorrect = (q: Question, optId: string) => {
    if (q.type === 'QCM' || q.type === 'VRAI_FAUX') {
      update(q.id, {
        options: q.options.map((o) => ({ ...o, correct: o.id === optId })),
      });
    } else {
      update(q.id, {
        options: q.options.map((o) =>
          o.id === optId ? { ...o, correct: !o.correct } : o,
        ),
      });
    }
  };

  const totalPoints = questions.reduce((s, q) => s + (Number(q.points) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Questions</h3>
          <p className="text-xs text-odc-muted">
            {questions.length} question{questions.length > 1 ? 's' : ''} •{' '}
            <span className="font-medium tabular-nums text-foreground">
              {totalPoints}
            </span>{' '}
            point{totalPoints > 1 ? 's' : ''} au total
          </p>
        </div>
        <Button type="button" variant="odc" size="sm" onClick={addQuestion}>
          <Plus className="h-4 w-4 mr-1.5" aria-hidden /> Ajouter une question
        </Button>
      </div>

      {questions.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-odc-muted">
            Aucune question. Cliquez sur « Ajouter une question ».
          </CardContent>
        </Card>
      )}

      {questions.map((q, idx) => {
        const isChoice =
          q.type === 'QCM' || q.type === 'QCM_MULTIPLE' || q.type === 'VRAI_FAUX';
        const hasCorrect = q.options.some((o) => o.correct);
        const invalid =
          !q.enonce.trim() ||
          !(Number(q.points) > 0) ||
          (isChoice && (!hasCorrect || q.options.some((o) => !o.label.trim())));

        return (
          <Card key={q.id} className="overflow-hidden">
            <div className="flex items-center gap-2 border-b bg-odc-surface-alt/50 px-4 py-2">
              <GripVertical className="h-4 w-4 text-odc-muted cursor-grab" aria-hidden />
              <span className="text-xs font-mono text-odc-muted">Q{idx + 1}</span>

              {invalid ? (
                <Badge variant="outline" className="ml-auto text-[10px] border-amber-300 text-amber-700 dark:text-amber-400">
                  Incomplet
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-auto text-[10px] border-odc-success/40 text-odc-success">
                  OK
                </Badge>
              )}

              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7"
                  onClick={() => move(q.id, -1)} disabled={idx === 0}
                  aria-label="Monter la question">
                  <ChevronUp className="h-4 w-4" aria-hidden />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7"
                  onClick={() => move(q.id, 1)} disabled={idx === questions.length - 1}
                  aria-label="Descendre la question">
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </Button>
                <Button type="button" variant="ghost" size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => remove(q.id)}
                  aria-label={`Supprimer la question ${idx + 1}`}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Label htmlFor={`type-${q.id}`}>Type</Label>
                  <Select value={q.type}
                    onValueChange={(v) => handleTypeChange(q, v as QuestionType)}>
                    <SelectTrigger id={`type-${q.id}`} className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`points-${q.id}`}>
                    Points <span className="text-destructive">*</span>
                  </Label>
                  <Input id={`points-${q.id}`} type="number" min={0.5} step={0.5}
                    value={q.points}
                    onChange={(e) => update(q.id, { points: Number(e.target.value) })}
                    className="mt-1.5"
                    aria-invalid={!(Number(q.points) > 0) || undefined}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={`enonce-${q.id}`}>
                  Énoncé <span className="text-destructive">*</span>
                </Label>
                <Textarea id={`enonce-${q.id}`} value={q.enonce}
                  onChange={(e) => update(q.id, { enonce: e.target.value })}
                  rows={2} className="mt-1.5"
                  placeholder="Posez la question…"
                  aria-invalid={!q.enonce.trim() || undefined}
                />
              </div>

              {isChoice && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-odc-muted">
                      {q.type === 'QCM_MULTIPLE'
                        ? 'Cochez toutes les bonnes réponses'
                        : 'Cochez la bonne réponse'}
                    </Label>
                    {!hasCorrect && (
                      <span className="text-xs text-destructive">
                        Aucune bonne réponse cochée
                      </span>
                    )}
                  </div>
                  {q.options.map((o, oi) => (
                    <div key={o.id} className="flex items-center gap-2">
                      <button type="button" onClick={() => setCorrect(q, o.id)}
                        className="text-odc-primary shrink-0"
                        aria-label={`Marquer l'option ${oi + 1} comme correcte`}
                        aria-pressed={o.correct}>
                        {o.correct
                          ? <CheckCircle2 className="h-5 w-5" aria-hidden />
                          : <Circle className="h-5 w-5 text-odc-muted" aria-hidden />}
                      </button>
                      <Input value={o.label}
                        onChange={(e) => updateOption(q, o.id, { label: e.target.value })}
                        placeholder={`Option ${oi + 1}`}
                        disabled={q.type === 'VRAI_FAUX'}
                        aria-invalid={(isChoice && !o.label.trim()) || undefined}
                      />
                      {q.type !== 'VRAI_FAUX' && q.options.length > 2 && (
                        <Button type="button" variant="ghost" size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeOption(q, o.id)}
                          aria-label={`Supprimer l'option ${oi + 1}`}>
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                      )}
                    </div>
                  ))}
                  {q.type !== 'VRAI_FAUX' && (
                    <Button type="button" variant="ghost" size="sm"
                      onClick={() => addOption(q)}>
                      <Plus className="h-3.5 w-3.5 mr-1" aria-hidden /> Ajouter une option
                    </Button>
                  )}
                </div>
              )}

              {(q.type === 'TEXTE_COURT' || q.type === 'TEXTE_LONG' || q.type === 'CODE') && (
                <div>
                  <Label htmlFor={`rep-${q.id}`}>Réponse attendue (facultatif)</Label>
                  <Textarea id={`rep-${q.id}`} value={q.bonneReponse ?? ''}
                    onChange={(e) => update(q.id, { bonneReponse: e.target.value })}
                    rows={q.type === 'CODE' ? 4 : 2}
                    className="mt-1.5 font-mono text-xs"
                    placeholder={q.type === 'CODE' ? '// Réponse de référence' : 'Réponse attendue…'}
                  />
                </div>
              )}

              <div>
                <Label htmlFor={`expl-${q.id}`}>Explication (feedback après correction)</Label>
                <Textarea id={`expl-${q.id}`} value={q.explication ?? ''}
                  onChange={(e) => update(q.id, { explication: e.target.value })}
                  rows={2} className="mt-1.5"
                  placeholder="Pourquoi cette réponse est correcte…"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <Label htmlFor={`oblig-${q.id}`} className="text-xs">Obligatoire</Label>
                <Switch id={`oblig-${q.id}`} checked={q.obligatoire}
                  onCheckedChange={(v) => update(q.id, { obligatoire: v })} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}