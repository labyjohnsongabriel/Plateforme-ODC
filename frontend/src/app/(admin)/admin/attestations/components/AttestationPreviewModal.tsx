// src/app/(admin)/admin/attestations/components/AttestationPreviewModal.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Award, Download, QrCode, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

export interface AttestationPreviewData {
  numero: string;
  participantNom: string;
  formationTitre: string;
  dureeHeures: number;
  dateEmission: string | Date | null;
  noteFinale?: number | null;
  hashVerification?: string | null;
  qrCodeUrl?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: AttestationPreviewData | null;
  onDownload?: () => void;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function AttestationPreviewModal({
  open,
  onOpenChange,
  data,
  onDownload,
}: Props) {
  return (
    <Dialog open={open && !!data} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-odc-primary" aria-hidden />
            Aperçu de l&apos;attestation
          </DialogTitle>
          <DialogDescription>
            Aperçu avant impression. Vérifiez les informations avant de
            télécharger.
          </DialogDescription>
        </DialogHeader>

        {data ? (
          <AttestationPreview data={data} />
        ) : (
          <PreviewErrorState />
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          {onDownload && data && (
            <Button variant="odc" onClick={onDownload}>
              <Download className="mr-2 h-4 w-4" aria-hidden />
              Télécharger PDF
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   APERÇU A4
   ═══════════════════════════════════════════════════════════════════════════ */

function AttestationPreview({ data }: { data: AttestationPreviewData }) {
  const dateEmission =
    data.dateEmission instanceof Date
      ? data.dateEmission.toISOString()
      : data.dateEmission;

  return (
    <div className="rounded-lg border border-odc-border bg-white p-8 shadow-lg">
      <div className="text-center">
        {/* ---------- En-tête ---------- */}
        <div className="mb-6 border-b-2 border-odc-primary pb-4">
          <p className="font-display text-2xl font-bold tracking-wide text-odc-primary">
            ODC FORMATIONS
          </p>
          <p className="mt-1 text-xs uppercase tracking-widest text-odc-text-muted">
            Organisme de Développement des Compétences
          </p>
        </div>

        {/* ---------- Titre ---------- */}
        <h2 className="font-display text-3xl font-bold uppercase tracking-wider text-odc-text-primary">
          Attestation de Formation
        </h2>

        <p className="mt-6 text-sm text-odc-text-secondary">
          Nous certifions que
        </p>

        {/* ---------- Nom ---------- */}
        <p className="mt-3 font-display text-2xl font-bold text-odc-text-primary">
          {data.participantNom}
        </p>

        <p className="mt-6 text-sm text-odc-text-secondary">
          a suivi avec succès la formation
        </p>

        {/* ---------- Formation ---------- */}
        <p className="mt-3 font-display text-xl font-semibold text-odc-primary">
          {data.formationTitre}
        </p>

        <p className="mt-2 text-xs text-odc-text-muted">
          Durée : {data.dureeHeures} heures
        </p>

        {typeof data.noteFinale === 'number' && (
          <p className="mt-1 text-xs text-odc-text-muted">
            Note finale : {data.noteFinale}/20
          </p>
        )}

        {/* ---------- Pied ---------- */}
        <div className="mt-10 flex flex-col items-center justify-between gap-6 border-t border-odc-border pt-6 sm:flex-row sm:items-end">
          {/* Infos à gauche */}
          <div className="text-left text-xs text-odc-text-muted">
            <p>
              <strong>N° :</strong> {data.numero}
            </p>
            <p>
              <strong>Émise le :</strong> {formatDate(dateEmission)}
            </p>
            {data.hashVerification && (
              <p className="mt-1 font-mono text-[10px] break-all">
                Vérif : {data.hashVerification.slice(0, 24)}…
              </p>
            )}
          </div>

          {/* QR code + signature */}
          <div className="flex items-center gap-6">
            {data.qrCodeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.qrCodeUrl}
                alt={`QR code de vérification ${data.numero}`}
                className="h-20 w-20 rounded border border-odc-border"
              />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded border border-dashed border-odc-border text-odc-text-muted"
                aria-label="QR code non disponible"
              >
                <QrCode className="h-8 w-8" aria-hidden />
              </div>
            )}

            <div className="text-center text-xs text-odc-text-muted">
              <div className="mb-2 h-16 w-32 rounded border border-dashed border-odc-border" />
              <p>Signature autorisée</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ÉTAT D'ERREUR
   ═══════════════════════════════════════════════════════════════════════════ */

function PreviewErrorState() {
  return (
    <div className="rounded-lg border border-dashed border-odc-border p-8 text-center">
      <AlertCircle
        className="mx-auto mb-2 h-8 w-8 text-amber-500"
        aria-hidden
      />
      <p className="text-sm font-medium text-odc-text-primary">
        Aucun aperçu disponible
      </p>
      <p className="mt-1 text-xs text-odc-text-muted">
        Les données de l&apos;attestation sont introuvables.
      </p>
    </div>
  );
}