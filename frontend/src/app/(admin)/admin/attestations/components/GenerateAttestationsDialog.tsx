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
  Download,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import { getInitials } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  useSessionPreview,
  useGenerateAttestations,
  type EligibilityCriteria,
  type EligibleParticipant,
} from '@/hooks/useAttestations';

/* ============================================================================
   TYPES
   ============================================================================ */

interface GenerateAttestationsDialogProps {
  trigger?: React.ReactNode;
  defaultSessionId?: string;
  onSuccess?: (result: any) => void;
}

type Step = 'session' | 'criteria' | 'preview' | 'confirm';

/* ============================================================================
   COMPOSANT PRINCIPAL
   ============================================================================ */

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

  /* -------------------- Reset à l'ouverture -------------------- */
  React.useEffect(() => {
    if (open) {
      setStep(defaultSessionId ? 'criteria' : 'session');
      setSessionId(defaultSessionId ?? '');
    }
  }, [open, defaultSessionId]);

  /* -------------------- Sessions terminées -------------------- */
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

  /* -------------------- Aperçu des participants -------------------- */
  const {
    data: preview,
    isLoading: loadingPreview,
    error: previewError,
  } = useSessionPreview(
    sessionId,
    criteria,
    open && (step === 'preview' || step === 'confirm'),
  );

  /* -------------------- Mutation -------------------- */
  const generateMutation = useGenerateAttestations();

  /* -------------------- Handlers -------------------- */
  const handleNext = () => {
    if (step === 'session' && sessionId) {
      setStep('criteria');
    } else if (step === 'criteria') {
      setStep('preview');
    } else if (step === 'preview') {
      setStep('confirm');
    }
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

  /* -------------------- Rendu -------------------- */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="odc">
            <Award className="mr-2 h-4 w-4" />
            Générer des attestations
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="flex max-h-[92vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        {/* ================================================================
            EN-TÊTE
            ================================================================ */}
        <DialogHeader className="shrink-0 border-b border-odc-border bg-odc-surface px-6 py-5">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-odc-500 to-odc-700 shadow-odc-md"
              aria-hidden="true"
            >
              <Sparkles className="h-6 w-6 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <DialogTitle className="font-display text-xl font-bold">
                Générer les attestations
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm">
                Étape {step === 'session' ? 1 : step === 'criteria' ? 2 : step === 'preview' ? 3 : 4} sur 4
                {' — '}
                {step === 'session' && 'Sélection de la session'}
                {step === 'criteria' && 'Critères d\'éligibilité'}
                {step === 'preview' && 'Aperçu des participants'}
                {step === 'confirm' && 'Confirmation'}
              </DialogDescription>
            </div>
          </div>

          {/* Indicateur d'étapes */}
          <StepIndicator currentStep={step} />
        </DialogHeader>

        {/* ================================================================
            CONTENU SCROLLABLE
            ================================================================ */}
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
            <CriteriaStep
              criteria={criteria}
              onCriteriaChange={setCriteria}
            />
          )}

          {step === 'preview' && (
            <PreviewStep
              preview={preview}
              isLoading={loadingPreview}
              error={previewError}
            />
          )}

          {step === 'confirm' && (
            <ConfirmStep
              preview={preview}
              criteria={criteria}
            />
          )}
        </div>

        {/* ================================================================
            ACTIONS
            ================================================================ */}
        <DialogFooter className="shrink-0 border-t border-odc-border bg-odc-surface px-6 py-4">
          <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <div>
              {step !== 'session' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={generateMutation.isPending}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
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
              >
                Annuler
              </Button>

              {step !== 'confirm' ? (
                <Button
                  type="button"
                  variant="odc"
                  onClick={handleNext}
                  disabled={
                    (step === 'session' && !sessionId) ||
                    (step === 'preview' && !preview?.stats.eligibles)
                  }
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="odc"
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  loading={generateMutation.isPending}
                  loadingText="Génération…"
                  leftIcon={<Award className="h-4 w-4" />}
                >
                  Générer {preview?.stats.eligibles ?? 0} attestation
                  {(preview?.stats.eligibles ?? 0) > 1 ? 's' : ''}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================================
   INDICATEUR D'ÉTAPES
   ============================================================================ */

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
                i < currentIndex && 'bg-odc-success text-white',
                i === currentIndex && 'bg-odc-primary text-white',
                i > currentIndex && 'bg-odc-surface-alt text-odc-text-muted',
              )}
            >
              {i < currentIndex ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={cn(
                'text-xs font-medium',
                i <= currentIndex
                  ? 'text-odc-text-primary'
                  : 'text-odc-text-muted',
              )}
            >
              {s.label}
            </span>
          </div>

          {i < steps.length - 1 && (
            <div
              className={cn(
                'h-px flex-1 transition-colors',
                i < currentIndex ? 'bg-odc-success' : 'bg-odc-border',
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ============================================================================
   ÉTAPE 1 — SESSION
   ============================================================================ */

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
      <div className="rounded-lg border border-dashed border-odc-border p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-odc-warning" />
        <p className="text-sm font-semibold text-odc-text-primary">
          Aucune session terminée
        </p>
        <p className="mt-1 text-xs text-odc-text-muted">
          Terminez au moins une session avant de générer des attestations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="session">
          Session terminée <span className="text-odc-error">*</span>
        </Label>
        <Select value={sessionId} onValueChange={onSessionChange}>
          <SelectTrigger id="session" className="mt-1.5">
            <SelectValue placeholder="Sélectionnez une session" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((s: any) => (
              <SelectItem key={s.id} value={s.id}>
                <div className="flex flex-col py-0.5">
                  <span className="font-medium">
                    {s.formation?.titre ?? 'Session'}
                  </span>
                  <span className="text-xs text-odc-text-muted">
                    {s.codeSession} · {formatDate(s.dateDebut)} →{' '}
                    {formatDate(s.dateFin)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg bg-odc-info-soft p-3">
        <p className="flex items-start gap-2 text-xs text-odc-info-dark">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
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

/* ============================================================================
   ÉTAPE 2 — CRITÈRES
   ============================================================================ */

interface CriteriaStepProps {
  criteria: EligibilityCriteria;
  onCriteriaChange: (criteria: EligibilityCriteria) => void;
}

function CriteriaStep({ criteria, onCriteriaChange }: CriteriaStepProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-odc-border p-4">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-odc-text-primary">
          <Settings2 className="h-4 w-4 text-odc-primary" />
          Critères d&apos;éligibilité
        </p>

        <div className="space-y-4">
          {/* Présence minimale */}
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="presenceMin">Taux de présence minimum</Label>
              <span className="font-mono text-sm font-bold text-odc-primary">
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
            <p className="mt-1 text-xs text-odc-text-muted">
              Recommandé : 75% minimum
            </p>
          </div>

          {/* Note minimale */}
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="noteMin">Note finale minimum</Label>
              <span className="font-mono text-sm font-bold text-odc-primary">
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
            <p className="mt-1 text-xs text-odc-text-muted">
              Recommandé : 10/20 minimum
            </p>
          </div>
        </div>
      </div>

      {/* Options supplémentaires */}
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-odc-border p-4">
          <div>
            <Label className="cursor-pointer text-sm font-medium">
              Inscription validée
            </Label>
            <p className="mt-0.5 text-xs text-odc-text-muted">
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

        <div className="flex items-center justify-between rounded-lg border border-odc-border p-4">
          <div>
            <Label className="cursor-pointer text-sm font-medium">
              Sélection validée
            </Label>
            <p className="mt-0.5 text-xs text-odc-text-muted">
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

      {/* Aperçu des critères */}
      <div className="rounded-lg bg-odc-surface-alt/60 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
          Résumé des critères
        </p>
        <ul className="space-y-1 text-xs text-odc-text-secondary">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-odc-success" />
            Présence ≥ <strong>{criteria.presenceMin}%</strong>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-odc-success" />
            Note ≥ <strong>{criteria.noteMin}/20</strong>
          </li>
          {criteria.inscriptionValidee && (
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-odc-success" />
              Inscription <strong>validée</strong>
            </li>
          )}
          {criteria.selectionValidee && (
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-odc-success" />
              Sélection <strong>validée</strong>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

/* ============================================================================
   ÉTAPE 3 — APERÇU
   ============================================================================ */

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
      <div className="rounded-lg border border-odc-error bg-odc-error-bg p-4">
        <p className="flex items-center gap-2 text-sm text-odc-error-dark">
          <XCircle className="h-4 w-4" />
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
      {/* Résumé */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-odc-border bg-odc-surface p-3 text-center">
          <p className="text-xs text-odc-text-muted">Total</p>
          <p className="mt-1 font-display text-2xl font-bold text-odc-text-primary">
            {stats.total}
          </p>
        </div>
        <div className="rounded-lg border border-odc-success/30 bg-odc-success-soft p-3 text-center">
          <p className="text-xs text-odc-success-dark">Éligibles</p>
          <p className="mt-1 font-display text-2xl font-bold text-odc-success-dark">
            {stats.eligibles}
          </p>
        </div>
        <div className="rounded-lg border border-odc-error/30 bg-odc-error-soft p-3 text-center">
          <p className="text-xs text-odc-error-dark">Non éligibles</p>
          <p className="mt-1 font-display text-2xl font-bold text-odc-error-dark">
            {stats.ineligibles}
          </p>
        </div>
      </div>

      {/* Liste des participants */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
          Participants ({participants.length})
        </p>

        <div className="max-h-72 space-y-2 overflow-y-auto scrollbar-thin rounded-lg border border-odc-border p-2">
          {participants.map((p: EligibleParticipant) => (
            <ParticipantRow key={p.participantId} participant={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   LIGNE PARTICIPANT
   ============================================================================ */

function ParticipantRow({
  participant,
}: {
  participant: EligibleParticipant;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-2.5 transition-colors',
        participant.eligible
          ? 'border-odc-success/30 bg-odc-success-soft/30'
          : 'border-odc-border bg-odc-surface',
      )}
    >
      {/* Avatar */}
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={participant.participant.photoUrl} />
        <AvatarFallback className="bg-odc-primary-soft text-xs font-medium text-odc-primary">
          {getInitials(
            participant.participant.nom,
            participant.participant.prenom,
          )}
        </AvatarFallback>
      </Avatar>

      {/* Infos */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-odc-text-primary">
          {participant.participant.prenom} {participant.participant.nom}
        </p>
        <p className="truncate text-xs text-odc-text-muted">
          {participant.participant.email}
        </p>
      </div>

      {/* Métriques */}
      <div className="hidden items-center gap-3 sm:flex">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  participant.tauxPresence >= 75
                    ? 'bg-odc-success-soft text-odc-success-dark'
                    : 'bg-odc-warning-soft text-odc-warning-dark',
                )}
              >
                <Clock className="h-3 w-3" />
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
                      ? 'bg-odc-success-soft text-odc-success-dark'
                      : 'bg-odc-error-soft text-odc-error-dark',
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

      {/* Statut */}
      <div className="shrink-0">
        {participant.dejaGeneree ? (
          <Badge
            variant="outline"
            className="gap-1 border-odc-info/30 text-odc-info-dark"
          >
            <Info className="h-3 w-3" />
            Déjà générée
          </Badge>
        ) : participant.eligible ? (
          <Badge className="gap-1 bg-odc-success-soft text-odc-success-dark hover:bg-odc-success-soft">
            <UserCheck className="h-3 w-3" />
            Éligible
          </Badge>
        ) : (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Badge
                    variant="outline"
                    className="gap-1 text-odc-text-muted"
                  >
                    <UserX className="h-3 w-3" />
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

/* ============================================================================
   ÉTAPE 4 — CONFIRMATION
   ============================================================================ */

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
      {/* Confirmation visuelle */}
      <div className="rounded-lg border-2 border-odc-primary bg-odc-primary-softer p-5 text-center">
        <Award className="mx-auto mb-3 h-10 w-10 text-odc-primary" />
        <p className="font-display text-lg font-bold text-odc-text-primary">
          {toGenerate.length} attestation
          {toGenerate.length > 1 ? 's' : ''} à générer
        </p>
        <p className="mt-1 text-sm text-odc-text-secondary">
          Pour la session{' '}
          <strong>{session?.formation?.titre ?? session?.codeSession}</strong>
        </p>
      </div>

      {/* Récapitulatif */}
      <div className="space-y-2 rounded-lg border border-odc-border bg-odc-surface-alt/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
          Récapitulatif
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-odc-text-muted">Éligibles</p>
            <p className="mt-0.5 font-semibold text-odc-success-dark">
              {stats.eligibles}
            </p>
          </div>
          <div>
            <p className="text-xs text-odc-text-muted">Déjà générées</p>
            <p className="mt-0.5 font-semibold text-odc-info-dark">
              {stats.dejaGenerees}
            </p>
          </div>
          <div>
            <p className="text-xs text-odc-text-muted">Non éligibles</p>
            <p className="mt-0.5 font-semibold text-odc-error-dark">
              {stats.ineligibles}
            </p>
          </div>
          <div>
            <p className="text-xs text-odc-text-muted">À générer</p>
            <p className="mt-0.5 font-semibold text-odc-primary">
              {toGenerate.length}
            </p>
          </div>
        </div>
      </div>

      {/* Critères appliqués */}
      <div className="rounded-lg border border-odc-border p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
          Critères appliqués
        </p>
        <ul className="space-y-1 text-xs text-odc-text-secondary">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-odc-success" />
            Présence ≥ <strong>{criteria.presenceMin}%</strong>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-odc-success" />
            Note ≥ <strong>{criteria.noteMin}/20</strong>
          </li>
          {criteria.inscriptionValidee && (
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-odc-success" />
              Inscription <strong>validée</strong>
            </li>
          )}
          {criteria.selectionValidee && (
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-odc-success" />
              Sélection <strong>validée</strong>
            </li>
          )}
        </ul>
      </div>

      {/* Avertissement */}
      <div className="rounded-lg border border-odc-warning bg-odc-warning-bg p-3">
        <p className="flex items-start gap-2 text-xs text-odc-warning-dark">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
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