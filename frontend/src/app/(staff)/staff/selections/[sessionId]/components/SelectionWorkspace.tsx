// src/app/(staff)/staff/selections/[sessionId]/components/SelectionWorkspace.tsx
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Users,
  RotateCcw,
  Filter,
  AlertCircle,
  Search,
  X,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';
import { CandidatsTable } from './CandidatsTable';
import { SelectionActions } from './SelectionActions';
import { AutoSelectionDialog } from './AutoSelectionDialog';
import { SelectionStats } from './SelectionStats';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Candidat {
  id: string;
  statut: string;
  dateInscription?: string;
  motivation?: string | null;
  participant?: {
    id?: string;
    prenom?: string;
    nom?: string;
    email?: string;
    telephone?: string | null;
    photoUrl?: string | null;   // ⭐ photo transmise à la table
  } | null;
}

interface SelectionResponse {
  sessionId: string;
  codeSession: string;
  session?: {
    id: string;
    codeSession: string;
    placesMax?: number;
    placesRestantes?: number;
    formation?: { id: string; titre: string } | null;
  };
  candidats: Candidat[];
  stats: {
    total: number;
    enAttente: number;
    acceptes?: number;
    acceptees?: number;
    refuses?: number;
    refusees?: number;
    listeAttente?: number;
    capacite?: number;
    placesRestantes?: number;
    tauxRemplissage?: number;
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function SelectionWorkspace({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const qc = useQueryClient();

  const [selected, setSelected] = useState<string[]>([]);
  const [filterStatut, setFilterStatut] = useState('all');
  const [search, setSearch] = useState('');
  const [resetOpen, setResetOpen] = useState(false);

  const { data, isLoading, isError, refetch, isFetching } = useQuery<SelectionResponse>({
    queryKey: ['staff', 'selection', sessionId],
    queryFn: async () => {
      const response = await api.get(
        `/staff/selections/session/${sessionId}/candidats`,
        { params: { limit: 200 } },
      );

      const root = response.data?.data ?? response.data ?? {};
      const rawList =
        root.candidats ??
        root.inscriptions ??
        root.data ??
        root.items ??
        root.results ??
        (Array.isArray(root) ? root : []);

      const candidats: Candidat[] = (Array.isArray(rawList) ? rawList : [])
        .filter((raw): raw is Record<string, any> => raw != null)
        .map((raw) => {
          const id = raw.id ?? raw.inscriptionId ?? raw.inscription_id;
          if (!id) return null;

          let participant = raw.participant ?? raw.user ?? null;
          if (!participant && (raw.prenom || raw.nom || raw.email)) {
            participant = {
              id: raw.participantId ?? raw.participant_id ?? raw.userId,
              prenom: raw.prenom ?? '',
              nom: raw.nom ?? '',
              email: raw.email ?? '',
              telephone: raw.telephone ?? null,
              photoUrl: raw.photoUrl ?? raw.photo_url ?? null,   // ⭐
            };
          }

          return {
            id: String(id),
            statut: raw.statut ?? 'EN_ATTENTE',
            dateInscription: raw.dateInscription ?? raw.createdAt ?? raw.created_at,
            motivation: raw.motivation ?? null,
            participant: participant
              ? {
                  id: participant.id,
                  prenom: participant.prenom ?? '',
                  nom: participant.nom ?? '',
                  email: participant.email ?? '',
                  telephone: participant.telephone ?? null,
                  photoUrl:
                    participant.photoUrl ??
                    participant.photo_url ??
                    participant.avatarUrl ??
                    null,                                       // ⭐
                }
              : null,
          } as Candidat;
        })
        .filter((c): c is Candidat => c !== null);

      return {
        sessionId: root.sessionId ?? sessionId,
        codeSession: root.codeSession ?? '',
        session: root.session ?? null,
        candidats,
        stats: {
          total: root.stats?.total ?? candidats.length,
          enAttente:
            root.stats?.enAttente ??
            candidats.filter((c) => c.statut === 'EN_ATTENTE').length,
          acceptes: root.stats?.acceptes ?? 0,
          acceptees:
            root.stats?.acceptees ??
            candidats.filter((c) => c.statut === 'ACCEPTEE').length,
          refuses: root.stats?.refuses ?? 0,
          refusees:
            root.stats?.refusees ??
            candidats.filter((c) => c.statut === 'REFUSEE').length,
          listeAttente: root.stats?.listeAttente ?? 0,
          capacite: root.stats?.capacite ?? 0,
          placesRestantes: root.stats?.placesRestantes ?? 0,
          tauxRemplissage: root.stats?.tauxRemplissage ?? 0,
        },
      };
    },
    enabled: !!sessionId,
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/staff/selections/session/${sessionId}/reset`);
    },
    onSuccess: () => {
      toast.success('Sélections réinitialisées');
      setSelected([]);
      setResetOpen(false);
      qc.invalidateQueries({ queryKey: ['staff', 'selection', sessionId] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const filteredCandidats = useMemo(() => {
    const candidats = data?.candidats ?? [];
    const query = search.trim().toLowerCase();

    return candidats.filter((c) => {
      if (filterStatut !== 'all' && c.statut !== filterStatut) return false;
      if (!query) return true;
      const fullName = `${c.participant?.prenom ?? ''} ${c.participant?.nom ?? ''}`.toLowerCase();
      const email = (c.participant?.email ?? '').toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
  }, [data, filterStatut, search]);

  /* ── Loading ────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  /* ── Erreur ─────────────────────────────────────────── */
  if (isError || !data) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
          Retour
        </Button>
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 dark:text-red-400" aria-hidden />
            <p className="font-semibold text-slate-900 dark:text-slate-50">
              Impossible de charger les candidats
            </p>
            <Button
              variant="outline"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="h-9 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = data.stats;
  const total = stats.total ?? 0;
  const totalCandidats = data.candidats.length;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
      >
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
        Retour
      </Button>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl">
            Sélection des candidats
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Users className="h-4 w-4" aria-hidden />
            Session{' '}
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-50">
              {data.session?.codeSession ?? data.codeSession ?? sessionId.slice(0, 8)}
            </span>
            <span>
              • {totalCandidats} candidat{totalCandidats > 1 ? 's' : ''}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setResetOpen(true)}
            disabled={resetMutation.isPending}
            className={cn(
              'h-9 rounded-lg border-slate-200 bg-white font-medium',
              'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
              'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
            )}
          >
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
            Reset
          </Button>
          <AutoSelectionDialog sessionId={sessionId} />
        </div>
      </header>

      <SelectionStats sessionId={sessionId} stats={stats} />

      <Card className="overflow-hidden border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
              <Users className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                {filteredCandidats.length} candidat
                {filteredCandidats.length > 1 ? 's' : ''}
                {totalCandidats !== filteredCandidats.length && (
                  <span className="ml-1 font-normal text-slate-500 dark:text-slate-400">
                    (sur {totalCandidats})
                  </span>
                )}
              </h2>
              {selected.length > 0 && (
                <p className="mt-0.5 text-xs font-medium text-slate-900 dark:text-slate-50">
                  • {selected.length} sélectionné{selected.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-48 pl-9 pr-8 text-xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-50"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" aria-hidden />
              <Select value={filterStatut} onValueChange={setFilterStatut}>
                <SelectTrigger className="h-9 w-[160px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous ({total})</SelectItem>
                  <SelectItem value="EN_ATTENTE">
                    En attente ({stats.enAttente})
                  </SelectItem>
                  <SelectItem value="ACCEPTEE">
                    Acceptés ({stats.acceptees ?? stats.acceptes ?? 0})
                  </SelectItem>
                  <SelectItem value="REFUSEE">
                    Refusés ({stats.refusees ?? stats.refuses ?? 0})
                  </SelectItem>
                  {(stats.listeAttente ?? 0) > 0 && (
                    <SelectItem value="LISTE_ATTENTE">
                      Liste d&apos;attente ({stats.listeAttente})
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {selected.length > 0 && (
          <div className="border-b border-slate-200 dark:border-slate-800">
            <SelectionActions
              sessionId={sessionId}
              selected={selected}
              onDone={() => setSelected([])}
              onClear={() => setSelected([])}
            />
          </div>
        )}

        <div className="p-0">
          {filteredCandidats.length === 0 ? (
            <div className="p-8 text-center">
              <Users
                className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600"
                aria-hidden
              />
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                {search || filterStatut !== 'all'
                  ? 'Aucun candidat ne correspond aux filtres'
                  : 'Aucun candidat'}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {totalCandidats > 0
                  ? `${totalCandidats} candidat(s) chargé(s) mais filtré(s) — Essayez de réinitialiser les filtres.`
                  : 'Aucune inscription pour cette session.'}
              </p>
            </div>
          ) : (
            <CandidatsTable
              candidats={filteredCandidats}
              selected={selected}
              onSelectionChange={setSelected}
            />
          )}
        </div>
      </Card>

      {/* ── Dialog reset ───────────────────────────────── */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-50">
              <RotateCcw
                className="h-5 w-5 text-amber-600 dark:text-amber-400"
                aria-hidden
              />
              Réinitialiser toutes les sélections ?
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Tous les candidats acceptés, refusés ou en liste d&apos;attente
              reviendront au statut <strong>En attente</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:ring-amber-500/30">
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300"
              aria-hidden
            />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {total} candidat{total > 1 ? 's' : ''} seront réinitialisés.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setResetOpen(false)}
              className="h-9 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Annuler
            </Button>
            <Button
              onClick={() => resetMutation.mutate()}
              disabled={resetMutation.isPending}
              className="h-9 rounded-lg bg-red-600 font-medium text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              {resetMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
              )}
              Réinitialiser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}