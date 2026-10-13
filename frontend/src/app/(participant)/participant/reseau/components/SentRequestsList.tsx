'use client';

import { useQuery } from '@tanstack/react-query';
import { Clock, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/formatters';

export function SentRequestsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['participant', 'reseau', 'demandes', 'envoyees'],
    queryFn: async () => {
      const { data } = await api.get('/participant/reseau/demandes/envoyees');
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }

  const requests = data ?? [];

  if (!requests.length) {
    return (
      <Card>
        <EmptyState
          icon={Send}
          title="Aucune demande envoyée"
          description="Vous n'avez envoyé aucune demande en attente."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((r: any) => {
        const user = r.destinataire;
        return (
          <Card key={r.id}>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={user?.photoUrl ?? undefined} />
                  <AvatarFallback className="bg-odc-primary-soft text-odc-primary font-display font-bold">
                    {getInitials(user?.nom ?? '', user?.prenom ?? '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-xs text-odc-muted">
                    {user?.role?.libelle ?? user?.role?.nom}
                  </p>
                  <p className="text-[10px] text-odc-muted mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Envoyée {formatRelativeTime(r.createdAt)}
                  </p>
                </div>
                <Badge className="bg-odc-warning-bg text-odc-warning text-xs shrink-0">
                  En attente
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}