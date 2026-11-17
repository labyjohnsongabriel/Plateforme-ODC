// src/app/(participant)/participant/reseau/demandes/components/PendingRequestsList.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Users, Search, X, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { ConnectionRequestCard } from './ConnectionRequestCard';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { useMemo, useState } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface ConnectionRequest {
  id: string;
  message?: string | null;
  createdAt: string;
  expediteur?: {
    id: string;
    prenom?: string | null;
    nom?: string | null;
    photoUrl?: string | null;
    ville?: string | null;
    entreprise?: string | null;
    role?: { nom?: string; libelle?: string } | null;
  } | null;
}

function extractRequests(data: unknown): ConnectionRequest[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as ConnectionRequest[];
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['demandes', 'requests', 'data', 'items']) {
      if (Array.isArray(obj[key])) return obj[key] as ConnectionRequest[];
    }
  }
  return [];
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function PendingRequestsList() {
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery<ConnectionRequest[]>({
    queryKey: ['participant', 'reseau', 'demandes', 'en-attente'],
    queryFn: async () => {
      const response = await api.get('/participant/reseau/demandes/en-attente');
      return extractRequests(response.data?.data ?? response.data);
    },
    staleTime: 30_000,
  });

  const repondreMutation = useMutation({
    mutationFn: async ({
      id,
      statut,
    }: {
      id: string;
      statut: 'ACCEPTEE' | 'REFUSEE';
    }) => {
      await api.put(`/participant/reseau/demandes/${id}`, { statut });
      return { id, statut };
    },
    onSuccess: (_, vars) => {
      toast.success(
        vars.statut === 'ACCEPTEE'
          ? 'Connexion acceptée'
          : 'Demande refusée',
      );
      qc.invalidateQueries({ queryKey: ['participant', 'reseau'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
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

  const requests = data ?? [];

  /* ─── Vide ─── */
  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            icon={Users}
            title="Aucune demande en attente"
            description="Vous n'avez aucune demande de connexion en attente."
          />
        </CardContent>
      </Card>
    );
  }

  /* ─── Rendu principal ─── */
  return (
    <div className="space-y-4">
      {/* Compteur */}
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          {requests.length}
        </span>{' '}
        demande{requests.length > 1 ? 's' : ''} en attente
      </p>

      {requests.map((r) => (
        <ConnectionRequestCard
          key={r.id}
          request={r}
          onAccept={() =>
            repondreMutation.mutate({ id: r.id, statut: 'ACCEPTEE' })
          }
          onRefuse={() =>
            repondreMutation.mutate({ id: r.id, statut: 'REFUSEE' })
          }
          isLoading={
            repondreMutation.isPending &&
            repondreMutation.variables?.id === r.id
          }
        />
      ))}
    </div>
  );
}