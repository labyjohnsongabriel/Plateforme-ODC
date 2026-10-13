'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Zap, Loader2, AlertTriangle } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

export function AutoSelectionDialog({ sessionId }: { sessionId: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/staff/selections/auto/${sessionId}`);
      return data.data;
    },
    onSuccess: (r: any) => {
      toast.success(
        `${r.acceptes} accepté(s), ${r.refuses} refusé(s)`,
      );
      setOpen(false);
      qc.invalidateQueries({ queryKey: ['staff', 'selection', sessionId] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="odc">
          <Zap className="h-4 w-4 mr-2" /> Sélection auto
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-odc-primary" />
            Sélection automatique
          </DialogTitle>
          <DialogDescription>
            Les candidats en attente seront acceptés dans l&apos;ordre
            d&apos;inscription, jusqu&apos;à atteindre la capacité de la session.
            Les autres seront refusés (capacité atteinte).
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-odc-warning-bg">
          <AlertTriangle className="h-4 w-4 text-odc-warning shrink-0 mt-0.5" />
          <p className="text-xs text-odc-warning">
            Cette action est irréversible. Utilisez le bouton &quot;Reset&quot;
            pour recommencer.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button
            variant="odc"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Lancer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}