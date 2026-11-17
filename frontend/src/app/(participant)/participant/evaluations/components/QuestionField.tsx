'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Circle, FileCheck, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  Question, Reponse, QUESTION_TYPE_LABEL, isAnswered,
} from '@/lib/evaluations/participant-detail';

interface Props {
  question: Question;
  index: number;
  value?: Reponse;
  onChange: (r: Reponse) => void;
  disabled?: boolean;
}

export function QuestionField({ question, index, value, onChange, disabled }: Props) {
  const [uploading, setUploading] = useState(false);
  const type = question.type as string;
  const needsOptions = type === 'QCM' || type === 'QCM_MULTIPLE';
  const hasOptions = (question.options?.length ?? 0) > 0;

  return (
    <div className="rounded-lg border border-odc-border p-4 space-y-3">
      {/* En-tête */}
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-odc-primary-soft text-odc-primary text-xs font-semibold">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm whitespace-pre-line">
            {question.enonce || <em className="text-odc-muted">Énoncé manquant</em>}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[10px]">
              {QUESTION_TYPE_LABEL[type] ?? type}
            </Badge>
            <span className="text-xs text-odc-muted">
              {question.points} pt{question.points > 1 ? 's' : ''}
            </span>
            {question.obligatoire && (
              <span className="text-xs text-destructive font-medium">* Obligatoire</span>
            )}
            {isAnswered(value) && (
              <span className="text-xs text-odc-success flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Répondu
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Alerte : pas d'options disponibles */}
      {needsOptions && !hasOptions && (
        <div className="pl-10">
          <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Aucune option n'a été renvoyée pour cette question. Contactez votre formateur.
            </span>
          </div>
        </div>
      )}

      {/* QCM */}
      {type === 'QCM' && hasOptions && (
        <div className="space-y-2 pl-10">
          {question.options!.map((opt) => {
            const selected = value?.type === 'QCM' && value.optionId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ type: 'QCM', optionId: opt.id })}
                className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                  selected
                    ? 'border-odc-primary bg-odc-primary-soft text-odc-primary'
                    : 'border-odc-border hover:bg-odc-surface-alt'
                } disabled:opacity-60`}
              >
                {selected
                  ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                  : <Circle className="h-4 w-4 shrink-0 text-odc-muted" />}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* QCM multiple */}
      {type === 'QCM_MULTIPLE' && hasOptions && (
        <div className="space-y-2 pl-10">
          {question.options!.map((opt) => {
            const selected =
              value?.type === 'QCM_MULTIPLE' && value.optionIds.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  const current = value?.type === 'QCM_MULTIPLE' ? value.optionIds : [];
                  const next = selected
                    ? current.filter((id) => id !== opt.id)
                    : [...current, opt.id];
                  onChange({ type: 'QCM_MULTIPLE', optionIds: next });
                }}
                className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                  selected
                    ? 'border-odc-primary bg-odc-primary-soft text-odc-primary'
                    : 'border-odc-border hover:bg-odc-surface-alt'
                } disabled:opacity-60`}
              >
                {selected
                  ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                  : <Circle className="h-4 w-4 shrink-0 text-odc-muted" />}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Vrai / Faux */}
      {type === 'VRAI_FAUX' && (
        <div className="flex gap-3 pl-10">
          {[true, false].map((v) => {
            const selected = value?.type === 'VRAI_FAUX' && value.valeur === v;
            return (
              <button
                key={String(v)}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ type: 'VRAI_FAUX', valeur: v })}
                className={`flex-1 rounded-lg border p-3 text-sm font-medium transition-colors ${
                  selected
                    ? 'border-odc-primary bg-odc-primary-soft text-odc-primary'
                    : 'border-odc-border hover:bg-odc-surface-alt'
                } disabled:opacity-60`}
              >
                {v ? 'Vrai' : 'Faux'}
              </button>
            );
          })}
        </div>
      )}

      {/* Texte court */}
      {type === 'TEXTE_COURT' && (
        <div className="pl-10">
          <Input
            value={value?.type === 'TEXTE_COURT' ? value.texte : ''}
            onChange={(e) => onChange({ type: 'TEXTE_COURT', texte: e.target.value })}
            placeholder="Votre réponse…"
            disabled={disabled}
          />
        </div>
      )}

      {/* Texte long */}
      {type === 'TEXTE_LONG' && (
        <div className="pl-10">
          <Textarea
            value={value?.type === 'TEXTE_LONG' ? value.texte : ''}
            onChange={(e) => onChange({ type: 'TEXTE_LONG', texte: e.target.value })}
            rows={6}
            placeholder="Rédigez votre réponse…"
            disabled={disabled}
          />
        </div>
      )}

      {/* Code */}
      {type === 'CODE' && (
        <div className="pl-10">
          <Textarea
            value={value?.type === 'CODE' ? value.texte : ''}
            onChange={(e) => onChange({ type: 'CODE', texte: e.target.value })}
            rows={8}
            className="font-mono text-xs"
            placeholder="// Votre code…"
            disabled={disabled}
            spellCheck={false}
          />
        </div>
      )}

      {/* Fichier */}
      {type === 'FICHIER' && (
        <div className="pl-10 space-y-2">
          {value?.type === 'FICHIER' && value.fichierUrl ? (
            <div className="flex items-center justify-between rounded-lg border border-odc-success/30 bg-odc-success-bg p-3">
              <div className="flex items-center gap-2 text-sm text-odc-success">
                <FileCheck className="h-4 w-4" />
                <span className="truncate">{value.nomFichier}</span>
              </div>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() =>
                    onChange({ type: 'FICHIER', fichierUrl: '', nomFichier: '' })
                  }
                  aria-label="Retirer le fichier"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-odc-border p-6 cursor-pointer hover:bg-odc-surface-alt transition-colors">
              <Upload className="h-6 w-6 text-odc-muted mb-2" />
              <span className="text-sm text-odc-muted">
                {uploading ? 'Envoi en cours…' : 'Cliquez pour déposer un fichier'}
              </span>
              <input
                type="file"
                className="hidden"
                disabled={disabled || uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  try {
                    const formData = new FormData();
                    formData.append('file', file);
                    const { data } = await api.post('/uploads', formData, {
                      headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    onChange({
                      type: 'FICHIER',
                      fichierUrl: data.data.url,
                      nomFichier: file.name,
                    });
                  } catch {
                    toast.error("Échec de l'envoi du fichier");
                  } finally {
                    setUploading(false);
                  }
                }}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}