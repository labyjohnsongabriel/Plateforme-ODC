// src/app/(admin)/admin/attestations/components/AttestationDetailModal.tsx
'use client';

import * as React from 'react';
import {
  Award,
  Download,
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
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/lib/formatters';
import {
  useAttestation,
  useDownloadAttestation,
  useInvalidateAttestation,
  useReactivateAttestation,
} from '@/hooks/useAttestations';

interface AttestationDetailModalProps {
  attestationId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
    const motif = window.prompt('Motif d\'invalidation :');
    if (motif && attestation) {
      invalidateMutation.mutate({ id: attestation.id, motif });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        {/* En-tête */}
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
                Attestation {attestation?.numero}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm">
                {attestation?.participant?.prenom}{' '}
                {attestation?.participant?.nom} ·{' '}
                {attestation?.session?.formation?.titre}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Contenu */}
        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <DetailSkeleton />
          ) : !attestation ? (
            <p className="italic text-odc-text-muted">Introuvable.</p>
          ) : (
            <div className="space-y-6">
              {/* Statut */}
              <div className="flex items-center gap-2">
                {attestation.valide ? (
                  <Badge className="gap-1 bg-odc-success-soft text-odc-success-dark">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Valide
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="gap-1 border-odc-error/30 text-odc-error-dark"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Invalidée
                  </Badge>
                )}
              </div>

              {/* Motif d'invalidation */}
              {!attestation.valide && attestation.motifInvalidation && (
                <div className="rounded-lg border border-odc-error bg-odc-error-bg p-3">
                  <p className="text-xs text-odc-error-dark">
                    <strong>Motif :</strong> {attestation.motifInvalidation}
                  </p>
                </div>
              )}

              {/* Informations */}
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={Hash}
                  label="Numéro"
                  value={attestation.numero}
                  mono
                />
                <InfoItem
                  icon={Calendar}
                  label="Date d'émission"
                  value={formatDate(attestation.dateEmission)}
                />
                {attestation.tauxPresence !== undefined && (
                  <InfoItem
                    icon={Clock}
                    label="Taux de présence"
                    value={`${attestation.tauxPresence}%`}
                  />
                )}
                {attestation.noteFinale !== undefined && (
                  <InfoItem
                    icon={Award}
                    label="Note finale"
                    value={`${attestation.noteFinale}/20`}
                  />
                )}
              </div>

              {/* QR Code / Vérification */}
              {attestation.hashVerification && (
                <div className="rounded-lg border border-odc-border p-4">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
                    <QrCode className="h-3.5 w-3.5" />
                    Vérification
                  </p>
                  <code className="block break-all font-mono text-xs text-odc-text-primary">
                    {attestation.hashVerification}
                  </code>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {attestation && (
          <DialogFooter className="shrink-0 border-t border-odc-border bg-odc-surface px-6 py-4">
            <div className="flex w-full flex-wrap justify-end gap-2">
              {attestation.valide ? (
                <Button
                  variant="outline"
                  onClick={handleInvalidate}
                  disabled={invalidateMutation.isPending}
                  loading={invalidateMutation.isPending}
                  leftIcon={<UserX className="h-4 w-4" />}
                  className="text-odc-error hover:bg-odc-error-soft hover:text-odc-error"
                >
                  Invalider
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => reactivateMutation.mutate(attestation.id)}
                  disabled={reactivateMutation.isPending}
                  loading={reactivateMutation.isPending}
                  leftIcon={<UserCheck className="h-4 w-4" />}
                  className="text-odc-success hover:bg-odc-success-soft hover:text-odc-success"
                >
                  Réactiver
                </Button>
              )}

              <Button
                variant="outline"
                asChild
                leftIcon={<ExternalLink className="h-4 w-4" />}
              >
                <a
                  href={`/verifier-attestation/${attestation.numero}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
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
                loading={downloadMutation.isPending}
                leftIcon={<FileDown className="h-4 w-4" />}
              >
                Télécharger PDF
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================================
   SOUS-COMPOSANTS
   ============================================================================ */

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}

function InfoItem({ icon: Icon, label, value, mono }: InfoItemProps) {
  return (
    <div className="rounded-lg border border-odc-border p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-odc-text-muted" />
        <p className="text-xs font-medium text-odc-text-muted">{label}</p>
      </div>
      <p
        className={cn(
          'mt-1 font-semibold text-odc-text-primary',
          mono ? 'font-mono text-xs' : 'text-sm',
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
      <Skeleton className="h-6 w-24 rounded-full" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}