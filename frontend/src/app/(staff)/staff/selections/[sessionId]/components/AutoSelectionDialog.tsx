// src/app/(staff)/staff/selections/[sessionId]/components/AutoSelectionDialog.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Zap, AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

interface AutoSelectionResult {
  acceptes: number;
  refuses: number;
  placesDisponibles: number;
}

export function AutoSelectionDialog({ sessionId }: { sessionId: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (): Promise<AutoSelectionResult> => {
      const { data } = await api.post(`/staff/selections/auto/${sessionId}`);
      return data.data;
    },
    onSuccess: (result) => {
      toast.success(
        `✅ ${result.acceptes} accepté(s), ${result.refuses} refusé(s)`,
      );
      setOpen(false);
      qc.invalidateQueries({ queryKey: ['staff', 'selection', sessionId] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Zap className="mr-2 h-4 w-4" aria-hidden="true" />
          Sélection auto
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" aria-hidden="true" />
            Sélection automatique
          </DialogTitle>
          <DialogDescription>
            Les candidats en attente seront acceptés dans l&apos;ordre
            d&apos;inscription, jusqu&apos;à atteindre la capacité de la
            session. Les autres seront refusés (capacité atteinte).
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:ring-amber-500/30">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300"
            aria-hidden="true"
          />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Cette action est irréversible. Utilisez le bouton &quot;Reset&quot;
            pour recommencer.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Zap className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Lancer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}