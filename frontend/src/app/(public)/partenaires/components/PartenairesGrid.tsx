'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Building2, Globe, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { usePartenairesPublic } from '@/hooks/queries/usePartenaires';

export function PartenairesGrid() {
  const { data, isLoading } = usePartenairesPublic();

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56" />
        ))}
      </div>
    );
  }

  const partenaires = data?.data ?? [];

  if (!partenaires.length) {
    return (
      <EmptyState
        icon={Building2}
        title="Aucun partenaire"
        description="Les partenaires seront publiés prochainement."
      />
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {partenaires.map((p, i) => (
        <Card
          key={p.id}
          className="group hover:-translate-y-1 hover:shadow-odc-lg transition-all animate-fade-in"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <CardContent className="p-6 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-xl bg-odc-surface-alt flex items-center justify-center overflow-hidden">
              {p.logoUrl ? (
                <Image
                  src={p.logoUrl}
                  alt={p.nom}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              ) : (
                <Building2 className="h-10 w-10 text-odc-muted" />
              )}
            </div>

            <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-odc-primary transition-colors">
              {p.nom}
            </h3>

            {p.secteur && <p className="text-xs text-odc-muted mb-3">{p.secteur}</p>}

            {p.description && (
              <p className="text-sm text-odc-muted line-clamp-2 mb-4">
                {p.description}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/partenaires/${p.slug}`}>
                  Voir le profil
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </Button>
              {p.siteWeb && (
                <a
                  href={p.siteWeb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-odc-primary hover:underline flex items-center justify-center gap-1"
                >
                  <Globe className="h-3 w-3" />
                  Visiter le site
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}