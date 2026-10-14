// src/app/(public)/formations/components/FormationCard.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  BarChart3,
  Users,
  ArrowRight,
  Award,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Formation } from '@/types/formation.types';

/* ============================================================================
   CONFIGURATION
   ============================================================================ */

const NIVEAU_CONFIG = {
  DEBUTANT: {
    label: 'Débutant',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  INTERMEDIAIRE: {
    label: 'Intermédiaire',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  AVANCE: {
    label: 'Avancé',
    className: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
} as const;

/* ============================================================================
   TYPES
   ============================================================================ */

interface FormationCardProps {
  formation: Formation;
  style?: React.CSSProperties;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function FormationCard({
  formation,
  style,
  onBookmark,
  isBookmarked = false,
}: FormationCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const niveauConfig =
    NIVEAU_CONFIG[formation.niveau as keyof typeof NIVEAU_CONFIG] ??
    NIVEAU_CONFIG.DEBUTANT;

  const imageSrc =
    !imageError && formation.imageUrl
      ? formation.imageUrl
      : '/images/formations/placeholder.jpg';

  const isGratuit = formation.prix === 0 || !formation.prix;
  const hasSessions =
    formation.sessions && formation.sessions.length > 0;
  const placesRestantes =
    formation.nbParticipantsMax && formation.sessions
      ? formation.nbParticipantsMax
      : null;

  /* -------------------- Bookmark handler -------------------- */
  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark?.(formation.id);
  };

  /* -------------------- Rendu -------------------- */
  return (
    <Card
      className={cn(
        'group relative flex flex-col overflow-hidden',
        'transition-all duration-odc-base ease-odc',
        'hover:-translate-y-1 hover:shadow-odc-lg',
        'animate-fade-in',
      )}
      style={style}
    >
      <Link href={`/formations/${formation.slug}`} className="block">
        {/* ================================================================
            IMAGE / COUVERTURE
            ================================================================ */}
        <div className="relative aspect-[16/10] overflow-hidden bg-odc-surface-alt">
          <Image
            src={imageSrc}
            alt={formation.titre}
            fill
            className={cn(
              'object-cover transition-transform duration-700 ease-odc',
              'group-hover:scale-110',
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />

          {/* Overlay dégradé */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            aria-hidden="true"
          />

          {/* Badge niveau (haut-gauche) */}
          <div className="absolute left-3 top-3">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1',
                'text-xs font-semibold ring-1 ring-inset backdrop-blur-sm',
                niveauConfig.className,
              )}
            >
              <BarChart3 className="h-3 w-3" aria-hidden="true" />
              {niveauConfig.label}
            </span>
          </div>

          {/* Badges haut-droite */}
          <div className="absolute right-3 top-3 flex flex-col gap-2">
            {/* Certifiante */}
            {formation.certifiante && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-md"
                      aria-label="Formation certifiante"
                    >
                      <Award className="h-3.5 w-3.5" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Formation certifiante</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Bookmark */}
            {onBookmark && (
              <button
                type="button"
                onClick={handleBookmark}
                aria-label={
                  isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'
                }
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full',
                  'backdrop-blur-sm transition-all',
                  isBookmarked
                    ? 'bg-odc-primary text-white'
                    : 'bg-white/80 text-odc-text-secondary hover:bg-white',
                )}
              >
                <Bookmark
                  className={cn(
                    'h-3.5 w-3.5',
                    isBookmarked && 'fill-current',
                  )}
                />
              </button>
            )}
          </div>

          {/* Domaine (bas-gauche sur l'image) */}
          {formation.domaineRelation && (
            <div className="absolute bottom-3 left-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white shadow-md ring-1 ring-inset ring-white/20 backdrop-blur-sm"
                style={{
                  backgroundColor: `${
                    formation.domaineRelation.couleur ?? '#FF7900'
                  }DD`,
                }}
              >
                {formation.domaineRelation.nom}
              </span>
            </div>
          )}

          {/* Gratuit (bas-droite sur l'image) */}
          {isGratuit && (
            <div className="absolute bottom-3 right-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-odc-success px-2.5 py-1 text-xs font-bold text-white shadow-md">
                <CheckCircle2 className="h-3 w-3" />
                Gratuit
              </span>
            </div>
          )}
        </div>

        {/* ================================================================
            CONTENU
            ================================================================ */}
        <CardContent className="flex flex-1 flex-col p-5">
          {/* Titre */}
          <h3
            className={cn(
              'mb-2 line-clamp-2 font-display text-base font-semibold leading-snug',
              'text-odc-text-primary transition-colors',
              'group-hover:text-odc-primary',
            )}
          >
            {formation.titre}
          </h3>

          {/* Description */}
          <p className="mb-4 line-clamp-2 min-h-[2.5rem] text-sm text-odc-text-secondary">
            {formation.description ||
              formation.descriptionCourte ||
              'Formation professionnelle dispensée par les experts ODC.'}
          </p>

          {/* Statistiques */}
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-odc-text-muted">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-odc-primary" aria-hidden="true" />
              <span className="tabular-nums">{formation.dureeHeures}h</span>
            </div>

            {hasSessions && (
              <div className="flex items-center gap-1.5">
                <Users
                  className="h-3.5 w-3.5 text-odc-primary"
                  aria-hidden="true"
                />
                <span>
                  {formation.sessions!.length} session
                  {formation.sessions!.length > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {placesRestantes && (
              <div className="flex items-center gap-1.5">
                <Users
                  className="h-3.5 w-3.5 text-odc-primary"
                  aria-hidden="true"
                />
                <span>{placesRestantes} places</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-odc-border pt-3">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-sm font-medium',
                'text-odc-primary transition-all',
                'group-hover:gap-2.5',
              )}
            >
              En savoir plus
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>

            {!isGratuit && (
              <span className="text-sm font-semibold text-odc-text-primary">
                {new Intl.NumberFormat('fr-FR').format(formation.prix ?? 0)} Ar
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}