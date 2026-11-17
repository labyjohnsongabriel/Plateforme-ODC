// src/app/(admin)/admin/attestations/components/AttestationDetailModal.tsx
'use client';

import * as React from 'react';
import {
  Award,
  ExternalLink,
  CheckCircle2,
  XCircle,
  UserX,
  UserCheck,
  Hash,
  Calendar,
  Clock,
  QrCode,
  FileDown,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import {
  useAttestation,
  useDownloadAttestation,
  useInvalidateAttestation,
  useReactivateAttestation,
} from '@/hooks/useAttestations';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface AttestationDetailModalProps {
  attestationId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function AttestationDetailModal({
  attestationId,
  open,
  onOpenChange,
}: AttestationDetailModalProps) {
  const { data: attestation, isLoading } = useAttestation(
    open ? attestationId : undefined,
  );
  const downloadMutation = useDownloadAttestation();
  const invalidateMutation = useInvalidateAttestation();
  const reactivateMutation = useReactivateAttestation();

  const handleInvalidate = () => {
    const motif = window.prompt("Motif d'invalidation :");
    if (motif && motif.trim() && attestation) {
      invalidateMutation.mutate({ id: attestation.id, motif: motif.trim() });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-2xl flex-col gap-0 overflow-hidden border-odc-border bg-white p-0 dark:bg-slate-950">
        {/* ═══════════════ EN-TÊTE ═══════════════ */}
        <DialogHeader className="shrink-0 border-b border-odc-border bg-odc-surface px-6 py-5">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-odc-md',
                attestation?.valide
                  ? 'bg-gradient-to-br from-odc-500 to-odc-700'
                  : 'bg-gradient-to-br from-odc-error to-odc-error-dark',
              )}
              aria-hidden="true"
            >
              <Award className="h-6 w-6 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <DialogTitle className="font-display text-lg font-bold">
                Attestation {attestation?.numero ?? '…'}
              </DialogTitle>
              <DialogDescription className="mt-0.5 truncate text-sm">
                {attestation?.participant
                  ? `${attestation.participant.prenom} ${attestation.participant.nom}`
                  : 'Chargement…'}
                {attestation?.session?.formation?.titre && (
                  <> · {attestation.session.formation.titre}</>
                )}
              </DialogDescription>
            </div>

            {attestation && (
              <Badge
                className={cn(
                  'shrink-0 gap-1',
                  attestation.valide
                    ? 'bg-odc-success-soft text-odc-success-dark'
                    : 'border border-odc-error/30 bg-odc-error-bg text-odc-error-dark',
                )}
              >
                {attestation.valide ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    Valide
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" aria-hidden />
                    Invalidée
                  </>
                )}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* ═══════════════ CONTENU ═══════════════ */}
        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <DetailSkeleton />
          ) : !attestation ? (
            <div className="rounded-lg border border-dashed border-odc-border p-8 text-center">
              <AlertTriangle
                className="mx-auto mb-2 h-8 w-8 text-amber-500"
                aria-hidden
              />
              <p className="text-sm font-medium text-odc-text-primary">
                Attestation introuvable
              </p>
              <p className="mt-1 text-xs text-odc-text-muted">
                Elle a peut-être été supprimée ou l’identifiant est invalide.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Motif d'invalidation */}
              {!attestation.valide && attestation.motifInvalidation && (
                <div className="flex items-start gap-2 rounded-lg border border-odc-error bg-odc-error-bg p-3">
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0 text-odc-error-dark"
                    aria-hidden
                  />
                  <div className="text-xs text-odc-error-dark">
                    <p className="font-semibold">Motif d’invalidation</p>
                    <p className="mt-0.5">{attestation.motifInvalidation}</p>
                  </div>
                </div>
              )}

              {/* Informations */}
              <section>
                <SectionTitle>Informations</SectionTitle>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    icon={Hash}
                    label="Numéro"
                    value={attestation.numero}
                    mono
                    copyable
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Date d'émission"
                    value={formatDate(attestation.dateEmission)}
                  />
                  {typeof attestation.tauxPresence === 'number' && (
                    <InfoItem
                      icon={Clock}
                      label="Taux de présence"
                      value={`${attestation.tauxPresence}%`}
                      tone={
                        attestation.tauxPresence >= 75 ? 'success' : 'warning'
                      }
                    />
                  )}
                  {typeof attestation.noteFinale === 'number' && (
                    <InfoItem
                      icon={Award}
                      label="Note finale"
                      value={`${attestation.noteFinale}/20`}
                      tone={
                        attestation.noteFinale >= 10 ? 'success' : 'danger'
                      }
                    />
                  )}
                </div>
              </section>

              <Separator />

              {/* Session / Formation */}
              <section>
                <SectionTitle>Session</SectionTitle>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    icon={Award}
                    label="Formation"
                    value={attestation.session?.formation?.titre ?? '—'}
                  />
                  <InfoItem
                    icon={Hash}
                    label="Code session"
                    value={attestation.session?.codeSession ?? '—'}
                    mono
                  />
                  {attestation.session?.dateDebut && (
                    <InfoItem
                      icon={Calendar}
                      label="Début"
                      value={formatDate(attestation.session.dateDebut)}
                    />
                  )}
                  {attestation.session?.dateFin && (
                    <InfoItem
                      icon={Calendar}
                      label="Fin"
                      value={formatDate(attestation.session.dateFin)}
                    />
                  )}
                </div>
              </section>

              {/* Vérification */}
              {attestation.hashVerification && (
                <>
                  <Separator />
                  <section>
                    <SectionTitle>
                      <QrCode className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
                      Vérification
                    </SectionTitle>
                    <div className="mt-2 rounded-lg border border-odc-border bg-odc-surface p-3">
                      <code className="block break-all font-mono text-[11px] leading-relaxed text-odc-text-primary">
                        {attestation.hashVerification}
                      </code>
                    </div>
                  </section>
                </>
              )}
            </div>
          )}
        </div>

        {/* ═══════════════ ACTIONS ═══════════════ */}
        {attestation && (
          <DialogFooter className="shrink-0 border-t border-odc-border bg-odc-surface px-6 py-4">
            <div className="flex w-full flex-wrap justify-end gap-2">
              {attestation.valide ? (
                <Button
                  variant="outline"
                  onClick={handleInvalidate}
                  disabled={invalidateMutation.isPending}
                  className="text-odc-error hover:bg-odc-error-soft hover:text-odc-error"
                >
                  <UserX className="mr-2 h-4 w-4" aria-hidden />
                  {invalidateMutation.isPending ? 'Invalidation…' : 'Invalider'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => reactivateMutation.mutate(attestation.id)}
                  disabled={reactivateMutation.isPending}
                  className="text-odc-success hover:bg-odc-success-soft hover:text-odc-success"
                >
                  <UserCheck className="mr-2 h-4 w-4" aria-hidden />
                  {reactivateMutation.isPending ? 'Réactivation…' : 'Réactiver'}
                </Button>
              )}

              <Button variant="outline" asChild>
                <a
                  href={`/verifier-attestation/${attestation.numero}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
                  Vérifier
                </a>
              </Button>

              <Button
                variant="odc"
                onClick={() =>
                  downloadMutation.mutate({
                    id: attestation.id,
                    numero: attestation.numero,
                  })
                }
                disabled={downloadMutation.isPending}
              >
                <FileDown className="mr-2 h-4 w-4" aria-hidden />
                {downloadMutation.isPending
                  ? 'Téléchargement…'
                  : 'Télécharger PDF'}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SOUS-COMPOSANTS
   ═══════════════════════════════════════════════════════════════════════════ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
      {children}
    </p>
  );
}

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

function InfoItem({
  icon: Icon,
  label,
  value,
  mono,
  copyable,
  tone = 'default',
}: InfoItemProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  const toneClass = {
    default: 'text-odc-text-primary',
    success: 'text-odc-success-dark',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-odc-error-dark',
  }[tone];

  return (
    <div className="rounded-lg border border-odc-border bg-white p-3 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-odc-text-muted" aria-hidden />
          <p className="text-xs font-medium text-odc-text-muted">{label}</p>
        </div>

        {copyable && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded p-1 text-odc-text-muted hover:bg-odc-surface-hover hover:text-odc-text-primary"
                  aria-label={copied ? 'Copié' : 'Copier'}
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-odc-success" aria-hidden />
                  ) : (
                    <Copy className="h-3 w-3" aria-hidden />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{copied ? 'Copié !' : 'Copier'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <p
        className={cn(
          'mt-1 font-semibold',
          mono ? 'font-mono text-xs' : 'text-sm',
          toneClass,
        )}
      >
        {value}
      </p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-px w-full" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}