// src/app/(public)/formations/[slug]/components/RelatedFormations.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormationCard } from '@/app/(public)/formations/components/FormationCard';
import { api } from '@/lib/api';

/* ═══════════════════════════════════════════════════════════════════════════
   PROPS
   ═══════════════════════════════════════════════════════════════════════════ */

interface Props {
  formationId: string;
  domaineId?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function RelatedFormations({ formationId, domaineId }: Props) {
  const { data: formations = [] } = useQuery({
    queryKey: ['formations', 'related', formationId, domaineId],
    queryFn: async () => {
      const { data } = await api.get('/public/formations', {
        params: { domaineId, limit: 4, excludeId: formationId },
      });
      return (data.data ?? []) as any[];
    },
    enabled: !!domaineId,
    staleTime: 60_000,
  });

  if (formations.length === 0) return null;

  return (
    <section className="relative overflow-hidden border-t border-border bg-gradient-to-b from-muted/30 to-background py-16">
      {/* Décoration */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 80% 20%, #FF7900 0%, transparent 50%)',
        }}
      />

      <div className="relative container-page">
        {/* ═══════ En-tête ═══════ */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge
              variant="outline"
              className="mb-3 border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300"
            >
              <Sparkles className="mr-1 h-3 w-3" aria-hidden />
              Suggestions
            </Badge>
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Formations similaires
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Découvrez d&apos;autres formations dans le même domaine
            </p>
          </div>
          <Button
            variant="outline"
            asChild
            className="border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-900 dark:hover:bg-orange-950/40"
          >
            <Link href="/formations">
              <BookOpen className="mr-2 h-4 w-4" aria-hidden />
              Voir toutes
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>

        {/* ═══════ Grille ═══════ */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {formations.slice(0, 4).map((f) => (
            <FormationCard key={f.id} formation={f} compact />
          ))}
        </div>
      </div>
    </section>
  );
}