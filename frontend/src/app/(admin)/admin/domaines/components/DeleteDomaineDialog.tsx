'use client';

import * as React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteDomaine, type Domaine } from '@/hooks/useDomaines';

/* ============================================================================
   TYPES
   ============================================================================ */

interface DeleteDomaineDialogProps {
  domaine: Domaine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function DeleteDomaineDialog({
  domaine,
  open,
  onOpenChange,
}: DeleteDomaineDialogProps) {
  const deleteMutation = useDeleteDomaine();

  const hasFormations = (domaine?.formationsCount ?? 0) > 0;

  const handleConfirm = async () => {
    if (!domaine) return;
    await deleteMutation.mutateAsync(domaine.id);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-odc-error-soft">
            <AlertTriangle className="h-6 w-6 text-odc-error" />
          </div>

          <AlertDialogTitle className="font-display text-lg">
            Supprimer « {domaine?.nom} » ?
          </AlertDialogTitle>

          <AlertDialogDescription className="space-y-3 text-sm">
            <p>
              Cette action est <strong>irréversible</strong>. Le domaine sera
              définitivement supprimé du catalogue ODC.
            </p>

            {hasFormations && (
              <div className="rounded-lg border border-odc-warning bg-odc-warning-bg p-3">
                <p className="flex items-start gap-2 text-xs text-odc-warning-dark">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Ce domaine contient{' '}
                    <strong>{domaine?.formationsCount} formation(s)</strong>.
                    Celles-ci deviendront orphelines. Assurez-vous de les
                    réaffecter avant de continuer.
                  </span>
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={deleteMutation.isPending}
            className="bg-odc-error text-white hover:bg-odc-error-dark"
          >
            {deleteMutation.isPending ? (
              <>Suppression…</>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}