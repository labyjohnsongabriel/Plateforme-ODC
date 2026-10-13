// src/components/shared/DeleteConfirmDialog.tsx
'use client';

import * as React from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  itemName?: string;
  loading?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Confirmer la suppression',
  description,
  itemName,
  loading,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
}: DeleteConfirmDialogProps) {
  const defaultDescription = itemName
    ? `Êtes-vous sûr de vouloir supprimer « ${itemName} » ? Cette action est irréversible.`
    : 'Êtes-vous sûr de vouloir effectuer cette action ? Cette action est irréversible.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-full bg-odc-error-bg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-odc-error" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>
            {description ?? defaultDescription}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}