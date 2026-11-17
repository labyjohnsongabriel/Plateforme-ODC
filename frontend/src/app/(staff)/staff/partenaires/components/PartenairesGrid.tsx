// src/app/(staff)/staff/partenaires/components/PartenairesGrid.tsx
'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Globe,
  Mail,
  Search,
  Filter,
  Eye,
  EyeOff,
  Plus,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { api } from '@/lib/api';
import { getMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Partenaire {
  id: string;
  nom: string;
  secteur?: string | null;
  logoUrl?: string | null;
  contactEmail?: string | null;
  siteWeb?: string | null;
  estPubliee?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function extractPartenaires(data: unknown): Partenaire[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Partenaire[];
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['partenaires', 'data', 'items', 'results']) {
      if (Array.isArray(obj[key])) return obj[key] as Partenaire[];
    }
  }
  return [];
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function PartenairesGrid() {
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'published' | 'draft'>(
    'all',
  );

  const { data, isLoading, isError, refetch, isFetching } = useQuery<Partenaire[]>({
    queryKey: ['staff', 'partenaires'],
    queryFn: async () => {
      const response = await api.get('/staff/partenaires', {
        params: { limit: 100 },
      });
      return extractPartenaires(response.data?.data ?? response.data);
    },
    staleTime: 30_000,
  });

  const partenaires = data ?? [];

  /* ─── Filtrage ─── */
  const filteredPartenaires = useMemo(() => {
    const query = search.trim().toLowerCase();

    return partenaires.filter((p) => {
      if (filterStatut === 'published' && !p.estPubliee) return false;
      if (filterStatut === 'draft' && p.estPubliee) return false;
      if (!query) return true;

      return (
        (p.nom ?? '').toLowerCase().includes(query) ||
        (p.secteur ?? '').toLowerCase().includes(query) ||
        (p.contactEmail ?? '').toLowerCase().includes(query)
      );
    });
  }, [partenaires, search, filterStatut]);

  /* ─── Header ─── */
  const header = (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Partenaires
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gérez les partenaires de la plateforme
        </p>
      </div>
      <Button
        asChild
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <a href="/staff/partenaires/nouveau">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Nouveau partenaire
        </a>
      </Button>
    </header>
  );

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        {header}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  /* ─── Erreur ─── */
  if (isError) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="p-6">
            <QueryErrorState
              onRetry={() => void refetch()}
              isRetrying={isFetching}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ─── Vide ─── */
  if (partenaires.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Building2}
              title="Aucun partenaire"
              description="Ajoutez votre premier partenaire pour commencer."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ─── Rendu principal ─── */
  return (
    <div className="space-y-6">
      {header}

      {/* Barre de recherche + filtre */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Recherche */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Rechercher un partenaire…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Filtre statut */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Select
            value={filterStatut}
            onValueChange={(v) =>
              setFilterStatut(v as 'all' | 'published' | 'draft')
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="published">Publiés</SelectItem>
              <SelectItem value="draft">Brouillons</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Compteur */}
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {filteredPartenaires.length}
          </span>{' '}
          partenaire{filteredPartenaires.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Grille */}
      {filteredPartenaires.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Building2}
              title="Aucun résultat"
              description="Aucun partenaire ne correspond à vos filtres."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setFilterStatut('all');
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPartenaires.map((p) => (
            <PartenaireCard key={p.id} partenaire={p} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CARTE PARTENAIRE
   ═══════════════════════════════════════════════════════════════════════════ */

function PartenaireCard({ partenaire: p }: { partenaire: Partenaire }) {
  const [imageError, setImageError] = useState(false);
  const logoUrl = getMediaUrl(p.logoUrl);

  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <CardContent className="flex flex-1 flex-col p-5 text-center">
        {/* Logo */}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-muted ring-1 ring-border transition-transform duration-300 group-hover:scale-105">
          {logoUrl && !imageError ? (
            <img
              src={logoUrl}
              alt={p.nom}
              className="h-full w-full object-contain p-2"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <Building2
              className="h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Nom + secteur */}
        <h3 className="mb-1 line-clamp-2 font-display font-semibold text-foreground transition-colors group-hover:text-primary">
          {p.nom}
        </h3>
        {p.secteur && (
          <p className="mb-3 line-clamp-1 text-xs text-muted-foreground">
            {p.secteur}
          </p>
        )}

        {/* Contacts */}
        <div className="mb-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
          {p.contactEmail && (
            <a
              href={`mailto:${p.contactEmail}`}
              className="inline-flex items-center justify-center gap-1.5 transition-colors hover:text-primary"
            >
              <Mail className="h-3 w-3" aria-hidden="true" />
              <span className="truncate">{p.contactEmail}</span>
            </a>
          )}
          {p.siteWeb && (
            <a
              href={p.siteWeb}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 transition-colors hover:text-primary"
            >
              <Globe className="h-3 w-3" aria-hidden="true" />
              Site web
            </a>
          )}
        </div>

        {/* Statut */}
        <div className="mt-auto pt-3">
          {p.estPubliee ? (
            <Badge className="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Eye className="h-3 w-3" aria-hidden="true" />
              Publié
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 text-muted-foreground"
            >
              <EyeOff className="h-3 w-3" aria-hidden="true" />
              Brouillon
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}