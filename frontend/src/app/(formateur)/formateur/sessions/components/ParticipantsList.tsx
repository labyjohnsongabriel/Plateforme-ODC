// src/app/(formateur)/formateur/sessions/[id]/ParticipantsList.tsx
'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Users,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  UserCheck,
  UserX,
  Search,
  Filter,
  Download,
  X,
  ChevronDown,
  ChevronUp,
  Bug,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { getErrorMessage } from '@/lib/error-handler';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

type InscriptionStatut = 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'ANNULEE';

interface Participant {
  id: string;
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
  telephone?: string | null;
  photoUrl?: string | null;
  statut?: InscriptionStatut | string | null;
  inscriptionId?: string | null;
  dateInscription?: string | null;
  presence?: {
    present?: boolean;
    statut?: string;
  } | null;
}

interface ParticipantsResponse {
  participants: Participant[];
  capacite?: number;
  acceptesCount?: number;
  raw: unknown;
}

interface Props {
  sessionId: string;
  capacite?: number;
}

type FilterStatut = 'all' | 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';

/* ═══════════════════════════════════════════════════════════════════════════
   EXTRACTION ULTRA-ROBUSTE
   ═══════════════════════════════════════════════════════════════════════════ */

function normalizeStatut(s: string | null | undefined): string {
  if (!s) return 'EN_ATTENTE';
  const upper = String(s).toUpperCase();
  if (upper === 'ACCEPTE' || upper === 'ACCEPTED') return 'ACCEPTEE';
  if (upper === 'REFUSE' || upper === 'REFUSED') return 'REFUSEE';
  if (upper === 'ATTENTE' || upper === 'PENDING') return 'EN_ATTENTE';
  if (upper === 'ANNULE' || upper === 'CANCELLED') return 'ANNULEE';
  return upper;
}

function normalizeParticipant(raw: any): Participant | null {
  if (!raw || typeof raw !== 'object') return null;

  const id = raw.id ?? raw.participantId ?? raw.userId;
  if (!id) return null;

  const p = raw.participant ?? raw.user ?? raw;
  const prenom = p.prenom ?? p.firstName ?? '';
  const nom = p.nom ?? p.lastName ?? '';

  const statut = normalizeStatut(
    raw.statut ??
      raw.status ??
      raw.inscriptionStatut ??
      raw.inscription?.statut ??
      raw.inscription?.status ??
      p.statut,
  );

  const inscriptionId =
    raw.inscriptionId ??
    raw.inscription_id ??
    raw.inscription?.id ??
    (raw.statut ? raw.id : null);

  // Présence (si le backend la renvoie)
  const presenceRaw = raw.presence ?? p.presence ?? null;
  const presence = presenceRaw
    ? {
        present: presenceRaw.present === true || presenceRaw.statut === 'PRESENT',
        statut: presenceRaw.statut,
      }
    : null;

  return {
    id: String(id),
    prenom,
    nom,
    email: p.email ?? p.mail ?? '',
    telephone: p.telephone ?? p.phone ?? p.tel ?? null,
    photoUrl: p.photoUrl ?? p.photo ?? p.avatarUrl ?? null,
    statut,
    inscriptionId: inscriptionId ? String(inscriptionId) : null,
    dateInscription: raw.dateInscription ?? raw.createdAt ?? null,
    presence,
  };
}

function extractParticipants(data: unknown): ParticipantsResponse {
  if (!data) return { participants: [], raw: data };

  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.log('🔍 [ParticipantsList] API response:', data);
  }

  if (typeof data === 'object' && !Array.isArray(data)) {
    const obj = data as Record<string, any>;

    const candidates = [
      obj.participants,
      obj.inscriptions,
      obj.users,
      obj.items,
      obj.results,
      obj.data,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        const participants = candidate
          .map(normalizeParticipant)
          .filter((p): p is Participant => p !== null);

        return {
          participants,
          capacite: Number(obj.capacite ?? obj.capacity) || undefined,
          acceptesCount: Number(obj.acceptesCount ?? obj.acceptedCount) || undefined,
          raw: data,
        };
      }

      if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
        for (const key of ['participants', 'inscriptions', 'users', 'items', 'results']) {
          const arr = (candidate as any)[key];
          if (Array.isArray(arr)) {
            const participants = arr
              .map(normalizeParticipant)
              .filter((p): p is Participant => p !== null);
            return {
              participants,
              capacite: Number((candidate as any).capacite) || undefined,
              acceptesCount: Number((candidate as any).acceptesCount) || undefined,
              raw: data,
            };
          }
        }
      }
    }
  }

  if (Array.isArray(data)) {
    const participants = data
      .map(normalizeParticipant)
      .filter((p): p is Participant => p !== null);
    return { participants, raw: data };
  }

  return { participants: [], raw: data };
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function ParticipantsList({ sessionId, capacite = 0 }: Props) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<FilterStatut>('all');
  const [showRefusees, setShowRefusees] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  /* ─── Query ─── */
  const { data, isLoading, isError, refetch, isFetching, error } =
    useQuery<ParticipantsResponse>({
      queryKey: ['formateur', 'session', sessionId, 'participants'],
      queryFn: async () => {
        if (!sessionId) throw new Error('sessionId manquant');
        const response = await api.get(
          `/formateur/sessions/${sessionId}/participants`,
        );
        return extractParticipants(response.data?.data ?? response.data);
      },
      enabled: !!sessionId,
      staleTime: 30_000,
      retry: 1,
    });

  /* ─── Mutations ─── */
  const acceptMutation = useMutation({
    mutationFn: async (inscriptionId: string) => {
      await api.put(`/inscriptions/${inscriptionId}/accepter`);
    },
    onSuccess: () => {
      toast.success('Inscription acceptée');
      qc.invalidateQueries({
        queryKey: ['formateur', 'session', sessionId, 'participants'],
      });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const refuseMutation = useMutation({
    mutationFn: async (inscriptionId: string) => {
      await api.put(`/inscriptions/${inscriptionId}/refuser`);
    },
    onSuccess: () => {
      toast.success('Inscription refusée');
      qc.invalidateQueries({
        queryKey: ['formateur', 'session', sessionId, 'participants'],
      });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ─── Données ─── */
  const participants = data?.participants ?? [];
  const totalCapacite = data?.capacite ?? capacite;

  const enAttente = useMemo(
    () => participants.filter((p) => p.statut === 'EN_ATTENTE'),
    [participants],
  );
  const acceptes = useMemo(
    () => participants.filter((p) => p.statut === 'ACCEPTEE'),
    [participants],
  );
  const refusees = useMemo(
    () => participants.filter((p) => p.statut === 'REFUSEE'),
    [participants],
  );

  /* ─── Filtrage ─── */
  const filterBySearch = (list: Participant[]) => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        `${p.prenom ?? ''} ${p.nom ?? ''}`.toLowerCase().includes(q) ||
        (p.email ?? '').toLowerCase().includes(q),
    );
  };

  const filteredEnAttente = filterBySearch(enAttente);
  const filteredAcceptes = filterBySearch(acceptes);
  const filteredRefusees = filterBySearch(refusees);

  const hasAnyFilter = search.trim() !== '' || filterStatut !== 'all';

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  /* ─── Erreur ─── */
  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground">
            Impossible de charger les participants
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">
            {getErrorMessage(error)}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            {isFetching && (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            )}
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* ─── Rendu principal ─── */
  return (
    <div className="space-y-4">
      {/* Barre de contrôles */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {participants.length}
                {totalCapacite > 0 && (
                  <span className="font-normal text-muted-foreground">
                    {' '}/ {totalCapacite} places
                  </span>
                )}
              </span>
              {enAttente.length > 0 && (
                <Badge
                  variant="outline"
                  className="border-amber-300/60 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                >
                  <Clock className="mr-1 h-3 w-3" aria-hidden="true" />
                  {enAttente.length} en attente
                </Badge>
              )}
              {acceptes.length > 0 && (
                <Badge
                  variant="outline"
                  className="border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" />
                  {acceptes.length} acceptés
                </Badge>
              )}
              {refusees.length > 0 && (
                <Badge
                  variant="outline"
                  className="border-red-300/60 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                >
                  <XCircle className="mr-1 h-3 w-3" aria-hidden="true" />
                  {refusees.length} refusés
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(participants, sessionId)}
              disabled={participants.length === 0}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Exporter CSV
            </Button>
          </div>

          {/* Recherche + filtre */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px] flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Rechercher (nom, email)…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 pr-8 text-xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <Select
                value={filterStatut}
                onValueChange={(v) => setFilterStatut(v as FilterStatut)}
              >
                <SelectTrigger className="h-9 w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous ({participants.length})</SelectItem>
                  <SelectItem value="EN_ATTENTE">En attente ({enAttente.length})</SelectItem>
                  <SelectItem value="ACCEPTEE">Acceptés ({acceptes.length})</SelectItem>
                  <SelectItem value="REFUSEE">Refusés ({refusees.length})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasAnyFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setFilterStatut('all');
                }}
                className="h-9 text-xs text-muted-foreground hover:text-foreground"
              >
                Réinitialiser
              </Button>
            )}
          </div>

          {process.env.NODE_ENV !== 'production' && (
            <button
              type="button"
              onClick={() => setShowDebug((v) => !v)}
              className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <Bug className="h-3 w-3" aria-hidden="true" />
              {showDebug ? 'Masquer' : 'Voir'} la réponse API brute
            </button>
          )}
        </CardContent>
      </Card>

      {/* Debug panel */}
      {showDebug && process.env.NODE_ENV !== 'production' && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-2 text-xs font-semibold text-foreground">
              🔍 Réponse API brute :
            </p>
            <pre className="max-h-64 overflow-auto rounded bg-muted p-3 text-[10px]">
              {JSON.stringify(data?.raw, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* ─── En attente ─── */}
      {(filterStatut === 'all' || filterStatut === 'EN_ATTENTE') &&
        filteredEnAttente.length > 0 && (
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50/50 px-5 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
                <Clock className="h-4 w-4" aria-hidden="true" />
                En attente de validation
              </h3>
              <Badge
                variant="outline"
                className="border-amber-300/60 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
              >
                {filteredEnAttente.length}
              </Badge>
            </div>
            <ul className="divide-y divide-border">
              {filteredEnAttente.map((p) => {
                const isAccepting =
                  acceptMutation.isPending &&
                  acceptMutation.variables === p.inscriptionId;
                const isRefusing =
                  refuseMutation.isPending &&
                  refuseMutation.variables === p.inscriptionId;
                const canAccept =
                  !isAccepting &&
                  !isRefusing &&
                  !!p.inscriptionId &&
                  (totalCapacite === 0 || acceptes.length < totalCapacite);

                return (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center gap-3 p-4 transition-colors hover:bg-amber-50/30 dark:hover:bg-amber-500/5"
                  >
                    <Avatar className="h-11 w-11 shrink-0 ring-2 ring-background">
                      <AvatarImage src={p.photoUrl ?? undefined} alt="" />
                      <AvatarFallback className="bg-amber-100 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                        {getInitials(p.nom ?? '', p.prenom ?? '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {p.prenom || '(sans prénom)'} {p.nom || '(sans nom)'}
                      </p>
                      {p.email && (
                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span className="truncate">{p.email}</span>
                        </p>
                      )}
                      {p.telephone && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
                          {p.telephone}
                        </p>
                      )}
                      {p.dateInscription && (
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Inscrit le {formatDate(p.dateInscription)}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          p.inscriptionId && refuseMutation.mutate(p.inscriptionId)
                        }
                        disabled={!p.inscriptionId || isAccepting || isRefusing}
                      >
                        {isRefusing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <>
                            <UserX className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                            Refuser
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          p.inscriptionId && acceptMutation.mutate(p.inscriptionId)
                        }
                        disabled={!canAccept}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        title={
                          totalCapacite > 0 && acceptes.length >= totalCapacite
                            ? 'Session complète'
                            : undefined
                        }
                      >
                        {isAccepting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <>
                            <UserCheck className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                            Accepter
                          </>
                        )}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}

      {/* ─── Acceptés (enrichi) ─── */}
      {(filterStatut === 'all' || filterStatut === 'ACCEPTEE') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2
                className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
              Participants acceptés
              <Badge
                variant="outline"
                className="ml-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
              >
                {filteredAcceptes.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredAcceptes.length === 0 ? (
              <EmptyState
                icon={Users}
                title={
                  hasAnyFilter
                    ? 'Aucun participant ne correspond aux filtres'
                    : 'Aucun participant accepté'
                }
                description={
                  hasAnyFilter
                    ? 'Essayez de modifier votre recherche.'
                    : 'Les acceptés apparaîtront ici.'
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {filteredAcceptes.map((p) => (
                  <AcceptedRow key={p.id} participant={p} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Refusés (toggle) ─── */}
      {(filterStatut === 'all' || filterStatut === 'REFUSEE') &&
        filteredRefusees.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Inscriptions refusées
                <Badge variant="outline" className="ml-1">
                  {filteredRefusees.length}
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRefusees((v) => !v)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {showRefusees ? (
                  <>
                    Masquer
                    <ChevronUp className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Afficher
                    <ChevronDown className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                  </>
                )}
              </Button>
            </CardHeader>
            {showRefusees && (
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {filteredRefusees.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 p-3 opacity-70 transition-opacity hover:opacity-100"
                    >
                      <Avatar className="h-9 w-9 shrink-0 ring-2 ring-background">
                        <AvatarImage src={p.photoUrl ?? undefined} alt="" />
                        <AvatarFallback className="bg-red-100 text-xs text-red-700 dark:bg-red-500/15 dark:text-red-300">
                          {getInitials(p.nom ?? '', p.prenom ?? '')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground">
                          {p.prenom || '(sans prénom)'} {p.nom || '(sans nom)'}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {p.email ?? '—'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          p.inscriptionId && acceptMutation.mutate(p.inscriptionId)
                        }
                        disabled={
                          !p.inscriptionId ||
                          acceptMutation.isPending ||
                          (totalCapacite > 0 && acceptes.length >= totalCapacite)
                        }
                      >
                        {acceptMutation.isPending &&
                        acceptMutation.variables === p.inscriptionId ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <>
                            <UserCheck className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                            Réintégrer
                          </>
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        )}

      {/* ─── Aucun résultat (filtre) ─── */}
      {hasAnyFilter &&
        filteredEnAttente.length === 0 &&
        filteredAcceptes.length === 0 &&
        filteredRefusees.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={Search}
                title="Aucun résultat"
                description={`Aucun participant ne correspond à "${search}"`}
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearch('');
                      setFilterStatut('all');
                    }}
                  >
                    Réinitialiser la recherche
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}

      {/* ─── Aucun participant (global) ─── */}
      {participants.length === 0 && !hasAnyFilter && (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Users}
              title="Aucun participant"
              description="Aucune inscription pour cette session."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROW — Participant accepté (enrichi)
   ═══════════════════════════════════════════════════════════════════════════ */

function AcceptedRow({ participant: p }: { participant: Participant }) {
  const [imageError, setImageError] = useState(false);
  const isPresent = p.presence?.present === true;
  const initials = getInitials(p.nom ?? '', p.prenom ?? '');

  return (
    <li className="group flex items-center gap-3 p-4 transition-colors hover:bg-accent/30">
      {/* Avatar + point présence */}
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10 ring-2 ring-background">
          {p.photoUrl && !imageError ? (
            <AvatarImage
              src={p.photoUrl}
              alt=""
              onError={() => setImageError(true)}
            />
          ) : null}
          <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            {initials}
          </AvatarFallback>
        </Avatar>

        {isPresent && (
          <span
            className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-background bg-emerald-500"
            title="Présent"
            aria-label="Présent"
          >
            <CheckCircle2 className="h-2 w-2 text-white" aria-hidden="true" />
          </span>
        )}
      </div>

      {/* Infos */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {p.prenom || '(sans prénom)'} {p.nom || '(sans nom)'}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {p.email && (
            <span className="inline-flex items-center gap-1 truncate">
              <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{p.email}</span>
            </span>
          )}
          {p.telephone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
              {p.telephone}
            </span>
          )}
          {p.dateInscription && (
            <span className="inline-flex items-center gap-1 tabular-nums">
              Inscrit le {formatDate(p.dateInscription)}
            </span>
          )}
        </div>
      </div>

      {/* Actions rapides + badge statut */}
      <div className="flex shrink-0 items-center gap-1">
        <TooltipProvider delayDuration={300}>
          {p.email && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  asChild
                >
                  <a
                    href={`mailto:${p.email}`}
                    aria-label={`Envoyer un email à ${p.prenom ?? ''} ${p.nom ?? ''}`}
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Envoyer un email</p>
              </TooltipContent>
            </Tooltip>
          )}

          {p.telephone && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  asChild
                >
                  <a
                    href={`tel:${p.telephone}`}
                    aria-label={`Appeler ${p.prenom ?? ''} ${p.nom ?? ''}`}
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Appeler</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                asChild
              >
                <a
                  href={`/formateur/participants/${p.id}`}
                  aria-label={`Voir le profil de ${p.prenom ?? ''} ${p.nom ?? ''}`}
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Voir le profil</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isPresent ? (
          <Badge className="ml-1 border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" />
            Présent
          </Badge>
        ) : (
          <Badge className="ml-1 border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" />
            Accepté
          </Badge>
        )}
      </div>
    </li>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER — Export CSV
   ═══════════════════════════════════════════════════════════════════════════ */

function exportToCSV(participants: Participant[], sessionId: string) {
  if (!participants.length) {
    toast.error('Aucun participant à exporter');
    return;
  }

  const headers = [
    'Prénom',
    'Nom',
    'Email',
    'Téléphone',
    'Statut',
    'Présent',
    'Inscrit le',
  ];
  const rows = participants.map((p) => [
    p.prenom ?? '',
    p.nom ?? '',
    p.email ?? '',
    p.telephone ?? '',
    p.statut ?? '',
    p.presence?.present ? 'Oui' : 'Non',
    p.dateInscription ? formatDate(p.dateInscription) : '',
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
    )
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `participants-${sessionId.slice(0, 8)}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('Export CSV téléchargé');
}