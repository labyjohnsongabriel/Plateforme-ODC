'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserCheck, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

interface Props { sessionId: string }

export function ManualPresence({ sessionId }: Props) {
  const qc = useQueryClient();
  const [participantId, setParticipantId] = useState('');
  const [present, setPresent] = useState(true);
  const [commentaire, setCommentaire] = useState('');

  const { data: participants } = useQuery({
    queryKey: ['formateur', 'session', sessionId, 'participants'],
    queryFn: async () => {
      const { data } = await api.get(`/formateur/sessions/${sessionId}/participants`);
      return data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post('/formateur/presences/manuelle', {
        sessionId,
        participantId,
        present,
        commentaire: commentaire || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Présence enregistrée');
      setParticipantId('');
      setCommentaire('');
      qc.invalidateQueries({ queryKey: ['formateur', 'presences', sessionId] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserCheck className="h-5 w-5 text-odc-primary" />
          Saisie manuelle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="participant">Participant</Label>
          <Select value={participantId} onValueChange={setParticipantId}>
            <SelectTrigger id="participant" className="mt-1.5">
              <SelectValue placeholder="Sélectionnez un participant" />
            </SelectTrigger>
            <SelectContent>
              {participants?.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.prenom} {p.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="present">Marquer comme présent</Label>
          <Switch
            id="present"
            checked={present}
            onCheckedChange={setPresent}
          />
        </div>

        <div>
          <Label htmlFor="commentaire">Commentaire (optionnel)</Label>
          <textarea
            id="commentaire"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            rows={2}
            placeholder="Ex: Justificatif fourni"
            className="input-odc mt-1.5 resize-none"
          />
        </div>

        <Button
          variant="odc"
          className="w-full"
          onClick={() => mutation.mutate()}
          disabled={!participantId || mutation.isPending}
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Enregistrer la présence
        </Button>
      </CardContent>
    </Card>
  );
}