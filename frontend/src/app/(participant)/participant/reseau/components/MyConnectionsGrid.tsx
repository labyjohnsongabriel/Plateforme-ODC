// src/app/(participant)/participant/reseau/connexions/components/MyConnectionsGrid.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Users,
  MapPin,
  Building2,
  Search,
  X,
  MessageSquare,
  ExternalLink,
  UserMinus,
  Loader2,
  UserPlus,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { ParticipantAvatar } from '@/components/shared/ParticipantAvatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface ConnectionUser {
  id: string;
  prenom?: string | null;
  nom?: string | null;
  photoUrl?: string | null;
  ville?: string | null;
  entreprise?: string | null;
  role?: { nom?: string; libelle?: string } | null;
}

interface ConnectionItem {
  connectionId: string;
  since?: string | null;
  user: ConnectionUser;
}

/* ═══════════════════════════════════════════════════════════════════════════
   NORMALISATION
   ═══════════════════════════════════════════════════════════════════════════ */

function normalizeConnection(raw: any): ConnectionItem | null {
  if (!raw || typeof raw !== 'object') return null;

  if (raw.user && raw.user.id) {
    return {
      connectionId: String(raw.connectionId ?? raw.id ?? ''),
      since: raw.since ?? raw.dateReponse ?? null,
      user: {
        id: String(raw.user.id),
        prenom: raw.user.prenom ?? '',
        nom: raw.user.nom ?? '',
        photoUrl: raw.user.photoUrl ?? null,
        ville: raw.user.ville ?? null,
        entreprise: raw.user.entreprise ?? null,
        role: raw.user.role ?? null,
      },
    };
  }

  if (raw.id && (raw.prenom !== undefined || raw.nom !== undefined)) {
    return {
      connectionId: String(raw.connectionId ?? raw.id),
      since: raw.since ?? null,
      user: {
        id: String(raw.id),
        prenom: raw.prenom ?? '',
        nom: raw.nom ?? '',
        photoUrl: raw.photoUrl ?? null,
        ville: raw.ville ?? null,
        entreprise: raw.entreprise ?? null,
        role: raw.role ?? null,
      },
    };
  }

  return null;
}

function extractConnections(data: unknown): ConnectionItem[] {
  if (!data) return [];
  const arr = Array.isArray(data)
    ? data
    : typeof data === 'object'
      ? (data as Record<string, unknown>).data ??
        (data as Record<string, unknown>).connections ??
        (data as Record<string, unknown>).connexions ??
        (data as Record<string, unknown>).items ??
        []
      : [];

  if (!Array.isArray(arr)) return [];

  return arr
    .map(normalizeConnection)
    .filter((c): c is ConnectionItem => c !== null);
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function MyConnectionsGrid() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ConnectionItem | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useQuery<ConnectionItem[]>({
    queryKey: ['participant', 'reseau', 'connexions'],
    queryFn: async () => {
      const response = await api.get('/participant/reseau/connections');
      return extractConnections(response.data);
    },
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      await api.delete(`/participant/reseau/connections/${connectionId}`);
    },
    onSuccess: () => {
      toast.success('Connexion supprimée');
      qc.invalidateQueries({ queryKey: ['participant', 'reseau', 'connexions'] });
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const connections = data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return connections;

    return connections.filter((c) => {
      const u = c.user;
      return (
        `${u.prenom ?? ''} ${u.nom ?? ''}`.toLowerCase().includes(q) ||
        (u.entreprise ?? '').toLowerCase().includes(q) ||
        (u.ville ?? '').toLowerCase().includes(q) ||
        (u.role?.libelle ?? u.role?.nom ?? '').toLowerCase().includes(q)
      );
    });
  }, [connections, search]);

  /* ── Loading ────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  /* ── Erreur ─────────────────────────────────────────── */
  if (isError) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardContent className="p-6">
          <QueryErrorState
            onRetry={() => void refetch()}
            isRetrying={isFetching}
            description="Impossible de charger vos connexions."
          />
        </CardContent>
      </Card>
    );
  }

  /* ── Vide global ────────────────────────────────────── */
  if (connections.length === 0) {
    return (
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardContent className="p-6">
          <EmptyState
            icon={Users}
            title="Aucune connexion"
            description="Explorez l'annuaire pour agrandir votre réseau."
            action={
              <Button variant="primary" size="md" asChild>
                <Link href="/participant/reseau/annuaire">
                  <UserPlus className="mr-2 h-4 w-4" aria-hidden />
                  Parcourir l&apos;annuaire
                </Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  /* ── Rendu principal ────────────────────────────────── */
  return (
    <div className="space-y-4">
      {/* Recherche + compteur */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Rechercher un contact…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8"
            aria-label="Rechercher une connexion"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-50"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-slate-50">
            {filtered.length}
          </span>{' '}
          connexion{filtered.length > 1 ? 's' : ''}
          {search && connections.length !== filtered.length && (
            <span className="text-slate-400 dark:text-slate-500">
              {' '}
              sur {connections.length}
            </span>
          )}
        </p>
      </div>

      {/* Résultat vide */}
      {filtered.length === 0 ? (
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardContent className="p-6">
            <EmptyState
              icon={Search}
              title="Aucun résultat"
              description={`Aucune connexion ne correspond à "${search}"`}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearch('')}
                  className="h-9 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Réinitialiser
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <ConnectionCard
              key={c.connectionId}
              connection={c}
              onDelete={() => setDeleteTarget(c)}
            />
          ))}
        </div>
      )}

      {/* Dialog suppression */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-50">
              Retirer {deleteTarget?.user.prenom ?? ''}{' '}
              {deleteTarget?.user.nom ?? ''} de vos connexions ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              Cette personne sera retirée de votre réseau. Elle ne pourra plus
              vous contacter via la plateforme tant que vous ne serez pas
              reconnectés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              className="h-9 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-9 rounded-lg bg-red-600 font-medium text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deleteTarget) deleteMutation.mutate(deleteTarget.connectionId);
              }}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              )}
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CARTE CONNEXION
   ═══════════════════════════════════════════════════════════════════════════ */

function ConnectionCard({
  connection,
  onDelete,
}: {
  connection: ConnectionItem;
  onDelete: () => void;
}) {
  const u = connection.user;
  const roleLabel = u.role?.libelle ?? u.role?.nom ?? 'Membre';

  return (
    <Card
      className={cn(
        'group flex flex-col overflow-hidden transition-all duration-300',
        'border-slate-200 bg-white',
        'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
        'dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700',
      )}
    >
      <CardContent className="flex flex-1 flex-col p-5 text-center">
        {/* Avatar avec photo */}
        <div className="mb-3 flex justify-center">
          <ParticipantAvatar
            prenom={u.prenom}
            nom={u.nom}
            photoUrl={u.photoUrl}
            size="lg"
            className="h-16 w-16 text-base"
          />
        </div>

        {/* Nom + rôle */}
        <h3 className="mb-1 line-clamp-1 font-display font-semibold text-slate-900 dark:text-slate-50">
          {u.prenom ?? ''} {u.nom ?? ''}
        </h3>
        <Badge
          variant="outline"
          className="mx-auto mb-3 border-slate-200 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:text-slate-400"
        >
          {roleLabel}
        </Badge>

        {/* Entreprise + ville */}
        <div className="mb-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
          {u.entreprise && (
            <div className="flex items-center justify-center gap-1.5">
              <Building2 className="h-3 w-3 shrink-0" aria-hidden />
              <span className="truncate">{u.entreprise}</span>
            </div>
          )}
          {u.ville && (
            <div className="flex items-center justify-center gap-1.5">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden />
              <span className="truncate">{u.ville}</span>
            </div>
          )}
        </div>

        {/* Depuis quand */}
        {connection.since && (
          <p className="mb-3 flex items-center justify-center gap-1 text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
            <Clock className="h-3 w-3" aria-hidden />
            Connecté {formatRelativeTime(connection.since)}
          </p>
        )}

        {/* Actions */}
        <div className="mt-auto flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            asChild
            className="h-9 flex-1 rounded-lg"
          >
            <Link href={`/participant/reseau/profil/${u.id}`}>
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Profil
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label={`Envoyer un message à ${u.prenom ?? ''} ${u.nom ?? ''}`}
            className="h-9 w-9 rounded-lg text-slate-400 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
          >
            <Link href={`/messagerie?to=${u.id}`}>
              <MessageSquare className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            aria-label={`Retirer ${u.prenom ?? ''} ${u.nom ?? ''} de mes connexions`}
            className="h-9 w-9 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <UserMinus className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}