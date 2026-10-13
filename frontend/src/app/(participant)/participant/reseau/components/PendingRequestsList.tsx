'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConnectionRequestCard } from './ConnectionRequestCard';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

export function PendingRequestsList() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['participant', 'reseau', 'demandes', 'en-attente'],
    queryFn: async () => {
      const { data } = await api.get('/participant/reseau/demandes/en-attente');
      return data.data;
    },
  });

  const repondreMutation = useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: 'ACCEPTEE' | 'REFUSEE' }) => {
      await api.put(`/participant/reseau/demandes/${id}`, { statut });
    },
    onSuccess: (_, vars) => {
      toast.success(
        vars.statut === 'ACCEPTEE' ? 'Connexion acceptée' : 'Demande refusée',
      );
      qc.invalidateQueries({ queryKey: ['participant', 'reseau'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
      </div>
    );
  }

  const requests = data ?? [];

  if (!requests.length) {
    return (
      <Card>
        <EmptyState
          icon={Users}
          title="Aucune demande en attente"
          description="Vous n'avez aucune demande de connexion en attente."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((r: any) => (
        <ConnectionRequestCard
          key={r.id}
          request={r}
          onAccept={() => repondreMutation.mutate({ id: r.id, statut: 'ACCEPTEE' })}
          onRefuse={() => repondreMutation.mutate({ id: r.id, statut: 'REFUSEE' })}
          isLoading={repondreMutation.isPending}
        />
      ))}
    </div>
  );
}