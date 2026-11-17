'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, FolderTree } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDomainesPublic } from '@/hooks/queries/useDomaines';
import { getMediaUrl } from '@/lib/media';

export function DomainesGrid() {
  const { data: domaines = [], isLoading } = useDomainesPublic();

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {domaines.map((d, i) => (
        <Card
          key={d.id}
          className="group animate-fade-in overflow-hidden transition-all hover:-translate-y-1 hover:shadow-odc-lg"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Link href={`/domaines/${d.slug}`}>
            <CardContent className="p-6">
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: d.couleur
                    ? `${d.couleur}20`
                    : 'var(--odc-primary-soft)',
                }}
              >
                {d.imageUrl ? (
                  <Image
                    src={getMediaUrl(d.imageUrl)!}
                    alt={d.nom}
                    width={40}
                    height={40}
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <span className="text-3xl">📚</span>
                )}
              </div>

              <h3 className="font-display mb-2 text-lg font-semibold transition-colors group-hover:text-odc-primary">
                {d.nom}
              </h3>

              <p className="text-odc-muted mb-4 line-clamp-2 text-sm">
                {d.description || `Découvrez nos formations en ${d.nom}.`}
              </p>

              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-odc-primary transition-all group-hover:gap-2.5">
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
