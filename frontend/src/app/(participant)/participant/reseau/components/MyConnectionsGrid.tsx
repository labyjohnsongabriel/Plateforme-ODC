'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, MapPin, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { getInitials } from '@/lib/utils';

export function MyConnectionsGrid() {
  const { data, isLoading } = useQuery({
    queryKey: ['participant', 'reseau', 'connexions'],
    queryFn: async () => {
      const { data } = await api.get('/participant/reseau/connections');
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
      </div>
    );
  }

  const connections = data ?? [];

  if (!connections.length) {
    return (
      <Card>
        <EmptyState
          icon={Users}
          title="Aucune connexion"
          description="Explorez l'annuaire pour agrandir votre réseau."
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {connections.map((c: any) => (
        <Card key={c.id} className="hover:shadow-odc-md transition-shadow">
          <CardContent className="p-5 text-center">
            <Avatar className="h-14 w-14 mx-auto mb-3">
              <AvatarImage src={c.photoUrl ?? undefined} />
              <AvatarFallback className="bg-odc-primary-soft text-odc-primary font-display font-bold">
                {getInitials(c.nom, c.prenom)}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-display font-semibold mb-1">
              {c.prenom} {c.nom}
            </h3>
            <p className="text-xs text-odc-muted mb-3">
              {c.role?.libelle ?? c.role?.nom}
            </p>
            <div className="space-y-1 text-xs text-odc-muted">
              {c.ville && (
                <div className="flex items-center justify-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  {c.ville}
                </div>
              )}
              {c.entreprise && (
                <div className="flex items-center justify-center gap-1.5">
                  <Building2 className="h-3 w-3" />
                  {c.entreprise}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}