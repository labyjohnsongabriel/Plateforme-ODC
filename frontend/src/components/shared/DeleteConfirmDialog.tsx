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
import { cn } from '@/lib/utils';

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
      <DialogContent className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden />
            </div>
            <DialogTitle className="text-slate-900 dark:text-slate-50">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            {description ?? defaultDescription}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={onConfirm}
            disabled={loading}
            leftIcon={
              loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="h-4 w-4" aria-hidden />
              )
            }
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}