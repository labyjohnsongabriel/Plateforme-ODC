'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Sparkles, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { MemberCard } from './MemberCard';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

export function SuggestionsGrid() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['participant', 'reseau', 'suggestions'],
    queryFn: async () => {
      const { data } = await api.get('/participant/reseau/suggestions', {
        params: { limit: 12 },
      });
      return data.data;
    },
  });

  const connectMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.post(`/participant/reseau/demandes/${userId}`, {
        message: 'Bonjour, je souhaite rejoindre votre réseau.',
      });
    },
    onSuccess: () => {
      toast.success('Demande de connexion envoyée');
      qc.invalidateQueries({ queryKey: ['participant', 'reseau', 'suggestions'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
      </div>
    );
  }

  const suggestions = data ?? [];

  if (!suggestions.length) {
    return (
      <Card>
        <EmptyState
          icon={Sparkles}
          title="Aucune suggestion"
          description="Vous êtes déjà connecté à tous les membres disponibles."
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {suggestions.map((u: any) => (
        <MemberCard
          key={u.id}
          user={u}
          onConnect={() => connectMutation.mutate(u.id)}
          isConnecting={connectMutation.isPending}
        />
      ))}
    </div>
  );
}