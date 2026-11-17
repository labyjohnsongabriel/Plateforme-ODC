'use client';

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: () => void;
  unanswered: number;
  total: number;
  submitting: boolean;
}

export function SubmitConfirmDialog({
  open, onOpenChange, onConfirm, unanswered, total, submitting,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Soumettre l'évaluation ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {unanswered > 0 ? (
              <>
                <strong className="text-amber-700 dark:text-amber-400">
                  {unanswered} question{unanswered > 1 ? 's' : ''} sur {total} sans réponse.
                </strong>{' '}
                Une fois soumise, votre évaluation ne peut plus être modifiée.
              </>
            ) : (
              <>Vous avez répondu à toutes les questions. Une fois soumise, l'évaluation ne peut plus être modifiée.</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={submitting}
            className="bg-odc-primary text-white hover:bg-odc-primary/90"
          >
            Soumettre définitivement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}