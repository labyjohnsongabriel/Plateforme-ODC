// src/app/(partenaire)/partenaire/dashboard/components/FormationsPubliees.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ArrowRight, Clock, BarChart3, Eye, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { getMediaUrl } from '@/lib/media';

/* ============================================================================
   LABELS
   ============================================================================ */

const NIVEAU_LABELS: Record<string, string> = {
  DEBUTANT: 'Débutant',
  INTERMEDIAIRE: 'Intermédiaire',
  AVANCE: 'Avancé',
};

/* ============================================================================
   TYPES
   ============================================================================ */

interface Formation {
  id: string;
  titre: string;
  slug: string;
  resume?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  domaine?: string | null;
  domaineRelation?: { id: string; nom: string } | null;
  niveau: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
  dureeHeures: number;
  nbVues?: number;
  miseEnAvant?: boolean;
  estPubliee: boolean;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function FormationsPubliees() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery<Formation[]>({
    queryKey: ['partenaire', 'formations'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Formation[] }>('/partenaire/formations');
      return Array.isArray(data?.data) ? data.data : [];
    },
  });

  /* 🔍 DIAGNOSTIC */
  // console.log('🔍 Formations:', data);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Formations publiées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Formations publiées</CardTitle>
        </CardHeader>
        <CardContent>
          <QueryErrorState
            onRetry={() => {
              void refetch();
            }}
            isRetrying={isFetching}
          />
        </CardContent>
      </Card>
    );
  }

  const formations = data ?? [];

  if (formations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Formations publiées</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={BookOpen}
            title="Aucune formation publiée"
            description="Les formations publiées apparaîtront ici."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Formations publiées</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-muted-foreground hover:text-foreground"
        >
          <Link href="/partenaire/formations" className="group">
            Voir tout
            <ArrowRight
              className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {formations.slice(0, 6).map((f) => (
            <FormationCard key={f.id} formation={f} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================================
   CARTE FORMATION
   ============================================================================ */

function FormationCard({ formation }: { formation: Formation }) {
  const domaineLabel = formation.domaineRelation?.nom ?? formation.domaine ?? 'Général';
  const niveauLabel = NIVEAU_LABELS[formation.niveau] ?? formation.niveau;

  return (
    <Link
      href={`/partenaire/formations/${formation.slug}`}
      className={cn(
        'group flex flex-col rounded-lg border border-border bg-card p-4 transition-all',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/40 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      )}
    >
      <img
        src={getMediaUrl(formation.imageUrl) ?? '/images/formations/placeholder.jpg'}
        alt={formation.titre}
        className="mb-3 aspect-video w-full rounded-md object-cover"
        loading="lazy"
        onError={(event) => {
          event.currentTarget.src = '/images/formations/placeholder.jpg';
        }}
      />

      {/* En-tête : domaine + étoile */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <Badge className="bg-primary/10 text-xs text-primary dark:bg-primary/15">
          {domaineLabel}
        </Badge>
        {formation.miseEnAvant && (
          <Star className="h-4 w-4 shrink-0 fill-primary text-primary" aria-hidden="true" />
        )}
      </div>

      {/* Titre */}
      <h3 className="font-display mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
        {formation.titre}
      </h3>

      {/* Résumé */}
      {formation.resume && (
        <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
          {formation.resume}
        </p>
      )}

      {/* Meta */}
      <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-border pt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden="true" />
          {formation.dureeHeures}h
        </span>
        <span className="flex items-center gap-1">
          <BarChart3 className="h-3 w-3" aria-hidden="true" />
          {niveauLabel}
        </span>
        {formation.nbVues !== undefined && (
          <span className="ml-auto flex items-center gap-1 tabular-nums">
            <Eye className="h-3 w-3" aria-hidden="true" />
            {formation.nbVues}
          </span>
        )}
      </div>
    </Link>
  );
}