// src/app/(staff)/staff/notes/components/NotesTable.tsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FileText,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { Pagination } from '@/components/shared/Pagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { getMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Note {
  id: string;
  note: number;
  commentaire?: string | null;
  createdAt?: string | null;
  participant?: {
    id?: string;
    prenom?: string | null;
    nom?: string | null;
    email?: string | null;
    photoUrl?: string | null;
  } | null;
  evaluation?: {
    id?: string;
    titre?: string | null;
    noteMax?: number | null;
    noteMinPassage?: number | null;
    coefficient?: number | null;
    session?: {
      formation?: { titre?: string | null } | null;
    } | null;
  } | null;
}

interface NotesResponse {
  data: Note[];
  pagination?: { page: number; totalPages: number; total?: number };
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function extractNotes(response: unknown): NotesResponse {
  if (!response || typeof response !== 'object') return { data: [] };
  const r = response as Record<string, unknown>;
  const root = (r.data ?? r) as Record<string, unknown>;

  const rawList =
    (Array.isArray(root.notes) && root.notes) ||
    (Array.isArray(root.data) && root.data) ||
    (Array.isArray(root.items) && root.items) ||
    (Array.isArray(root) && root) ||
    [];

  const notes = (rawList as unknown[])
    .filter((n): n is Note => n != null && typeof n === 'object' && 'id' in n)
    .filter((n) => typeof n.id === 'string' && n.id.length > 0);

  return {
    data: notes,
    pagination: (root.pagination as NotesResponse['pagination']) ?? undefined,
  };
}

function getNoteTone(
  note: number,
  noteMax?: number | null,
  noteMinPassage?: number | null,
) {
  if (noteMax == null || noteMax === 0) {
    return {
      className: 'text-slate-900 dark:text-slate-50',
      bg: 'bg-slate-100 dark:bg-slate-800',
      label: '—',
    };
  }
  const ratio = note / noteMax;

  if (noteMinPassage != null && note >= noteMinPassage) {
    return {
      className: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      label: 'Validé',
    };
  }
  if (noteMinPassage != null && note < noteMinPassage) {
    return {
      className: 'text-red-700 dark:text-red-300',
      bg: 'bg-red-50 dark:bg-red-500/10',
      label: 'Échec',
    };
  }
  if (ratio >= 0.8) {
    return {
      className: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      label: 'Excellent',
    };
  }
  return {
    className: 'text-slate-900 dark:text-slate-50',
    bg: 'bg-slate-100 dark:bg-slate-800',
    label: '—',
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   AVATAR PARTICIPANT (image + fallback)
   ═══════════════════════════════════════════════════════════════════════════ */

function ParticipantAvatar({
  prenom,
  nom,
  photoUrl,
}: {
  prenom?: string | null;
  nom?: string | null;
  photoUrl?: string | null;
}) {
  const [imageError, setImageError] = useState(false);

  const initials =
    `${prenom?.[0] ?? '?'}${nom?.[0] ?? ''}`.toUpperCase() || '?';

  const src = !imageError && photoUrl ? getMediaUrl(photoUrl) : null;

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-semibold text-white ring-2 ring-white dark:ring-slate-900">
      {src ? (
        <img
          src={src}
          alt={`${prenom ?? ''} ${nom ?? ''}`.trim() || 'Avatar'}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */

export function NotesTable() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();

  /* ⭐ Note en attente de suppression (ouvre/ferme le dialog) */
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
    evaluationId: searchParams.get('evaluationId') ?? undefined,
    participantId: searchParams.get('participantId') ?? undefined,
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery<NotesResponse>({
    queryKey: ['staff', 'notes', filters],
    queryFn: async () => {
      const response = await api.get('/staff/notes', { params: filters });
      return extractNotes(response.data);
    },
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/staff/notes/${id}`);
    },
    onSuccess: () => {
      toast.success('Note supprimée');
      qc.invalidateQueries({ queryKey: ['staff', 'notes'] });
      setNoteToDelete(null);   // ⭐ ferme le dialog
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ── Header ─────────────────────────────────────────── */
  const header = (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl">
          Notes
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Consultez et gérez les notes saisies.
        </p>
      </div>
    </header>
  );

  /* ── Loading ────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        {header}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── Erreur ─────────────────────────────────────────── */
  if (isError) {
    return (
      <div className="space-y-6">
        {header}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-6">
            <QueryErrorState onRetry={() => void refetch()} isRetrying={isFetching} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const notes = data?.data ?? [];

  /* ── Vide ───────────────────────────────────────────── */
  if (notes.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-6">
            <EmptyState
              icon={FileText}
              title="Aucune note"
              description="Les notes saisies apparaîtront ici."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── Rendu principal ────────────────────────────────── */
  return (
    <div className="space-y-6">
      {header}

      <Card className="overflow-hidden border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 hover:bg-transparent dark:border-slate-800">
                <TableHead className="text-slate-700 dark:text-slate-300">
                  Participant
                </TableHead>
                <TableHead className="hidden text-slate-700 dark:text-slate-300 md:table-cell">
                  Évaluation
                </TableHead>
                <TableHead className="text-slate-700 dark:text-slate-300">Note</TableHead>
                <TableHead className="hidden text-slate-700 dark:text-slate-300 lg:table-cell">
                  Commentaire
                </TableHead>
                <TableHead className="text-right text-slate-700 dark:text-slate-300">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.map((n) => {
                const tone = getNoteTone(
                  n.note,
                  n.evaluation?.noteMax,
                  n.evaluation?.noteMinPassage,
                );
                const noteMax = n.evaluation?.noteMax ?? 20;
                const ratio = noteMax > 0 ? n.note / noteMax : 0;

                return (
                  <TableRow
                    key={n.id}
                    className="group border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                  >
                    {/* Participant */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ParticipantAvatar
                          prenom={n.participant?.prenom}
                          nom={n.participant?.nom}
                          photoUrl={n.participant?.photoUrl}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                            {n.participant?.prenom ?? ''} {n.participant?.nom ?? ''}
                          </p>
                          {n.participant?.email && (
                            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                              {n.participant.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Évaluation */}
                    <TableCell className="hidden md:table-cell">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-slate-900 dark:text-slate-50">
                          {n.evaluation?.titre ?? '—'}
                        </p>
                        {n.evaluation?.session?.formation?.titre && (
                          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                            {n.evaluation.session.formation.titre}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Note */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'flex items-baseline gap-1 rounded-md px-2 py-1',
                            tone.bg,
                          )}
                        >
                          <span
                            className={cn(
                              'font-display text-lg font-bold tabular-nums leading-none',
                              tone.className,
                            )}
                          >
                            {n.note}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            / {noteMax}
                          </span>
                        </div>
                        {tone.label !== '—' && (
                          <Badge
                            variant="outline"
                            className={cn(
                              'hidden text-[10px] font-semibold sm:inline-flex',
                              tone.className,
                            )}
                          >
                            {tone.label}
                          </Badge>
                        )}
                      </div>

                      {/* Barre de progression */}
                      <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={cn(
                            'h-full transition-all',
                            ratio >= 1
                              ? 'bg-emerald-500'
                              : ratio >= 0.5
                                ? 'bg-slate-900 dark:bg-slate-50'
                                : 'bg-red-500',
                          )}
                          style={{ width: `${Math.min(100, ratio * 100)}%` }}
                        />
                      </div>
                    </TableCell>

                    {/* Commentaire */}
                    <TableCell className="hidden max-w-xs lg:table-cell">
                      {n.commentaire ? (
                        <div className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <MessageSquare
                            className="mt-0.5 h-3 w-3 shrink-0 text-slate-400 dark:text-slate-500"
                            aria-hidden
                          />
                          <p className="line-clamp-2">{n.commentaire}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'h-8 w-8 rounded-lg text-slate-400 opacity-60 transition-all',
                          'hover:bg-red-50 hover:text-red-600 group-hover:opacity-100',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
                          'dark:hover:bg-red-950/30 dark:hover:text-red-400',
                        )}
                        onClick={() => setNoteToDelete(n)}   // ⭐ ouvre le dialog
                        aria-label={`Supprimer la note de ${n.participant?.prenom ?? ''} ${n.participant?.nom ?? ''}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
            />
          </div>
        )}
      </Card>

      {/* ⭐ Dialog de confirmation */}
      <ConfirmDialog
        open={!!noteToDelete}
        onOpenChange={(open) => {
          if (!open) setNoteToDelete(null);
        }}
        onConfirm={() => {
          if (noteToDelete) deleteMutation.mutate(noteToDelete.id);
        }}
        title="Supprimer cette note ?"
        description={
          noteToDelete
            ? `La note de ${noteToDelete.participant?.prenom ?? ''} ${noteToDelete.participant?.nom ?? ''} (${noteToDelete.note}/${noteToDelete.evaluation?.noteMax ?? 20}) sera définitivement supprimée. Cette action est irréversible.`
            : undefined
        }
        confirmLabel="Supprimer la note"
        cancelLabel="Annuler"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}