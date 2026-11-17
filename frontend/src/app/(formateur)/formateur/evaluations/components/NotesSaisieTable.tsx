// src/app/(formateur)/formateur/notes/components/NotesSaisieTable.tsx
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
import { EmptyState } from '@/components/shared/EmptyState';
import { ParticipantAvatar } from '@/components/shared/ParticipantAvatar';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

interface Props {
  evaluationId: string;
  basePath?: 'formateur' | 'staff';
}

export function NotesSaisieTable({
  evaluationId,
  basePath = 'formateur',
}: Props) {
  const qc = useQueryClient();
  const [notes, setNotes] = useState<Record<string, { note: string; commentaire: string }>>({});

  const { data: evaluation } = useQuery({
    queryKey: [basePath, 'evaluation', evaluationId],
    queryFn: async () => {
      const { data } = await api.get(`/${basePath}/evaluations/${evaluationId}`);
      return data.data;
    },
  });

  const { data: participants, isLoading } = useQuery({
    queryKey: [basePath, 'evaluation', evaluationId, 'participants'],
    queryFn: async () => {
      const { data } = await api.get(
        `/${basePath}/sessions/${evaluation?.sessionId}/participants`,
      );
      return data.data;
    },
    enabled: !!evaluation?.sessionId,
  });

  const { data: existingNotes } = useQuery({
    queryKey: [basePath, 'notes', evaluationId],
    queryFn: async () => {
      const { data } = await api.get(`/${basePath}/notes`, {
        params: { evaluationId },
      });
      return data.data;
    },
  });

  const { data: submissions = [] } = useQuery({
    queryKey: [basePath, 'evaluation', evaluationId, 'soumissions'],
    queryFn: async () => {
      const { data } = await api.get(
        `/${basePath}/evaluations/${evaluationId}/soumissions`,
      );
      return data.data;
    },
    enabled: !!evaluationId,
  });

  const mutation = useMutation({
    mutationFn: async (payload: {
      participantId: string;
      note: number;
      commentaire?: string;
    }) => {
      await api.post(`/${basePath}/evaluations/${evaluationId}/notes`, payload);
    },
    onSuccess: () => {
      toast.success('Note enregistrée');
      qc.invalidateQueries({ queryKey: [basePath, 'notes', evaluationId] });
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
    return (
      <div className="h-64 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
    );
  }

  if (!participants.length) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <EmptyState
          icon={Users}
          title="Aucun participant"
          description="Aucun participant accepté pour cette session."
        />
      </Card>
    );
  }

  const notesMap = new Map<
    string,
    { note: number; commentaire?: string }
  >(
    (existingNotes ?? []).map((n: any) => [
      n.participantId,
      { note: Number(n.note), commentaire: n.commentaire },
    ] as const),
  );
  const submissionsMap = new Map(
    (submissions as any[]).map((submission) => [
      submission.participantId,
      submission,
    ]),
  );

  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-50">
          <Users className="h-5 w-5 text-slate-500 dark:text-slate-400" aria-hidden />
          Saisie des notes — {evaluation?.titre}
          <span className="ml-auto text-sm font-normal text-slate-500 dark:text-slate-400">
            Barème : {evaluation?.noteMax} points
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 dark:border-slate-800">
              <TableHead className="text-slate-700 dark:text-slate-300">Participant</TableHead>
              <TableHead className="w-32 text-slate-700 dark:text-slate-300">Note</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Commentaire</TableHead>
              <TableHead className="w-32 text-right text-slate-700 dark:text-slate-300">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((p: any) => {
              const existing = notesMap.get(p.id);
              const submission = submissionsMap.get(p.id);
              const current = notes[p.id];
              const noteValue = current?.note ?? existing?.note?.toString() ?? '';
              const commentValue = current?.commentaire ?? existing?.commentaire ?? '';

              return (
                <TableRow
                  key={p.id}
                  className="border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* ⭐ Avatar avec photo */}
                      <ParticipantAvatar
                        prenom={p.prenom}
                        nom={p.nom}
                        photoUrl={p.photoUrl}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                          {p.prenom} {p.nom}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {p.email}
                        </p>
                        {submission && (
                          <p className="mt-1 max-w-xs whitespace-pre-line text-xs text-slate-600 dark:text-slate-400">
                            Réponse : {submission.reponses?.contenu}
                          </p>
                        )}
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
                      size="sm"
                      onClick={() => handleSave(p.id)}
                      disabled={mutation.isPending}
                      className={cn(
                        'h-8 rounded-lg px-3 font-medium',
                        existing
                          ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                          : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
                      )}
                    >
                      {mutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : existing ? (
                        <>
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                          OK
                        </>
                      ) : (
                        <>
                          <Save className="mr-1.5 h-3.5 w-3.5" aria-hidden />
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