// src/app/(admin)/admin/roles/components/DeleteRoleDialog.tsx
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
import { useDeleteRole, type Role } from '@/hooks/useRoles';

interface DeleteRoleDialogProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteRoleDialog({
  role,
  open,
  onOpenChange,
}: DeleteRoleDialogProps) {
  const deleteMutation = useDeleteRole();

  const hasUsers = (role?.usersCount ?? 0) > 0;
  const isSystem = role?.estSysteme ?? false;

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!role) return;
    try {
      await deleteMutation.mutateAsync(role.id);
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
            Supprimer le rôle « {role?.libelle} » ?
          </DialogTitle>

          <DialogDescription className="space-y-3 pt-2 text-sm">
            {isSystem ? (
              <div className="rounded-lg border border-odc-error bg-odc-error-bg p-3">
                <p className="text-xs text-odc-error-dark">
                  <strong>Ce rôle est système</strong> et ne peut pas être
                  supprimé. Désactivez-le ou réassignez les utilisateurs.
                </p>
              </div>
            ) : (
              <>
                <p>
                  Cette action est <strong>irréversible</strong>. Le rôle et
                  toutes ses permissions seront définitivement supprimés.
                </p>

                {hasUsers && (
                  <div className="rounded-lg border border-odc-warning bg-odc-warning-bg p-3">
                    <p className="flex items-start gap-2 text-xs text-odc-warning-dark">
                      <Users className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        <strong>{role?.usersCount} utilisateur(s)</strong> ont
                        actuellement ce rôle. Réassignez-les avant de
                        continuer.
                      </span>
                    </p>
                  </div>
                )}
              </>
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
            disabled={isSystem || hasUsers || deleteMutation.isPending}
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