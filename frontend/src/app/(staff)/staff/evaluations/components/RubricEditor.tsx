// src/app/(staff)/staff/evaluations/components/RubricEditor.tsx
'use client';

import { useMemo } from 'react';
import {
  Plus, Trash2, AlertCircle, GripVertical, ChevronUp, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RubricCriterion, newCriterion } from '@/lib/evaluations/types';

interface Props {
  criteria: RubricCriterion[];
  onChange: (criteria: RubricCriterion[]) => void;
}

export function RubricEditor({ criteria, onChange }: Props) {
  const update = (id: string, patch: Partial<RubricCriterion>) =>
    onChange(criteria.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const remove = (id: string) => onChange(
    criteria.filter((c) => c.id !== id).map((c, i) => ({ ...c, ordre: i })),
  );

  const add = () => onChange([...criteria, newCriterion(criteria.length)]);

  const move = (id: string, dir: -1 | 1) => {
    const idx = criteria.findIndex((c) => c.id === id);
    const t = idx + dir;
    if (t < 0 || t >= criteria.length) return;
    const next = [...criteria];
    [next[idx], next[t]] = [next[t], next[idx]];
    onChange(next.map((c, i) => ({ ...c, ordre: i })));
  };

  const totalPoids = useMemo(
    () => criteria.reduce((s, c) => s + (Number(c.poids) || 0), 0),
    [criteria],
  );
  const totalNoteMax = useMemo(
    () => criteria.reduce((s, c) => s + (Number(c.noteMax) || 0), 0),
    [criteria],
  );
  const hasInvalid = useMemo(
    () =>
      criteria.some(
        (c) =>
          !c.label?.trim() ||
          !(Number(c.poids) > 0) ||
          !(Number(c.noteMax) > 0),
      ),
    [criteria],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">Grille d'évaluation</h3>
          <p className="text-xs text-odc-muted">
            {criteria.length} critère{criteria.length > 1 ? 's' : ''} • Poids total :{' '}
            <span className="font-medium tabular-nums text-foreground">{totalPoids}</span>{' '}
            • Note max cumulée :{' '}
            <span className="font-medium tabular-nums text-foreground">{totalNoteMax}</span>
          </p>
        </div>
        <Button type="button" variant="odc" size="sm" onClick={add}>
          <Plus className="h-4 w-4 mr-1.5" aria-hidden /> Ajouter un critère
        </Button>
      </div>

      {hasInvalid && criteria.length > 0 && (
        <div role="alert"
          className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          <span>
            Certains critères sont incomplets : renseignez un libellé, un poids
            et une note max strictement positifs.
          </span>
        </div>
      )}

      {criteria.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-odc-muted">
            Aucun critère. Ajoutez-en pour structurer l'évaluation.
          </CardContent>
        </Card>
      )}

      {criteria.map((c, i) => {
        const invalidLabel = !c.label?.trim();
        const invalidPoids = !(Number(c.poids) > 0);
        const invalidNoteMax = !(Number(c.noteMax) > 0);

        return (
          <Card key={c.id} className="overflow-hidden">
            <div className="flex items-center gap-2 border-b bg-odc-surface-alt/50 px-4 py-2">
              <GripVertical className="h-4 w-4 text-odc-muted cursor-grab" aria-hidden />
              <span className="text-xs font-mono text-odc-muted">Critère {i + 1}</span>

              {invalidLabel || invalidPoids || invalidNoteMax ? (
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
                  onClick={() => move(c.id, -1)} disabled={i === 0}
                  aria-label="Monter le critère">
                  <ChevronUp className="h-4 w-4" aria-hidden />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7"
                  onClick={() => move(c.id, 1)} disabled={i === criteria.length - 1}
                  aria-label="Descendre le critère">
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </Button>
                <Button type="button" variant="ghost" size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => remove(c.id)}
                  aria-label={`Supprimer le critère ${i + 1}`}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              <div>
                <Label htmlFor={`label-${c.id}`}>
                  Libellé <span className="text-destructive">*</span>
                </Label>
                <Input id={`label-${c.id}`} value={c.label}
                  onChange={(e) => update(c.id, { label: e.target.value })}
                  className="mt-1.5"
                  placeholder="Ex : Pertinence de l'analyse"
                  aria-invalid={invalidLabel || undefined}
                />
                {invalidLabel && (
                  <p className="mt-1 text-xs text-destructive">Le libellé est requis.</p>
                )}
              </div>

              <div>
                <Label htmlFor={`desc-${c.id}`}>Description</Label>
                <Textarea id={`desc-${c.id}`} value={c.description ?? ''}
                  onChange={(e) => update(c.id, { description: e.target.value })}
                  rows={2} className="mt-1.5"
                  placeholder="Ce que l'on attend concrètement…"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label htmlFor={`poids-${c.id}`}>
                    Poids <span className="text-destructive">*</span>
                  </Label>
                  <Input id={`poids-${c.id}`} type="number" min={0.5} step={0.5}
                    value={c.poids}
                    onChange={(e) => update(c.id, { poids: Number(e.target.value) })}
                    className="mt-1.5"
                    aria-invalid={invalidPoids || undefined}
                  />
                  {invalidPoids && (
                    <p className="mt-1 text-xs text-destructive">Doit être &gt; 0.</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`notemax-${c.id}`}>
                    Note max <span className="text-destructive">*</span>
                  </Label>
                  <Input id={`notemax-${c.id}`} type="number" min={1} step={0.5}
                    value={c.noteMax}
                    onChange={(e) => update(c.id, { noteMax: Number(e.target.value) })}
                    className="mt-1.5"
                    aria-invalid={invalidNoteMax || undefined}
                  />
                  {invalidNoteMax && (
                    <p className="mt-1 text-xs text-destructive">Doit être &gt; 0.</p>
                  )}
                </div>

                <div>
                  <Label>Barème indicatif</Label>
                  <div className="mt-1.5 flex h-9 items-center rounded-md border bg-odc-surface-alt/40 px-3 text-xs text-odc-muted tabular-nums">
                    {totalPoids > 0
                      ? `${Math.round((Number(c.poids) / totalPoids) * 100)} % du total`
                      : '—'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}