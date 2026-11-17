'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluationId?: string;
  evaluationTitre?: string;
}

export function DeleteEvaluationDialog({
  open, onOpenChange, evaluationId, evaluationTitre,
}: Props) {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!evaluationId) throw new Error('ID manquant');
      await api.delete(`/formateur/evaluations/${evaluationId}`);
    },
    onSuccess: () => {
      toast.success('Évaluation supprimée');
      qc.invalidateQueries({ queryKey: ['formateur', 'evaluations'] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden />
            Supprimer cette évaluation ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {evaluationTitre
              ? `« ${evaluationTitre} » sera définitivement supprimée, ainsi que les notes associées. Cette action est irréversible.`
              : 'Cette action est irréversible.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); mutation.mutate(); }}
            disabled={mutation.isPending || !evaluationId}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />}
            <Trash2 className="h-4 w-4 mr-2" aria-hidden /> Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}