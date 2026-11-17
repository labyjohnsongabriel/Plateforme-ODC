// src/app/(participant)/participant/reseau/annuaire/components/DirectoryGrid.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Users, Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { Pagination } from '@/components/shared/Pagination';
import { MemberCard } from './MemberCard';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

interface DirectoryUser {
  id: string;
  prenom?: string | null;
  nom?: string | null;
  photoUrl?: string | null;
  ville?: string | null;
  entreprise?: string | null;
  role?: { nom?: string; libelle?: string } | null;
  isConnected?: boolean;
  hasPendingRequest?: boolean;
}

interface DirectoryResponse {
  data: DirectoryUser[];
  pagination?: { page: number; totalPages: number; total?: number };
}

function extractDirectory(response: unknown): DirectoryResponse {
  if (!response || typeof response !== 'object') return { data: [] };
  const r = response as Record<string, unknown>;
  const root = (r.data ?? r) as Record<string, unknown>;

  const rawList =
    (Array.isArray(root.users) && root.users) ||
    (Array.isArray(root.data) && root.data) ||
    (Array.isArray(root.items) && root.items) ||
    (Array.isArray(root) && root) ||
    [];

  return {
    data: (rawList as unknown[]).filter(
      (u): u is DirectoryUser => u != null && typeof u === 'object' && 'id' in u,
    ),
    pagination: (root.pagination as DirectoryResponse['pagination']) ?? undefined,
  };
}

export function DirectoryGrid() {
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
    q: searchParams.get('q') ?? undefined,
    role: searchParams.get('role') ?? undefined,
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery<DirectoryResponse>({
    queryKey: ['participant', 'annuaire', filters],
    queryFn: async () => {
      const response = await api.get('/participant/reseau/annuaire', {
        params: filters,
      });
      return extractDirectory(response.data);
    },
    staleTime: 30_000,
  });

  const connectMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.post(`/participant/reseau/demandes/${userId}`, {
        message: 'Bonjour, je souhaite rejoindre votre réseau.',
      });
    },
    onSuccess: () => {
      toast.success('Demande de connexion envoyée');
      qc.invalidateQueries({ queryKey: ['participant', 'annuaire'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const users = data?.data ?? [];
  const hasFilters = !!searchParams.get('q') || !!searchParams.get('role');

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
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

  /* ─── Vide ─── */
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            icon={hasFilters ? Search : Users}
            title={
              hasFilters ? 'Aucun résultat' : 'Aucun membre trouvé'
            }
            description={
              hasFilters
                ? 'Essayez de modifier vos filtres.'
                : "L'annuaire est vide pour le moment."
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u) => (
          <MemberCard
            key={u.id}
            user={u}
            onConnect={() => connectMutation.mutate(u.id)}
            isConnecting={
              connectMutation.isPending &&
              connectMutation.variables === u.id
            }
          />
        ))}
      </div>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
          />
        </div>
      )}
    </>
  );
}