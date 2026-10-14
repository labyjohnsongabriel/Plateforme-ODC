'use client';

import * as React from 'react';
import { AlertTriangle, Trash2, Calendar, Users } from 'lucide-react';
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
  useDeleteFormation,
  type Formation,
} from '@/hooks/useFormations';

/* ============================================================================
   TYPES
   ============================================================================ */

interface DeleteFormationDialogProps {
  formation: Formation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function DeleteFormationDialog({
  formation,
  open,
  onOpenChange,
}: DeleteFormationDialogProps) {
  const deleteMutation = useDeleteFormation();

  const hasSessions = (formation?.sessionsCount ?? 0) > 0;
  const hasInscriptions = (formation?.inscriptionsCount ?? 0) > 0;

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formation) return;
    try {
      await deleteMutation.mutateAsync(formation.id);
      onOpenChange(false);
    } catch {
      /* Erreur déjà gérée par React Query (toast) */
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
            Supprimer « {formation?.titre} » ?
          </DialogTitle>

          <DialogDescription className="space-y-3 pt-2 text-sm">
            <p>
              Cette action est <strong>irréversible</strong>. La formation sera
              définitivement supprimée du catalogue ODC.
            </p>

            {/* Alerte : sessions liées */}
            {hasSessions && (
              <div className="rounded-lg border border-odc-warning bg-odc-warning-bg p-3">
                <p className="flex items-start gap-2 text-xs text-odc-warning-dark">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Cette formation contient{' '}
                    <strong>{formation?.sessionsCount} session(s)</strong>.
                    Celles-ci seront également supprimées.
                  </span>
                </p>
              </div>
            )}

            {/* Alerte : inscriptions liées */}
            {hasInscriptions && (
              <div className="rounded-lg border border-odc-warning bg-odc-warning-bg p-3">
                <p className="flex items-start gap-2 text-xs text-odc-warning-dark">
                  <Users className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <strong>{formation?.inscriptionsCount} inscription(s)</strong>{' '}
                    existent pour cette formation. Assurez-vous de les avoir
                    traitées avant de continuer.
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