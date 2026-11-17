// src/app/(formateur)/formateur/notes/components/NotesSaisieModal.tsx
'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2, Save, Users, CheckCircle2, Download, X,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ParticipantAvatar } from '@/components/shared/ParticipantAvatar';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { TYPE_CONFIG, EvaluationType } from '@/lib/evaluations/types';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluationId?: string;
  basePath?: 'formateur' | 'staff';
}

export function NotesSaisieModal({
  open, onOpenChange, evaluationId, basePath = 'formateur',
}: Props) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Record<string, { note: string; commentaire: string }>>({});

  const { data: evaluation } = useQuery({
    queryKey: [basePath, 'evaluation', evaluationId],
    queryFn: async () => {
      const { data } = await api.get(`/${basePath}/evaluations/${evaluationId}`);
      return data.data;
    },
    enabled: open && !!evaluationId,
  });

  const { data: participants, isLoading } = useQuery({
    queryKey: [basePath, 'evaluation', evaluationId, 'participants'],
    queryFn: async () => {
      const { data } = await api.get(
        `/${basePath}/sessions/${evaluation.sessionId}/participants`,
      );
      return (data.data ?? []) as any[];
    },
    enabled: open && !!evaluation?.sessionId,
  });

  const { data: existingNotes = [] } = useQuery({
    queryKey: [basePath, 'notes', evaluationId],
    queryFn: async () => {
      const { data } = await api.get(`/${basePath}/notes`, { params: { evaluationId } });
      return (data.data ?? []) as any[];
    },
    enabled: open && !!evaluationId,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: [basePath, 'evaluation', evaluationId, 'soumissions'],
    queryFn: async () => {
      const { data } = await api.get(`/${basePath}/evaluations/${evaluationId}/soumissions`);
      return (data.data ?? []) as any[];
    },
    enabled: open && !!evaluationId,
  });

  const mutation = useMutation({
    mutationFn: async (payload: { participantId: string; note: number; commentaire?: string }) => {
      await api.post(`/${basePath}/evaluations/${evaluationId}/notes`, payload);
    },
    onSuccess: () => {
      toast.success('Note enregistrée');
      qc.invalidateQueries({ queryKey: [basePath, 'notes', evaluationId] });
      qc.invalidateQueries({ queryKey: [basePath, 'evaluations'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const bulkSave = async () => {
    const entries = Object.entries(draft).filter(([, v]) => v.note !== '');
    if (!entries.length) {
      toast.error('Aucune note à enregistrer');
      return;
    }
    for (const [participantId, v] of entries) {
      await mutation.mutateAsync({
        participantId,
        note: Number(v.note),
        commentaire: v.commentaire || undefined,
      });
    }
    setDraft({});
  };

  const notesMap = useMemo(
    () => new Map((existingNotes ?? []).map((n: any) => [n.participantId, n])),
    [existingNotes],
  );
  const subsMap = useMemo(
    () => new Map((submissions ?? []).map((s: any) => [s.participantId, s])),
    [submissions],
  );

  const type = (evaluation?.type ?? 'QUIZ') as EvaluationType;
  const cfg = TYPE_CONFIG[type];
  const isProject = type === 'PROJET';
  const isOral = type === 'ORAL';
  const isTP = type === 'TP';

  const setDraftField = (id: string, k: 'note' | 'commentaire', v: string) =>
    setDraft((d) => ({ ...d, [id]: { ...d[id], [k]: v } }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-50">
            <Users className="h-5 w-5 text-slate-500 dark:text-slate-400" aria-hidden />
            Saisie des notes — {evaluation?.titre}
            <Badge
              variant="outline"
              className="ml-2 border-slate-200 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300"
            >
              {evaluation?.type}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Barème : {evaluation?.noteMax} pts — Min. passage : {evaluation?.noteMinPassage ?? '—'}
            {cfg.showCoefficient && ` — Coef. ${evaluation?.coefficient}`}
            {cfg.showDuree && evaluation?.dureeMinutes ? ` — ${evaluation.dureeMinutes} min` : ''}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="h-64 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
        ) : !participants?.length ? (
          <EmptyState
            icon={Users}
            title="Aucun participant"
            description="Aucun participant accepté pour cette session."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="text-slate-700 dark:text-slate-300">Participant</TableHead>
                {isProject && <TableHead className="text-slate-700 dark:text-slate-300">Livrable</TableHead>}
                {isTP && <TableHead className="text-slate-700 dark:text-slate-300">Compte-rendu</TableHead>}
                {isOral && <TableHead className="text-slate-700 dark:text-slate-300">Support</TableHead>}
                <TableHead className="w-28 text-slate-700 dark:text-slate-300">Note</TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Commentaire</TableHead>
                <TableHead className="w-24 text-right text-slate-700 dark:text-slate-300">
                  Statut
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((p: any) => {
                const existing = notesMap.get(p.id);
                const sub = subsMap.get(p.id);
                const d = draft[p.id];
                const noteValue = d?.note ?? existing?.note?.toString() ?? '';
                const commentValue = d?.commentaire ?? existing?.commentaire ?? '';

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
                        </div>
                      </div>
                    </TableCell>

                    {(isProject || isTP || isOral) && (
                      <TableCell>
                        {sub?.fichierUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                          >
                            <a href={sub.fichierUrl} target="_blank" rel="noreferrer">
                              <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                              Voir
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </TableCell>
                    )}

                    <TableCell>
                      <Input
                        type="number"
                        value={noteValue}
                        onChange={(e) => setDraftField(p.id, 'note', e.target.value)}
                        min={0}
                        max={evaluation?.noteMax ?? 20}
                        step="0.5"
                        placeholder="—"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={commentValue}
                        onChange={(e) => setDraftField(p.id, 'commentaire', e.target.value)}
                        placeholder={isOral ? 'Critères oraux…' : 'Commentaire…'}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {existing ? (
                        <Badge className="border border-emerald-200 bg-emerald-50 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden />
                          Noté
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-slate-200 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400"
                        >
                          En attente
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
            className="h-9 rounded-lg border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            <X className="mr-2 h-4 w-4" aria-hidden />
            Fermer
          </Button>
          <Button
            type="button"
            onClick={bulkSave}
            disabled={mutation.isPending || !Object.keys(draft).length}
            className={cn(
              'h-9 rounded-lg px-4 font-medium',
              'bg-slate-900 text-white hover:bg-slate-800',
              'dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="mr-2 h-4 w-4" aria-hidden />
            )}
            Enregistrer les notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}