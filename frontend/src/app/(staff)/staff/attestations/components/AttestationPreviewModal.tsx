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
import { Award, Download, X } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

interface AttestationPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    numero: string;
    participantNom: string;
    formationTitre: string;
    dureeHeures: number;
    dateEmission: string;
    noteFinale?: number;
    hashVerification?: string;
  } | null;
  onDownload?: () => void;
}

export function AttestationPreviewModal({
  open,
  onOpenChange,
  data,
  onDownload,
}: AttestationPreviewModalProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-odc-primary" />
            Aperçu de l&apos;attestation
          </DialogTitle>
          <DialogDescription>
            Aperçu avant impression. Vérifiez les informations avant de
            télécharger.
          </DialogDescription>
        </DialogHeader>

        {/* Aperçu A4 */}
        <div className="rounded-lg border border-odc-border bg-white p-8 shadow-lg">
          <div className="text-center">
            {/* En-tête */}
            <div className="mb-6 border-b-2 border-odc-primary pb-4">
              <p className="font-display text-2xl font-bold text-odc-primary">
                ODC FORMATIONS
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-odc-text-muted">
                Organisme de Développement des Compétences
              </p>
            </div>

            {/* Titre */}
            <h2 className="font-display text-3xl font-bold uppercase tracking-wider text-odc-text-primary">
              Attestation de Formation
            </h2>

            <p className="mt-6 text-sm text-odc-text-secondary">
              Nous certifions que
            </p>

            {/* Nom */}
            <p className="mt-3 font-display text-2xl font-bold text-odc-text-primary">
              {data.participantNom}
            </p>

            <p className="mt-6 text-sm text-odc-text-secondary">
              a suivi avec succès la formation
            </p>

            {/* Formation */}
            <p className="mt-3 font-display text-xl font-semibold text-odc-primary">
              {data.formationTitre}
            </p>

            <p className="mt-2 text-xs text-odc-text-muted">
              Durée : {data.dureeHeures} heures
            </p>

            {data.noteFinale !== undefined && (
              <p className="mt-1 text-xs text-odc-text-muted">
                Note finale : {data.noteFinale}/20
              </p>
            )}

            {/* Pied */}
            <div className="mt-10 flex items-end justify-between border-t border-odc-border pt-6">
              <div className="text-left text-xs text-odc-text-muted">
                <p>
                  <strong>N° :</strong> {data.numero}
                </p>
                <p>
                  <strong>Émise le :</strong> {formatDate(data.dateEmission)}
                </p>
                {data.hashVerification && (
                  <p className="mt-1 font-mono text-[10px]">
                    Vérif : {data.hashVerification.slice(0, 16)}…
                  </p>
                )}
              </div>

              <div className="text-center text-xs text-odc-text-muted">
                <div className="mb-2 h-16 w-32 rounded border border-dashed border-odc-border" />
                <p>Signature autorisée</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          {onDownload && (
            <Button
              variant="odc"
              onClick={onDownload}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Télécharger PDF
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}