// src/app/(participant)/participant/reseau/suggestions/components/SuggestionsGrid.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { MemberCard } from '@/components/reseau/MemberCard';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface SuggestionUser {
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

function extractSuggestions(data: unknown): SuggestionUser[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as SuggestionUser[];
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['suggestions', 'users', 'data', 'items']) {
      if (Array.isArray(obj[key])) return obj[key] as SuggestionUser[];
    }
  }
  return [];
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function SuggestionsGrid() {
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery<SuggestionUser[]>({
    queryKey: ['participant', 'reseau', 'suggestions'],
    queryFn: async () => {
      const response = await api.get('/participant/reseau/suggestions', {
        params: { limit: 12 },
      });
      return extractSuggestions(response.data?.data ?? response.data);
    },
    staleTime: 60_000,
  });

  const connectMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.post(`/participant/reseau/demandes/${userId}`, {
        message: 'Bonjour, je souhaite rejoindre votre réseau.',
      });
      return userId;
    },
    onSuccess: () => {
      toast.success('Demande de connexion envoyée');
      qc.invalidateQueries({ queryKey: ['participant', 'reseau'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
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

  const suggestions = data ?? [];

  /* ─── Vide ─── */
  if (suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            icon={Sparkles}
            title="Aucune suggestion"
            description="Vous êtes déjà connecté à tous les membres disponibles."
          />
        </CardContent>
      </Card>
    );
  }

  /* ─── Rendu principal ─── */
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {suggestions.map((u) => (
        <MemberCard
          key={u.id}
          user={u}
          onConnect={() => connectMutation.mutate(u.id)}
          isConnecting={
            connectMutation.isPending && connectMutation.variables === u.id
          }
        />
      ))}
    </div>
  );
}