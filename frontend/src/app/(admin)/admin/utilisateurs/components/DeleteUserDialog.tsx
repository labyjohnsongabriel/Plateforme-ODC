// src/app/(admin)/admin/utilisateurs/components/DeleteUserDialog.tsx
'use client';

import * as React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteUser, useBulkDeleteUsers, type User } from '@/hooks/useUsers';

interface DeleteUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
}: DeleteUserDialogProps) {
  const deleteMutation = useDeleteUser();

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await deleteMutation.mutateAsync(user.id);
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
            Supprimer cet utilisateur ?
          </DialogTitle>

          <DialogDescription className="space-y-3 pt-2 text-sm">
            <p>
              Cette action est réversible (<strong>soft delete</strong>).
              L&apos;utilisateur{' '}
              <strong>
                {user?.prenom} {user?.nom}
              </strong>{' '}
              ne pourra plus se connecter.
            </p>
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

/* ============================================================================
   DIALOGUE DE SUPPRESSION EN MASSE
   ============================================================================ */

interface BulkDeleteDialogProps {
  count: number;
  ids: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BulkDeleteUsersDialog({
  count,
  ids,
  open,
  onOpenChange,
  onSuccess,
}: BulkDeleteDialogProps) {
  const bulkDelete = useBulkDeleteUsers();

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await bulkDelete.mutateAsync(ids);
      onOpenChange(false);
      onSuccess?.();
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
            Supprimer {count} utilisateur{count > 1 ? 's' : ''} ?
          </DialogTitle>

          <DialogDescription className="pt-2 text-sm">
            Cette action est réversible (soft delete). Les utilisateurs ne
            pourront plus se connecter.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={bulkDelete.isPending}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            loading={bulkDelete.isPending}
            loadingText="Suppression…"
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Supprimer {count}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}