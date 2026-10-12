'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, Users, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { getErrorMessage } from '@/lib/error-handler';

interface Props {
  evaluationId: string;
}

export function NotesSaisieTable({ evaluationId }: Props) {
  const qc = useQueryClient();
  const [notes, setNotes] = useState<Record<string, { note: string; commentaire: string }>>({});

  const { data: evaluation } = useQuery({
    queryKey: ['formateur', 'evaluation', evaluationId],
    queryFn: async () => {
      const { data } = await api.get(`/formateur/evaluations/${evaluationId}`);
      return data.data;
    },
  });

  const { data: participants, isLoading } = useQuery({
    queryKey: ['formateur', 'evaluation', evaluationId, 'participants'],
    queryFn: async () => {
      const { data } = await api.get(
        `/formateur/sessions/${evaluation?.sessionId}/participants`,
      );
      return data.data;
    },
    enabled: !!evaluation?.sessionId,
  });

  const { data: existingNotes } = useQuery({
    queryKey: ['formateur', 'notes', evaluationId],
    queryFn: async () => {
      const { data } = await api.get(`/formateur/notes`, {
        params: { evaluationId },
      });
      return data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: {
      participantId: string;
      note: number;
      commentaire?: string;
    }) => {
      await api.post(`/formateur/evaluations/${evaluationId}/notes`, payload);
    },
    onSuccess: () => {
      toast.success('Note enregistrée');
      qc.invalidateQueries({ queryKey: ['formateur', 'notes', evaluationId] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const handleSave = (participantId: string) => {
    const data = notes[participantId];
    if (!data || !data.note) {
      toast.error('Veuillez saisir une note');
      return;
    }
    mutation.mutate({
      participantId,
      note: Number(data.note),
      commentaire: data.commentaire || undefined,
    });
  };

  const setNote = (participantId: string, field: 'note' | 'commentaire', value: string) => {
    setNotes((n) => ({
      ...n,
      [participantId]: { ...n[participantId], [field]: value },
    }));
  };

  if (isLoading || !participants) {
    return <div className="h-64 bg-odc-surface-alt rounded-lg animate-pulse" />;
  }

  if (!participants.length) {
    return (
      <Card>
        <EmptyState
          icon={Users}
          title="Aucun participant"
          description="Aucun participant accepté pour cette session."
        />
      </Card>
    );
  }

  const notesMap = new Map(
    (existingNotes ?? []).map((n: any) => [n.participantId, n]),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-odc-primary" />
          Saisie des notes — {evaluation?.titre}
          <span className="text-sm font-normal text-odc-muted ml-auto">
            Barème : {evaluation?.noteMax} points
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead className="w-32">Note</TableHead>
              <TableHead>Commentaire</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((p: any) => {
              const existing = notesMap.get(p.id);
              const current = notes[p.id];
              const noteValue = current?.note ?? existing?.note?.toString() ?? '';
              const commentValue = current?.commentaire ?? existing?.commentaire ?? '';

              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={p.photoUrl ?? undefined} />
                        <AvatarFallback className="bg-odc-primary-soft text-odc-primary text-xs">
                          {getInitials(p.nom, p.prenom)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {p.prenom} {p.nom}
                        </p>
                        <p className="text-xs text-odc-muted">{p.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={noteValue}
                      onChange={(e) => setNote(p.id, 'note', e.target.value)}
                      min={0}
                      max={evaluation?.noteMax ?? 20}
                      step="0.5"
                      placeholder="—"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={commentValue}
                      onChange={(e) => setNote(p.id, 'commentaire', e.target.value)}
                      placeholder="Commentaire…"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={existing ? 'outline' : 'odc'}
                      size="sm"
                      onClick={() => handleSave(p.id)}
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : existing ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                          OK
                        </>
                      ) : (
                        <>
                          <Save className="h-3.5 w-3.5 mr-1.5" />
                          Enregistrer
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}