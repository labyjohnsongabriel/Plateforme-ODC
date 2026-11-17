// src/app/(participant)/participant/reseau/demandes/components/SentRequestsList.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Clock,
  Send,
  Search,
  X,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { api } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/formatters';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface SentRequest {
  id: string;
  createdAt: string;
  message?: string | null;
  statut?: string;
  destinataire?: {
    id: string;
    prenom?: string | null;
    nom?: string | null;
    photoUrl?: string | null;
    role?: { nom?: string; libelle?: string } | null;
  } | null;
}

function extractRequests(data: unknown): SentRequest[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as SentRequest[];
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['demandes', 'requests', 'data', 'items']) {
      if (Array.isArray(obj[key])) return obj[key] as SentRequest[];
    }
  }
  return [];
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function SentRequestsList() {
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch, isFetching } = useQuery<SentRequest[]>({
    queryKey: ['participant', 'reseau', 'demandes', 'envoyees'],
    queryFn: async () => {
      const response = await api.get('/participant/reseau/demandes/envoyees');
      return extractRequests(response.data?.data ?? response.data);
    },
    staleTime: 30_000,
  });

  const requests = data ?? [];

  /* ─── Filtrage ─── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r) => {
      const u = r.destinataire;
      return (
        `${u?.prenom ?? ''} ${u?.nom ?? ''}`.toLowerCase().includes(q) ||
        (u?.role?.libelle ?? u?.role?.nom ?? '').toLowerCase().includes(q)
      );
    });
  }, [requests, search]);

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  /* ─── Erreur ─── */
  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <QueryErrorState
            onRetry={() => void refetch()}
            isRetrying={isFetching}
          />
        </CardContent>
      </Card>
    );
  }

  /* ─── Vide global ─── */
  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            icon={Send}
            title="Aucune demande envoyée"
            description="Vous n'avez envoyé aucune demande en attente."
            action={
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/participant/reseau/annuaire">
                  Parcourir l&apos;annuaire
                </Link>
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  /* ─── Rendu principal ─── */
  return (
    <div className="space-y-4">
      {/* Recherche + compteur */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 sm:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Rechercher un destinataire…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8"
            aria-label="Rechercher un destinataire"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span>{' '}
          demande{filtered.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Grille ou empty filtré */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Search}
              title="Aucun résultat"
              description={`Aucune demande ne correspond à "${search}"`}
              action={
                <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                  Réinitialiser
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <SentRequestCard key={r.id} request={r} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CARTE DEMANDE ENVOYÉE
   ═══════════════════════════════════════════════════════════════════════════ */

function SentRequestCard({ request: r }: { request: SentRequest }) {
  const [imageError, setImageError] = useState(false);
  const user = r.destinataire;
  const roleLabel = user?.role?.libelle ?? user?.role?.nom ?? 'Membre';
  const initials = getInitials(user?.nom ?? '', user?.prenom ?? '');

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 shrink-0 ring-2 ring-background">
            {user?.photoUrl && !imageError ? (
              <AvatarImage
                src={user.photoUrl}
                alt=""
                onError={() => setImageError(true)}
              />
            ) : null}
            <AvatarFallback className="bg-primary/10 font-display font-bold text-primary dark:bg-primary/15">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-semibold text-foreground">
              {user?.prenom ?? ''} {user?.nom ?? ''}
            </p>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
            <p className="mt-1 flex items-center gap-1 text-[10px] tabular-nums text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden="true" />
              Envoyée {formatRelativeTime(r.createdAt)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge className="border border-amber-200 bg-amber-50 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              <Clock className="mr-1 h-3 w-3" aria-hidden="true" />
              En attente
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
              asChild
              aria-label={`Voir le profil de ${user?.prenom ?? ''} ${user?.nom ?? ''}`}
            >
              <Link href={`/participant/reseau/profil/${user?.id}`}>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        {r.message && (
          <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
            <p className="line-clamp-2 text-xs italic text-muted-foreground">
              « {r.message} »
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}