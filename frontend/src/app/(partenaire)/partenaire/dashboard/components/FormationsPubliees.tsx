// src/app/(partenaire)/partenaire/dashboard/components/FormationsPubliees.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  ArrowRight,
  Clock,
  BarChart3,
  Eye,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

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
  const { data, isLoading, isError } = useQuery({
    queryKey: ['partenaire', 'formations'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Formation[] }>(
        '/partenaire/formations',
      );
      return data.data;
    },
  });

  /* -------------------- Loading -------------------- */
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

  /* -------------------- Erreur -------------------- */
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Formations publiées</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={BookOpen}
            title="Erreur de chargement"
            description="Impossible de charger les formations."
          />
        </CardContent>
      </Card>
    );
  }

  const formations = data ?? [];

  /* -------------------- Vide -------------------- */
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

  /* -------------------- Liste -------------------- */
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Formations publiées</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/partenaire/formations">
            Voir tout
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
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
  const domaineLabel =
    formation.domaineRelation?.nom ?? formation.domaine ?? 'Général';
  const niveauLabel = NIVEAU_LABELS[formation.niveau] ?? formation.niveau;

  return (
    <Link
      href={`/partenaire/formations/${formation.slug}`}
      className={cn(
        'group flex flex-col p-4 rounded-lg border border-odc-border bg-odc-surface',
        'transition-all hover:border-odc-primary hover:bg-odc-primary-soft/30 hover:shadow-odc-sm',
      )}
    >
      {/* -------------------- En-tête -------------------- */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <Badge className="bg-odc-primary-soft text-odc-primary text-xs">
          {domaineLabel}
        </Badge>
        {formation.miseEnAvant && (
          <Star className="h-4 w-4 text-odc-primary fill-odc-primary shrink-0" />
        )}
      </div>

      {/* -------------------- Titre -------------------- */}
      <h3 className="font-display font-semibold text-sm leading-snug mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-odc-primary transition-colors">
        {formation.titre}
      </h3>

      {/* -------------------- Résumé -------------------- */}
      {formation.resume && (
        <p className="text-xs text-odc-muted line-clamp-2 mb-3">
          {formation.resume}
        </p>
      )}

      {/* -------------------- Meta -------------------- */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-odc-muted mt-auto pt-2 border-t border-odc-border">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formation.dureeHeures}h
        </span>

        <span className="flex items-center gap-1">
          <BarChart3 className="h-3 w-3" />
          {niveauLabel}
        </span>

        {formation.nbVues !== undefined && (
          <span className="flex items-center gap-1 ml-auto">
            <Eye className="h-3 w-3" />
            {formation.nbVues}
          </span>
        )}
      </div>
    </Link>
  );
}