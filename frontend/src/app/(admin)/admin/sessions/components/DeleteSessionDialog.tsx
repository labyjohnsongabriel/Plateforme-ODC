// src/app/(admin)/admin/sessions/components/DeleteSessionDialog.tsx
'use client';

import * as React from 'react';
import { AlertTriangle, Trash2, Users } from 'lucide-react';
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
  useDeleteSession,
  type Session,
} from '@/hooks/useSessions';

interface DeleteSessionDialogProps {
  session: Session | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteSessionDialog({
  session,
  open,
  onOpenChange,
}: DeleteSessionDialogProps) {
  const deleteMutation = useDeleteSession();
  const hasInscriptions = (session?.inscriptionsCount ?? 0) > 0;

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) return;
    try {
      await deleteMutation.mutateAsync(session.id);
      onOpenChange(false);
    } catch {
      /* Erreur gérée */
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
            Supprimer la session ?
          </DialogTitle>

          <DialogDescription className="space-y-3 pt-2 text-sm">
            <p>
              Cette action est <strong>irréversible</strong>. La session{' '}
              <strong>{session?.codeSession}</strong> sera définitivement
              supprimée.
            </p>

            {hasInscriptions && (
              <div className="rounded-lg border border-odc-warning bg-odc-warning-bg p-3">
                <p className="flex items-start gap-2 text-xs text-odc-warning-dark">
                  <Users className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Cette session contient{' '}
                    <strong>{session?.inscriptionsCount} inscription(s)</strong>.
                    Celles-ci seront également supprimées.
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