'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Award, Loader2, Sparkles } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';

export function GenerateAttestationDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const { data: sessions } = useQuery({
    queryKey: ['admin', 'sessions', 'terminees'],
    queryFn: async () => {
      const { data } = await api.get('/admin/sessions', {
        params: { statut: 'TERMINEE', limit: 100 },
      });
      return data.data;
    },
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(
        `/admin/attestations/generer-session/${sessionId}`,
      );
      return data.data;
    },
    onSuccess: (data: any) => {
      toast.success(`${data.generes} attestation(s) générée(s)`);
      if (data.ignores > 0) {
        toast.info(`${data.ignores} participant(s) ignoré(s)`);
      }
      qc.invalidateQueries({ queryKey: ['admin', 'attestations'] });
      setOpen(false);
      setSessionId('');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="odc">
          <Award className="h-4 w-4 mr-2" />
          Générer des attestations
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-odc-primary" />
            Générer les attestations
          </DialogTitle>
          <DialogDescription>
            Sélectionnez une session terminée. Les attestations seront générées
            automatiquement pour tous les participants éligibles (présence ≥ 75%
            et note ≥ 10/20).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="session">Session</Label>
            <Select value={sessionId} onValueChange={setSessionId}>
              <SelectTrigger id="session" className="mt-1.5">
                <SelectValue placeholder="Sélectionnez une session terminée" />
              </SelectTrigger>
              <SelectContent>
                {sessions?.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.codeSession} — {s.formation?.titre} —{' '}
                    {formatDate(s.dateDebut)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sessions?.length === 0 && (
              <p className="text-xs text-odc-muted mt-1.5">
                Aucune session terminée disponible.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="odc"
            onClick={() => mutation.mutate()}
            disabled={!sessionId || mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Générer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}