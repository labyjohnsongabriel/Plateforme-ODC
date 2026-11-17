// src/app/(public)/partenaires/components/PartenairesGrid.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  Globe,
  ArrowUpRight,
  Search,
  X,
  Award,
  Users,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { usePartenairesPublic } from '@/hooks/queries/usePartenaires';
import { getMediaUrl } from '@/lib/media';

/* ═══════════════════════════════════════════════════════════════════════════
   SQUELETTE
   ═══════════════════════════════════════════════════════════════════════════ */

function GridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-32 w-full" />
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-9 w-full rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function PartenairesGrid() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    usePartenairesPublic();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSecteur, setFilterSecteur] = useState<string>('all');

  const partenaires = data?.data ?? [];

  /* ═══════ Secteurs disponibles ═══════ */
  const secteurs = useMemo(() => {
    const set = new Set(
      partenaires
        .map((p) => p.secteur)
        .filter((s): s is string => !!s && s.trim().length > 0),
    );
    return Array.from(set);
  }, [partenaires]);

  /* ═══════ Filtrage ═══════ */
  const filtered = useMemo(() => {
    let result = partenaires;

    if (filterSecteur !== 'all') {
      result = result.filter((p) => p.secteur === filterSecteur);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.nom.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          (p.secteur ?? '').toLowerCase().includes(q),
      );
    }

    return result;
  }, [partenaires, filterSecteur, searchQuery]);

  /* ═══════ Loading ═══════ */
  if (isLoading) return <GridSkeleton />;

  /* ═══════ Erreur ═══════ */
  if (isError) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" aria-hidden />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-base font-semibold text-foreground">
                Impossible de charger les partenaires
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Erreur inconnue'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="mt-3"
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
  if (!partenaires.length) {
    return (
      <Card>
        <EmptyState
          icon={Building2}
          title="Aucun partenaire"
          description="Les partenaires seront publiés prochainement."
        />
      </Card>
    );
  }

  /* ═══════ Rendu principal ═══════ */
  return (
    <div className="space-y-8">
      {/* ═══════ Barre de recherche + filtres ═══════ */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Recherche */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="Rechercher un partenaire…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>

        {/* Filtre secteur */}
        {secteurs.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterSecteur === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSecteur('all')}
              className={filterSecteur === 'all' ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              Tous
            </Button>
            {secteurs.map((s) => (
              <Button
                key={s}
                variant={filterSecteur === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterSecteur(s)}
                className={filterSecteur === s ? 'bg-orange-500 hover:bg-orange-600' : ''}
              >
                {s}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* ═══════ Compteur ═══════ */}
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{filtered.length}</span>{' '}
        partenaire{filtered.length > 1 ? 's' : ''}
        {filterSecteur !== 'all' && ` • ${filterSecteur}`}
        {searchQuery && ` • « ${searchQuery} »`}
      </p>

      {/* ═══════ Grille ═══════ */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Search}
            title="Aucun résultat"
            description={
              searchQuery
                ? `Aucun partenaire ne correspond à « ${searchQuery} ».`
                : 'Aucun partenaire dans cette catégorie.'
            }
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setFilterSecteur('all');
                }}
              >
                Réinitialiser les filtres
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <Card
              key={p.id}
              className="group animate-fade-in flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-lg"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* ═══════ En-tête dégradé ═══════ */}
              <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 dark:from-orange-950/40 dark:via-orange-950/20 dark:to-amber-950/30">
                {/* Motif décoratif */}
                <div
                  className="absolute inset-0 opacity-10"
                  aria-hidden
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 30% 30%, #FF7900 0%, transparent 40%)',
                  }}
                />

                {/* Logo */}
                {p.logoUrl ? (
                  <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg ring-2 ring-white/60 dark:bg-white">
                    <Image
                      src={getMediaUrl(p.logoUrl)!}
                      alt={`Logo ${p.nom}`}
                      width={64}
                      height={64}
                      className="h-full w-full object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/80 shadow-lg ring-2 ring-white/60 dark:bg-white/90">
                    <Building2 className="h-10 w-10 text-orange-500" aria-hidden />
                  </div>
                )}
              </div>

              {/* ═══════ Contenu ═══════ */}
              <CardContent className="flex flex-1 flex-col p-6">
                {/* Badge secteur */}
                {p.secteur && (
                  <Badge
                    variant="outline"
                    className="mb-3 w-fit border-orange-200 bg-orange-50 text-xs text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300"
                  >
                    <Award className="mr-1 h-3 w-3" aria-hidden />
                    {p.secteur}
                  </Badge>
                )}

                {/* Nom */}
                <h3 className="font-display mb-2 line-clamp-1 text-lg font-bold text-foreground transition-colors group-hover:text-orange-600">
                  {p.nom}
                </h3>

                {/* Description */}
                {p.description ? (
                  <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {p.description}
                  </p>
                ) : (
                  <p className="mb-4 text-sm italic text-muted-foreground">
                    Partenaire de l&apos;ODC Madagascar
                  </p>
                )}

                {/* Actions */}
                <div className="mt-auto flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 dark:border-orange-900 dark:text-orange-300 dark:hover:bg-orange-950/40"
                  >
                    <Link href={`/partenaires/${p.slug}`}>
                      Voir le profil
                      <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </Button>

                  {p.siteWeb && (
                    <a
                      href={p.siteWeb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 text-xs font-medium text-orange-600 transition-colors hover:text-orange-700 hover:underline dark:text-orange-400"
                    >
                      <Globe className="h-3.5 w-3.5" aria-hidden />
                      Visiter le site
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ═══════ Appel à partenariat ═══════ */}
      <Card className="mt-12 overflow-hidden border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:border-orange-900 dark:from-orange-950/40 dark:to-amber-950/30">
        <CardContent className="p-8 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg">
                <Users className="h-7 w-7" aria-hidden />
              </div>
            </div>
            <h3 className="font-display mb-2 text-xl font-bold text-foreground">
              Devenir partenaire de l&apos;ODC
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Vous souhaitez soutenir l&apos;inclusion numérique à Madagascar ?
              Rejoignez notre réseau de partenaires engagés.
            </p>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}