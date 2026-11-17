// src/app/(public)/formations/[slug]/components/FormationTestimonials.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Quote, Star, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

/* ═══════════════════════════════════════════════════════════════════════════
   PROPS
   ═══════════════════════════════════════════════════════════════════════════ */

interface Props {
  formationId: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function FormationTestimonials({ formationId }: Props) {
  const { data: testimonials = [], isLoading, isError, refetch, isFetching } =
    useQuery({
      queryKey: ['formations', formationId, 'testimonials'],
      queryFn: async () => {
        const { data } = await api.get(
          `/public/formations/${formationId}/temoignages`,
        );
        return (data.data ?? []) as any[];
      },
      staleTime: 60_000,
    });

  /* ═══════ Loading ═══════ */
  if (isLoading) {
    return (
      <section>
        <Skeleton className="mb-8 h-16 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </section>
    );
  }

  /* ═══════ Erreur ═══════ */
  if (isError) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-destructive" aria-hidden />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                Impossible de charger les témoignages
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="mt-2"
              >
                {isFetching ? (
                  <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <RefreshCw className="mr-2 h-3.5 w-3.5" aria-hidden />
                )}
                Réessayer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ═══════ Vide ═══════ */
  if (!testimonials.length) return null;

  /* ═══════ Rendu ═══════ */
  return (
    <section>
      {/* En-tête */}
      <div className="mb-8">
        <Badge
          variant="outline"
          className="mb-3 border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300"
        >
          <Users className="mr-1 h-3 w-3" aria-hidden />
          Témoignages
        </Badge>
        <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Ils ont suivi cette formation
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Retours d&apos;expérience de participants
        </p>
      </div>

      {/* Grille */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.slice(0, 3).map((t, i) => (
          <Card
            key={t.id}
            className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Icône quote */}
            <Quote
              className="absolute right-4 top-4 h-12 w-12 text-orange-100 transition-transform duration-300 group-hover:scale-110 dark:text-orange-950/50"
              aria-hidden
            />

            <CardContent className="relative p-6">
              {/* Étoiles */}
              <div className="mb-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`h-4 w-4 ${
                      j < (t.note ?? 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-border'
                    }`}
                    aria-hidden
                  />
                ))}
                <span className="ml-2 text-xs font-semibold text-muted-foreground">
                  {(t.note ?? 5).toFixed(1)} / 5
                </span>
              </div>

              {/* Contenu */}
              <p className="line-clamp-6 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.contenu}&rdquo;
              </p>

              {/* Auteur */}
              <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-bold text-white shadow-sm">
                  {t.auteur?.prenom?.[0]}
                  {t.auteur?.nom?.[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {t.auteur?.prenom} {t.auteur?.nom}
                  </p>
                  {t.auteur?.promotion && (
                    <p className="truncate text-xs text-muted-foreground">
                      Promotion {t.auteur.promotion}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}