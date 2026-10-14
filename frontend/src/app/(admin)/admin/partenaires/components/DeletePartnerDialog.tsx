// src/app/(admin)/admin/partenaires/components/DeletePartnerDialog.tsx
'use client';

import * as React from 'react';
import { AlertTriangle, Trash2, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  useDeletePartenaire,
  type Partenaire,
} from '@/hooks/usePartenaires';

interface DeletePartnerDialogProps {
  partenaire: Partenaire | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePartnerDialog({
  partenaire,
  open,
  onOpenChange,
}: DeletePartnerDialogProps) {
  const deleteMutation = useDeletePartenaire();

  const hasFormations = (partenaire?.formationsCount ?? 0) > 0;

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!partenaire) return;
    try {
      await deleteMutation.mutateAsync(partenaire.id);
      onOpenChange(false);
    } catch {
      /* Erreur déjà gérée */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-odc-error-soft">
            <AlertTriangle className="h-6 w-6 text-odc-error" />
          </div>

          <DialogTitle className="font-display text-lg">
            Supprimer « {partenaire?.nom} » ?
          </DialogTitle>

          <DialogDescription className="space-y-3 pt-2 text-sm">
            <p>
              Cette action est <strong>irréversible</strong>. Le partenaire
              sera définitivement supprimé.
            </p>

            {hasFormations && (
              <div className="rounded-lg border border-odc-warning bg-odc-warning-bg p-3">
                <p className="flex items-start gap-2 text-xs text-odc-warning-dark">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Ce partenaire est associé à{' '}
                    <strong>{partenaire?.formationsCount} formation(s)</strong>.
                    Ces formations seront conservées mais perdront leur lien.
                  </span>
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            loading={deleteMutation.isPending}
            loadingText="Suppression…"
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}