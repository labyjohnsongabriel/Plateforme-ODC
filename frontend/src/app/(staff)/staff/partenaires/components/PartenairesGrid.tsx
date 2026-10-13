'use client';

import { useQuery } from '@tanstack/react-query';
import { Building2, Globe, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';

export function PartenairesGrid() {
  const { data, isLoading } = useQuery({
    queryKey: ['staff', 'partenaires'],
    queryFn: async () => {
      const { data } = await api.get('/staff/partenaires', { params: { limit: 100 } });
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
      </div>
    );
  }

  const partenaires = data ?? [];

  if (!partenaires.length) {
    return <Card><EmptyState icon={Building2} title="Aucun partenaire" /></Card>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {partenaires.map((p: any) => (
        <Card key={p.id} className="hover:shadow-odc-md transition-shadow">
          <CardContent className="p-5 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-lg bg-odc-surface-alt flex items-center justify-center overflow-hidden">
              {p.logoUrl ? (
                <img src={p.logoUrl} alt="" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="h-8 w-8 text-odc-muted" />
              )}
            </div>
            <h3 className="font-display font-semibold mb-1">{p.nom}</h3>
            {p.secteur && (
              <p className="text-xs text-odc-muted mb-3">{p.secteur}</p>
            )}

            <div className="flex flex-col gap-1.5 text-xs text-odc-muted">
              {p.contactEmail && (
                <a
                  href={`mailto:${p.contactEmail}`}
                  className="flex items-center justify-center gap-1.5 hover:text-odc-primary"
                >
                  <Mail className="h-3 w-3" /> {p.contactEmail}
                </a>
              )}
              {p.siteWeb && (
                <a
                  href={p.siteWeb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 hover:text-odc-primary"
                >
                  <Globe className="h-3 w-3" /> Site web
                </a>
              )}
            </div>

            {!p.estPubliee && (
              <Badge variant="outline" className="mt-3 text-xs">Brouillon</Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}