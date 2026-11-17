// src/app/(staff)/staff/attestations/components/GenerateDialog.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Award,
  Loader2,
  Sparkles,
  AlertCircle,
  Calendar,
  Users,
  CheckCircle2,
  Info,
  Shield,
  FileCheck2,
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Session {
  id: string;
  codeSession?: string;
  dateDebut?: string | null;
  dateFin?: string | null;
  statut?: string | null;
  participantsCount?: number;
  inscriptionsCount?: number;
  formation?: { titre?: string | null } | null;
}

interface GenerateResult {
  generes: number;
  ignores: number;
  details?: {
    participantsEligibles?: number;
    participantsIgnores?: number;
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function extractSessions(data: unknown): Session[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Session[];

  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const candidates = [obj.sessions, obj.data, obj.items, obj.results];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate as Session[];

      if (candidate && typeof candidate === 'object') {
        const nested = candidate as Record<string, unknown>;
        for (const key of ['sessions', 'data', 'items', 'results']) {
          if (Array.isArray(nested[key])) return nested[key] as Session[];
        }
      }
    }
  }
  return [];
}

function filterTerminees(sessions: Session[]): Session[] {
  const TERMINEE_STATUTS = new Set([
    'TERMINEE',
    'TERMINE',
    'CLOTUREE',
    'CLOTURE',
    'COMPLETE',
    'COMPLET',
    'FINISHED',
    'COMPLETED',
  ]);

  return sessions.filter((s) => {
    if (!s.statut) return false;
    return TERMINEE_STATUTS.has(s.statut.toUpperCase());
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function GenerateDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');

  /* ── Query sessions terminées ─────────────────────── */
  const {
    data: sessions = [],
    isLoading: sessionsLoading,
    isError: sessionsError,
    error: sessionsErrorObj,
    refetch: refetchSessions,
  } = useQuery<Session[]>({
    queryKey: ['staff', 'sessions', 'terminees'],
    queryFn: async () => {
      const response = await api.get('/staff/sessions', {
        params: { limit: 200 },
      });
      const root = response.data?.data ?? response.data;
      const list = extractSessions(root);
      return filterTerminees(list);
    },
    enabled: open,
    staleTime: 60_000,
  });

  const selectedSession = sessions.find((s) => s.id === sessionId);

  /* ── Mutation génération ─────────────────────────── */
  const mutation = useMutation({
    mutationFn: async (): Promise<GenerateResult> => {
      const { data } = await api.post(
        `/staff/attestations/generer-session/${sessionId}`,
      );
      return data.data as GenerateResult;
    },
    onSuccess: (result) => {
      toast.success(
        `${result.generes} attestation${result.generes > 1 ? 's' : ''} générée${result.generes > 1 ? 's' : ''}`,
      );
      if (result.ignores > 0) {
        toast.info(
          `${result.ignores} participant${result.ignores > 1 ? 's' : ''} ignoré${result.ignores > 1 ? 's' : ''} (non éligibles)`,
        );
      }
      qc.invalidateQueries({ queryKey: ['staff', 'attestations'] });
      setOpen(false);
      setSessionId('');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const closeDialog = (v: boolean) => {
    if (mutation.isPending) return;
    setOpen(v);
    if (!v) setSessionId('');
  };

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            'h-9 rounded-lg px-4 font-medium',
            'bg-slate-900 text-white hover:bg-slate-800',
            'dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
          )}
        >
          <Award className="mr-2 h-4 w-4" aria-hidden />
          Générer
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-50">
            <Sparkles className="h-5 w-5 text-slate-500 dark:text-slate-400" aria-hidden />
            Générer les attestations
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Les attestations seront créées automatiquement pour les participants
            éligibles de la session terminée sélectionnée.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ── Sélection session ──────────────────────── */}
          <div>
            <label
              htmlFor="session-select"
              className="mb-1.5 block text-sm font-medium text-slate-900 dark:text-slate-50"
            >
              Session terminée <span className="text-red-600 dark:text-red-400">*</span>
            </label>

            {sessionsLoading ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : sessionsError ? (
              <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-950/30">
                <p className="flex items-center gap-1.5 text-sm font-medium text-red-700 dark:text-red-300">
                  <AlertCircle className="h-4 w-4" aria-hidden />
                  Erreur de chargement
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {getErrorMessage(sessionsErrorObj)}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refetchSessions()}
                  className="h-8 rounded-lg border-red-200 text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-950/30"
                >
                  Réessayer
                </Button>
              </div>
            ) : sessions.length === 0 ? (
              <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
                <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-300">
                  <Info className="h-4 w-4" aria-hidden />
                  Aucune session terminée
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Terminez d&apos;abord une session (statut « Terminée ») pour
                  pouvoir générer des attestations.
                </p>
              </div>
            ) : (
              <Select
                value={sessionId}
                onValueChange={setSessionId}
                disabled={mutation.isPending}
              >
                <SelectTrigger id="session-select">
                  <SelectValue placeholder="Sélectionner une session…" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="font-mono text-xs">
                        {s.codeSession ?? s.id.slice(0, 8)}
                      </span>
                      <span className="mx-1.5 text-slate-400 dark:text-slate-500">—</span>
                      <span>{s.formation?.titre ?? 'Sans titre'}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {sessions.length > 0 && (
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                {sessions.length} session{sessions.length > 1 ? 's' : ''}{' '}
                terminée{sessions.length > 1 ? 's' : ''} disponible
                {sessions.length > 1 ? 's' : ''}.
              </p>
            )}
          </div>

          {/* ── Détails de la session sélectionnée ─────── */}
          {selectedSession && (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                  <Calendar className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    {selectedSession.formation?.titre ?? 'Session'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedSession.dateDebut &&
                      formatDate(selectedSession.dateDebut)}
                    {selectedSession.dateFin &&
                      ` → ${formatDate(selectedSession.dateFin)}`}
                  </p>
                </div>
              </div>

              {(selectedSession.participantsCount != null ||
                selectedSession.inscriptionsCount != null) && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Users className="h-3.5 w-3.5" aria-hidden />
                  {selectedSession.participantsCount ??
                    selectedSession.inscriptionsCount}{' '}
                  participant
                  {(selectedSession.participantsCount ??
                    selectedSession.inscriptionsCount ??
                    0) > 1
                    ? 's'
                    : ''}{' '}
                  inscrit
                  {(selectedSession.participantsCount ??
                    selectedSession.inscriptionsCount ??
                    0) > 1
                    ? 's'
                    : ''}
                </div>
              )}
            </div>
          )}

          {/* ── Conditions d'éligibilité ───────────────── */}
          {sessions.length > 0 && (
            <div className="space-y-2 rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-500/30 dark:bg-sky-500/10">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-sky-800 dark:text-sky-300">
                <Shield className="h-4 w-4" aria-hidden />
                Conditions d&apos;éligibilité
              </p>
              <ul className="space-y-1 text-xs text-sky-800 dark:text-sky-200">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                  Présence ≥ 75 %
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                  Moyenne pondérée ≥ 10 / 20
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                  Inscription au statut « Acceptée »
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                  Toutes les évaluations du participant notées
                </li>
              </ul>
              <p className="pt-1 text-[11px] text-sky-700 dark:text-sky-300">
                Les participants non éligibles seront ignorés (aucune attestation
                ne sera générée pour eux).
              </p>
            </div>
          )}

          {/* ── Procédure de génération ────────────────── */}
          {sessions.length > 0 && (
            <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-50">
                <FileCheck2 className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden />
                Procédure
              </p>
              <ol className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white dark:bg-slate-50 dark:text-slate-900">
                    1
                  </span>
                  Sélectionnez une session terminée.
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white dark:bg-slate-50 dark:text-slate-900">
                    2
                  </span>
                  Vérifiez que toutes les notes ont bien été saisies.
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white dark:bg-slate-50 dark:text-slate-900">
                    3
                  </span>
                  Cliquez sur « Générer les attestations ».
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white dark:bg-slate-50 dark:text-slate-900">
                    4
                  </span>
                  Les attestations sont créées pour les participants éligibles.
                </li>
              </ol>
            </div>
          )}

          {/* ── Avertissement irréversible ─────────────── */}
          {sessionId && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300"
                aria-hidden
              />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Cette action créera des attestations <strong>officielles</strong>.
                Vérifiez que toutes les notes de la session ont bien été saisies
                avant de générer.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => closeDialog(false)}
            disabled={mutation.isPending}
            className={cn(
              'h-9 rounded-lg border-slate-200 bg-white font-medium',
              'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
              'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
            )}
          >
            Annuler
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!sessionId || mutation.isPending}
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
              <Award className="mr-2 h-4 w-4" aria-hidden />
            )}
            {mutation.isPending ? 'Génération…' : 'Générer les attestations'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}