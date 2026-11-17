// src/app/(admin)/admin/attestations/components/GenerateAttestationsDialog.tsx
'use client';

import * as React from 'react';
import {
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  Users,
  AlertTriangle,
  Info,
  Settings2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  UserCheck,
  UserX,
  Clock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ParticipantAvatar } from '@/components/shared/ParticipantAvatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  useSessionPreview,
  useGenerateAttestations,
  type EligibilityCriteria,
  type EligibleParticipant,
} from '@/hooks/useAttestations';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface GenerateAttestationsDialogProps {
  trigger?: React.ReactNode;
  defaultSessionId?: string;
  onSuccess?: (result: any) => void;
}

type Step = 'session' | 'criteria' | 'preview' | 'confirm';

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */

export function GenerateAttestationsDialog({
  trigger,
  defaultSessionId,
  onSuccess,
}: GenerateAttestationsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>('session');
  const [sessionId, setSessionId] = React.useState(defaultSessionId ?? '');
  const [criteria, setCriteria] = React.useState<EligibilityCriteria>({
    presenceMin: 75,
    noteMin: 10,
    selectionValidee: true,
    inscriptionValidee: true,
  });

  React.useEffect(() => {
    if (open) {
      setStep(defaultSessionId ? 'criteria' : 'session');
      setSessionId(defaultSessionId ?? '');
    }
  }, [open, defaultSessionId]);

  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['admin', 'sessions', 'terminees'],
    queryFn: async () => {
      const { data } = await api.get('/admin/sessions', {
        params: { statut: 'TERMINEE', limit: 200 },
      });
      return data?.data ?? [];
    },
    enabled: open && step === 'session',
    staleTime: 60_000,
  });

  const {
    data: preview,
    isLoading: loadingPreview,
    error: previewError,
  } = useSessionPreview(
    sessionId,
    criteria,
    open && (step === 'preview' || step === 'confirm'),
  );

  const generateMutation = useGenerateAttestations();

  const handleNext = () => {
    if (step === 'session' && sessionId) setStep('criteria');
    else if (step === 'criteria') setStep('preview');
    else if (step === 'preview') setStep('confirm');
  };

  const handleBack = () => {
    if (step === 'criteria') setStep('session');
    else if (step === 'preview') setStep('criteria');
    else if (step === 'confirm') setStep('preview');
  };

  const handleGenerate = async () => {
    if (!sessionId) return;
    try {
      const result = await generateMutation.mutateAsync({
        sessionId,
        criteria,
      });
      onSuccess?.(result);
      setOpen(false);
    } catch {
      /* Erreur déjà gérée */
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            className={cn(
              'h-9 rounded-lg px-4 font-medium',
              'bg-slate-900 text-white hover:bg-slate-800',
              'dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
            )}
          >
            <Award className="mr-2 h-4 w-4" aria-hidden />
            Générer des attestations
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="flex max-h-[92vh] max-w-3xl flex-col gap-0 overflow-hidden border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-950">
        {/* En-tête */}
        <DialogHeader className="shrink-0 border-b border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm dark:bg-slate-50 dark:text-slate-900"
              aria-hidden
            >
              <Sparkles className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <DialogTitle className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
                Générer les attestations
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Étape {step === 'session' ? 1 : step === 'criteria' ? 2 : step === 'preview' ? 3 : 4} sur 4
                {' — '}
                {step === 'session' && 'Sélection de la session'}
                {step === 'criteria' && "Critères d'éligibilité"}
                {step === 'preview' && 'Aperçu des participants'}
                {step === 'confirm' && 'Confirmation'}
              </DialogDescription>
            </div>
          </div>

          <StepIndicator currentStep={step} />
        </DialogHeader>

        {/* Contenu */}
        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">
          {step === 'session' && (
            <SessionStep
              sessions={sessions}
              loading={loadingSessions}
              sessionId={sessionId}
              onSessionChange={setSessionId}
            />
          )}
          {step === 'criteria' && (
            <CriteriaStep criteria={criteria} onCriteriaChange={setCriteria} />
          )}
          {step === 'preview' && (
            <PreviewStep
              preview={preview}
              isLoading={loadingPreview}
              error={previewError}
            />
          )}
          {step === 'confirm' && (
            <ConfirmStep preview={preview} criteria={criteria} />
          )}
        </div>

        {/* Actions */}
        <DialogFooter className="shrink-0 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <div>
              {step !== 'session' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={generateMutation.isPending}
                  className="h-9 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" aria-hidden />
                  Retour
                </Button>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={generateMutation.isPending}
                className="h-9 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              >
                Annuler
              </Button>

              {step !== 'confirm' ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    (step === 'session' && !sessionId) ||
                    (step === 'preview' && !preview?.stats.eligibles)
                  }
                  className={cn(
                    'h-9 rounded-lg px-4 font-medium',
                    'bg-slate-900 text-white hover:bg-slate-800',
                    'dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                >
                  Suivant
                  <ChevronRight className="ml-2 h-4 w-4" aria-hidden />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className={cn(
                    'h-9 rounded-lg px-4 font-medium',
                    'bg-slate-900 text-white hover:bg-slate-800',
                    'dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Award className="mr-2 h-4 w-4" aria-hidden />
                  )}
                  {generateMutation.isPending
                    ? 'Génération…'
                    : `Générer ${preview?.stats.eligibles ?? 0} attestation${(preview?.stats.eligibles ?? 0) > 1 ? 's' : ''}`}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   INDICATEUR D'ÉTAPES
   ═══════════════════════════════════════════════════════════════════════════ */

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps: Array<{ key: Step; label: string }> = [
    { key: 'session', label: 'Session' },
    { key: 'criteria', label: 'Critères' },
    { key: 'preview', label: 'Aperçu' },
    { key: 'confirm', label: 'Confirmation' },
  ];

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="mt-4 flex items-center gap-2">
      {steps.map((s, i) => (
        <React.Fragment key={s.key}>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                i < currentIndex && 'bg-emerald-500 text-white',
                i === currentIndex &&
                  'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900',
                i > currentIndex &&
                  'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
              )}
            >
              {i < currentIndex ? (
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={cn(
                'text-xs font-medium',
                i <= currentIndex
                  ? 'text-slate-900 dark:text-slate-50'
                  : 'text-slate-500 dark:text-slate-400',
              )}
            >
              {s.label}
            </span>
          </div>

          {i < steps.length - 1 && (
            <div
              className={cn(
                'h-px flex-1 transition-colors',
                i < currentIndex
                  ? 'bg-emerald-500'
                  : 'bg-slate-200 dark:bg-slate-800',
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ÉTAPE 1 — SESSION
   ═══════════════════════════════════════════════════════════════════════════ */

interface SessionStepProps {
  sessions: any[];
  loading: boolean;
  sessionId: string;
  onSessionChange: (id: string) => void;
}

function SessionStep({
  sessions,
  loading,
  sessionId,
  onSessionChange,
}: SessionStepProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-amber-500 dark:text-amber-400" aria-hidden />
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          Aucune session terminée
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Terminez au moins une session avant de générer des attestations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="session" className="text-sm font-medium text-slate-900 dark:text-slate-50">
          Session terminée <span className="text-red-600 dark:text-red-400">*</span>
        </Label>
        <Select value={sessionId} onValueChange={onSessionChange}>
          <SelectTrigger id="session" className="mt-1.5">
            <SelectValue placeholder="Sélectionnez une session" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((s: any) => (
              <SelectItem key={s.id} value={s.id}>
                <div className="flex flex-col py-0.5">
                  <span className="font-medium">{s.formation?.titre ?? 'Session'}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {s.codeSession} · {formatDate(s.dateDebut)} → {formatDate(s.dateFin)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 dark:border-sky-500/30 dark:bg-sky-500/10">
        <p className="flex items-start gap-2 text-xs text-sky-800 dark:text-sky-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Seules les sessions <strong>terminées</strong> peuvent générer des
            attestations. Les participants doivent satisfaire aux critères
            d&apos;éligibilité définis à l&apos;étape suivante.
          </span>
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ÉTAPE 2 — CRITÈRES
   ═══════════════════════════════════════════════════════════════════════════ */

interface CriteriaStepProps {
  criteria: EligibilityCriteria;
  onCriteriaChange: (criteria: EligibilityCriteria) => void;
}

function CriteriaStep({ criteria, onCriteriaChange }: CriteriaStepProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
          <Settings2 className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden />
          Critères d&apos;éligibilité
        </p>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="presenceMin" className="text-slate-900 dark:text-slate-50">
                Taux de présence minimum
              </Label>
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-50">
                {criteria.presenceMin}%
              </span>
            </div>
            <Input
              id="presenceMin"
              type="range"
              min={0}
              max={100}
              step={5}
              value={criteria.presenceMin}
              onChange={(e) =>
                onCriteriaChange({
                  ...criteria,
                  presenceMin: Number(e.target.value),
                })
              }
              className="mt-2"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Recommandé : 75% minimum
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="noteMin" className="text-slate-900 dark:text-slate-50">
                Note finale minimum
              </Label>
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-50">
                {criteria.noteMin}/20
              </span>
            </div>
            <Input
              id="noteMin"
              type="range"
              min={0}
              max={20}
              step={1}
              value={criteria.noteMin}
              onChange={(e) =>
                onCriteriaChange({
                  ...criteria,
                  noteMin: Number(e.target.value),
                })
              }
              className="mt-2"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Recommandé : 10/20 minimum
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div>
            <Label className="cursor-pointer text-sm font-medium text-slate-900 dark:text-slate-50">
              Inscription validée
            </Label>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Le participant doit avoir une inscription validée par le staff
            </p>
          </div>
          <Switch
            checked={criteria.inscriptionValidee}
            onCheckedChange={(v) =>
              onCriteriaChange({ ...criteria, inscriptionValidee: v })
            }
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div>
            <Label className="cursor-pointer text-sm font-medium text-slate-900 dark:text-slate-50">
              Sélection validée
            </Label>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Le participant doit avoir été sélectionné pour la session
            </p>
          </div>
          <Switch
            checked={criteria.selectionValidee}
            onCheckedChange={(v) =>
              onCriteriaChange({ ...criteria, selectionValidee: v })
            }
          />
        </div>
      </div>

      <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Résumé des critères
        </p>
        <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
            Présence ≥ <strong>{criteria.presenceMin}%</strong>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
            Note ≥ <strong>{criteria.noteMin}/20</strong>
          </li>
          {criteria.inscriptionValidee && (
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
              Inscription <strong>validée</strong>
            </li>
          )}
          {criteria.selectionValidee && (
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
              Sélection <strong>validée</strong>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ÉTAPE 3 — APERÇU
   ═══════════════════════════════════════════════════════════════════════════ */

interface PreviewStepProps {
  preview: any;
  isLoading: boolean;
  error: any;
}

function PreviewStep({ preview, isLoading, error }: PreviewStepProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-950/30">
        <p className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
          <XCircle className="h-4 w-4" aria-hidden />
          Impossible de charger l&apos;aperçu. Vérifiez que la session contient
          des participants.
        </p>
      </div>
    );
  }

  if (!preview) return null;

  const { stats, participants } = preview;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
            {stats.total}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="text-xs text-emerald-700 dark:text-emerald-300">Éligibles</p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {stats.eligibles}
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-xs text-red-700 dark:text-red-300">Non éligibles</p>
          <p className="mt-1 font-display text-2xl font-bold text-red-700 dark:text-red-300">
            {stats.ineligibles}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Participants ({participants.length})
        </p>

        <div className="scrollbar-thin max-h-72 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-slate-800">
          {participants.map((p: EligibleParticipant) => (
            <ParticipantRow key={p.participantId} participant={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LIGNE PARTICIPANT
   ═══════════════════════════════════════════════════════════════════════════ */

function ParticipantRow({ participant }: { participant: EligibleParticipant }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-2.5 transition-colors',
        participant.eligible
          ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/30 dark:bg-emerald-500/10'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950',
      )}
    >
      <ParticipantAvatar
        prenom={participant.participant.prenom}
        nom={participant.participant.nom}
        photoUrl={participant.participant.photoUrl}
        size="md"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
          {participant.participant.prenom} {participant.participant.nom}
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {participant.participant.email}
        </p>
      </div>

      <div className="hidden items-center gap-3 sm:flex">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  participant.tauxPresence >= 75
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
                )}
              >
                <Clock className="h-3 w-3" aria-hidden />
                {participant.tauxPresence}%
              </span>
            </TooltipTrigger>
            <TooltipContent>Taux de présence</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {participant.noteFinale !== undefined && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    participant.noteFinale >= 10
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
                  )}
                >
                  {participant.noteFinale}/20
                </span>
              </TooltipTrigger>
              <TooltipContent>Note finale</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="shrink-0">
        {participant.dejaGeneree ? (
          <Badge
            variant="outline"
            className="gap-1 border-sky-200 text-sky-700 dark:border-sky-500/30 dark:text-sky-300"
          >
            <Info className="h-3 w-3" aria-hidden />
            Déjà générée
          </Badge>
        ) : participant.eligible ? (
          <Badge className="gap-1 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <UserCheck className="h-3 w-3" aria-hidden />
            Éligible
          </Badge>
        ) : (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Badge
                    variant="outline"
                    className="gap-1 border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                  >
                    <UserX className="h-3 w-3" aria-hidden />
                    Non éligible
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <ul className="space-y-1 text-xs">
                  {participant.raisons.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ÉTAPE 4 — CONFIRMATION
   ═══════════════════════════════════════════════════════════════════════════ */

interface ConfirmStepProps {
  preview: any;
  criteria: EligibilityCriteria;
}

function ConfirmStep({ preview, criteria }: ConfirmStepProps) {
  if (!preview) return null;

  const { stats, participants, session } = preview;
  const toGenerate = participants.filter(
    (p: EligibleParticipant) => p.eligible && !p.dejaGeneree,
  );

  return (
    <div className="space-y-5">
      <div className="rounded-lg border-2 border-slate-900 bg-slate-50 p-5 text-center dark:border-slate-50 dark:bg-slate-900">
        <Award className="mx-auto mb-3 h-10 w-10 text-slate-900 dark:text-slate-50" aria-hidden />
        <p className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">
          {toGenerate.length} attestation
          {toGenerate.length > 1 ? 's' : ''} à générer
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Pour la session{' '}
          <strong>{session?.formation?.titre ?? session?.codeSession}</strong>
        </p>
      </div>

      <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Récapitulatif
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Éligibles</p>
            <p className="mt-0.5 font-semibold text-emerald-700 dark:text-emerald-300">
              {stats.eligibles}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Déjà générées</p>
            <p className="mt-0.5 font-semibold text-sky-700 dark:text-sky-300">
              {stats.dejaGenerees}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Non éligibles</p>
            <p className="mt-0.5 font-semibold text-red-700 dark:text-red-300">
              {stats.ineligibles}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">À générer</p>
            <p className="mt-0.5 font-semibold text-slate-900 dark:text-slate-50">
              {toGenerate.length}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Critères appliqués
        </p>
        <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
            Présence ≥ <strong>{criteria.presenceMin}%</strong>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
            Note ≥ <strong>{criteria.noteMin}/20</strong>
          </li>
          {criteria.inscriptionValidee && (
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
              Inscription <strong>validée</strong>
            </li>
          )}
          {criteria.selectionValidee && (
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
              Sélection <strong>validée</strong>
            </li>
          )}
        </ul>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
        <p className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Les attestations seront générées avec un <strong>numéro unique</strong>{' '}
            et un <strong>QR code de vérification</strong>. Cette action ne peut
            pas être annulée automatiquement.
          </span>
        </p>
      </div>
    </div>
  );
}