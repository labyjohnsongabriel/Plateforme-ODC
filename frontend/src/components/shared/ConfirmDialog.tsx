// src/components/shared/ConfirmDialog.tsx
'use client';

import * as React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
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

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Confirmer la suppression',
  description = 'Cette action est irréversible. Voulez-vous continuer ?',
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = React.useState(false);

  const isPending = loading || internalLoading;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
      onOpenChange(false);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-md',
          'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950',
        )}
      >
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                variant === 'danger'
                  ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
              )}
            >
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </div>

            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {title}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className={cn(
              'h-9 rounded-lg border-slate-200 bg-white font-medium',
              'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
              'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
            )}
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(
              'h-9 rounded-lg font-medium text-white',
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              variant === 'danger'
                ? 'focus-visible:ring-red-500'
                : 'focus-visible:ring-slate-400 dark:focus-visible:ring-slate-600',
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Suppression…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}