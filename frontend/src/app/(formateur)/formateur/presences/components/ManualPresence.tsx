// src/app/(formateur)/formateur/presences/[sessionId]/components/ManualPresence.tsx
'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  UserCheck,
  UserX,
  Loader2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Participant {
  id: string;
  prenom?: string;
  nom?: string;
  email?: string;
}

interface Props {
  sessionId: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER — extract tableau robuste (multi-format)
   ═══════════════════════════════════════════════════════════════════════════ */

function extractArray<T = any>(payload: any): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;

  // { data: [...] }
  if (Array.isArray(payload.data)) return payload.data;

  // { data: { data: [...] } }
  if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;

  // { data: { items: [...] } } / { data: { results: [...] } }
  if (payload.data && typeof payload.data === 'object') {
    const nested =
      payload.data.items ??
      payload.data.results ??
      payload.data.participants ??
      payload.data.rows;
    if (Array.isArray(nested)) return nested;
  }

  // { items: [...] } / { results: [...] }
  const direct =
    payload.items ?? payload.results ?? payload.participants ?? payload.rows;
  if (Array.isArray(direct)) return direct;

  return [];
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function ManualPresence({ sessionId }: Props) {
  const qc = useQueryClient();
  const [participantId, setParticipantId] = useState('');
  const [present, setPresent] = useState(true);
  const [commentaire, setCommentaire] = useState('');

  /* ---------- Chargement participants ---------- */
  const {
    data: participants = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Participant[]>({
    queryKey: ['formateur', 'session', sessionId, 'participants'],
    queryFn: async () => {
      const { data } = await api.get(
        `/formateur/sessions/${sessionId}/participants`,
      );
      // ⭐ Extraction robuste multi-format
      const list = extractArray<Participant>(data);
      return list.filter((p): p is Participant => p?.id != null);
    },
    enabled: !!sessionId,
    staleTime: 30_000,
  });

  /* ---------- Filtre local (sécurité) ---------- */
  const validParticipants = useMemo(
    () =>
      (Array.isArray(participants) ? participants : []).filter(
        (p): p is Participant => p?.id != null,
      ),
    [participants],
  );

  /* ---------- Mutation ---------- */
  const mutation = useMutation({
    mutationFn: async () => {
      if (!participantId) throw new Error('Participant requis');
      await api.post('/presences/manuel', {
        sessionId,
        participantId,
        present,
        commentaire: commentaire.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success(present ? 'Présence enregistrée' : 'Absence enregistrée');
      setParticipantId('');
      setCommentaire('');
      qc.invalidateQueries({ queryKey: ['formateur', 'presences', sessionId] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ── Loading ────────────────────────────────────────── */
  if (isLoading) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardContent className="flex items-center justify-center gap-2 py-8">
          <Loader2
            className="h-5 w-5 animate-spin text-orange-600 dark:text-orange-400"
            aria-hidden
          />
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Chargement…
          </span>
        </CardContent>
      </Card>
    );
  }

  /* ── Erreur ─────────────────────────────────────────── */
  if (isError) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
            <AlertCircle
              className="h-6 w-6 text-red-600 dark:text-red-400"
              aria-hidden
            />
          </div>
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Erreur de chargement
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void refetch()}
            className="h-9 rounded-lg"
          >
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* ── Aucun participant ──────────────────────────────── */
  if (validParticipants.length === 0) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
            <Users className="h-7 w-7" aria-hidden />
          </div>
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            Aucun participant
          </p>
          <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Les participants doivent être inscrits et acceptés.
          </p>
        </CardContent>
      </Card>
    );
  }

  /* ── Rendu principal ────────────────────────────────── */
  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <CardContent className="space-y-4 p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/30">
            <UserCheck className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Saisie manuelle
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {validParticipants.length} participant
              {validParticipants.length > 1 ? 's' : ''} disponible
              {validParticipants.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Participant */}
        <div>
          <Label
            htmlFor="participant"
            className="text-slate-900 dark:text-slate-50"
          >
            Participant <span className="text-red-600 dark:text-red-400">*</span>
          </Label>
          <Select
            value={participantId || ''}
            onValueChange={setParticipantId}
            disabled={mutation.isPending}
          >
            <SelectTrigger id="participant" className="mt-1.5">
              <SelectValue placeholder="Sélectionnez un participant" />
            </SelectTrigger>
            <SelectContent>
              {validParticipants.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.prenom ?? ''} {p.nom ?? ''}
                  {p.email && (
                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                      ({p.email})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Switch présent/absent */}
        <div
          className={cn(
            'flex items-center justify-between rounded-xl p-3 transition-colors',
            present
              ? 'bg-emerald-50/60 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:ring-emerald-500/30'
              : 'bg-red-50/60 ring-1 ring-red-200 dark:bg-red-500/10 dark:ring-red-500/30',
          )}
        >
          <div className="flex items-center gap-2">
            {present ? (
              <UserCheck
                className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                aria-hidden
              />
            ) : (
              <UserX
                className="h-4 w-4 text-red-600 dark:text-red-400"
                aria-hidden
              />
            )}
            <Label
              htmlFor="present"
              className={cn(
                'cursor-pointer',
                present
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-red-700 dark:text-red-300',
              )}
            >
              {present ? 'Présent' : 'Absent'}
            </Label>
          </div>
          <Switch
            id="present"
            checked={present}
            onCheckedChange={setPresent}
            disabled={mutation.isPending}
          />
        </div>

        {/* Commentaire */}
        <div>
          <Label
            htmlFor="commentaire"
            className="text-slate-900 dark:text-slate-50"
          >
            Commentaire (optionnel)
          </Label>
          <Textarea
            id="commentaire"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            rows={2}
            placeholder="Ex : Justificatif fourni"
            disabled={mutation.isPending}
            className="mt-1.5 resize-none"
          />
        </div>

        {/* Action */}
        <Button
          variant={present ? 'primary' : 'danger'}
          size="md"
          className="w-full rounded-lg"
          onClick={() => mutation.mutate()}
          disabled={!participantId || mutation.isPending}
        >
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          )}
          Enregistrer {present ? 'la présence' : "l'absence"}
        </Button>
      </CardContent>
    </Card>
  );
}