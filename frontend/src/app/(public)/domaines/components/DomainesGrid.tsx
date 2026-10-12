'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, FolderTree } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDomainesPublic } from '@/hooks/queries/useDomaines';

export function DomainesGrid() {
  const { data: domaines = [], isLoading } = useDomainesPublic();

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (!domaines.length) {
    return (
      <EmptyState
        icon={FolderTree}
        title="Aucun domaine disponible"
        description="Les domaines de formation seront publiés prochainement."
      />
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {domaines.map((d, i) => (
        <Card
          key={d.id}
          className="group overflow-hidden hover:-translate-y-1 hover:shadow-odc-lg transition-all animate-fade-in"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Link href={`/domaines/${d.slug}`}>
            <CardContent className="p-6">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                style={{
                  backgroundColor: d.couleur
                    ? `${d.couleur}20`
                    : 'var(--odc-primary-soft)',
                }}
              >
                {d.imageUrl ? (
                  <Image
                    src={d.imageUrl}
                    alt={d.nom}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-3xl">📚</span>
                )}
              </div>

              <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-odc-primary transition-colors">
                {d.nom}
              </h3>

              <p className="text-sm text-odc-muted line-clamp-2 mb-4">
                {d.description || `Découvrez nos formations en ${d.nom}.`}
              </p>

              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-odc-primary group-hover:gap-2.5 transition-all">
                Voir les formations
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}