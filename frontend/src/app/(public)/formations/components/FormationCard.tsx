// src/app/(public)/formations/components/FormationCard.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock, BarChart3, Users, ArrowRight, Award, Bookmark,
  CheckCircle2, Calendar, MapPin, Sparkles, TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getMediaUrl } from '@/lib/media';
import type { Formation } from '@/types/formation.types';

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════════════════ */

const NIVEAU_CONFIG = {
  DEBUTANT: {
    label: 'Débutant',
    className:
      'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900',
  },
  INTERMEDIAIRE: {
    label: 'Intermédiaire',
    className:
      'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900',
  },
  AVANCE: {
    label: 'Avancé',
    className:
      'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900',
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface FormationCardProps {
  formation: Formation;
  style?: React.CSSProperties;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  compact?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function FormationCard({
  formation,
  style,
  onBookmark,
  isBookmarked = false,
  compact = false,
}: FormationCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const niveauConfig =
    NIVEAU_CONFIG[formation.niveau as keyof typeof NIVEAU_CONFIG] ??
    NIVEAU_CONFIG.DEBUTANT;

  const imageSrc =
    getMediaUrl(
      !imageError && (formation.imageCouvertureUrl || formation.imageUrl)
        ? formation.imageCouvertureUrl || formation.imageUrl
        : '/images/formations/placeholder.jpg',
    ) ?? '/images/formations/placeholder.jpg';

  const isGratuit = formation.prix === 0 || !formation.prix;
  const sessionsCount = formation.sessions?.length ?? 0;

  const prochaineSession = React.useMemo(() => {
    const ouvertes = (formation.sessions ?? [])
      .filter((s) => s.statut === 'OUVERTE')
      .sort(
        (a, b) =>
          new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime(),
      );
    return ouvertes[0];
  }, [formation.sessions]);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark?.(formation.id);
  };

  return (
    <Card
      className={cn(
        'group relative flex flex-col overflow-hidden border-border/60',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl',
        'dark:hover:border-orange-900',
        'animate-fade-in',
      )}
      style={style}
    >
      <Link
        href={`/formations/${formation.slug}`}
        className="block flex-1"
        aria-label={`Voir le détail de ${formation.titre}`}
      >
        {/* ═══════════════════════════════════════════════════════════════
            IMAGE
            ═══════════════════════════════════════════════════════════════ */}
        <div
          className={cn(
            'relative overflow-hidden bg-muted',
            compact ? 'aspect-[16/9]' : 'aspect-[16/10]',
          )}
        >
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
            onError={() => setImageError(true)}
          />

          {/* Overlay dégradé */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
            aria-hidden
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
              <BarChart3 className="h-3 w-3" aria-hidden />
              {niveauConfig.label}
            </span>
          </div>

          {/* Badges haut-droite */}
          <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
            {formation.certifiante && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg"
                      aria-label="Formation certifiante"
                    >
                      <Award className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    Formation certifiante
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {onBookmark && (
              <button
                type="button"
                onClick={handleBookmark}
                aria-label={
                  isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'
                }
                aria-pressed={isBookmarked}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full',
                  'backdrop-blur-sm transition-all',
                  isBookmarked
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white/85 text-muted-foreground hover:bg-white',
                )}
              >
                <Bookmark
                  className={cn('h-3.5 w-3.5', isBookmarked && 'fill-current')}
                  aria-hidden
                />
              </button>
            )}
          </div>

          {/* Domaine (bas-gauche) */}
          {formation.domaineRelation && (
            <div className="absolute bottom-3 left-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-lg ring-1 ring-inset ring-white/25 backdrop-blur-sm"
                style={{
                  backgroundColor: `${formation.domaineRelation.couleur ?? '#FF7900'}E6`,
                }}
              >
                <Sparkles className="h-3 w-3" aria-hidden />
                {formation.domaineRelation.nom}
              </span>
            </div>
          )}

          {/* Gratuit / Prix (bas-droite) */}
          <div className="absolute bottom-3 right-3">
            {isGratuit ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
                <CheckCircle2 className="h-3 w-3" aria-hidden /> Gratuit
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-foreground shadow-lg backdrop-blur-sm">
                {new Intl.NumberFormat('fr-MG').format(formation.prix ?? 0)} Ar
              </span>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            CONTENU
            ═══════════════════════════════════════════════════════════════ */}
        <CardContent
          className={cn('flex flex-1 flex-col', compact ? 'p-4' : 'p-5')}
        >
          {/* Titre */}
          <h3
            className={cn(
              'font-display mb-2 line-clamp-2 font-bold leading-snug',
              'text-foreground transition-colors group-hover:text-orange-600',
              compact ? 'text-sm' : 'text-base',
            )}
          >
            {formation.titre}
          </h3>

          {/* Description */}
          {!compact && (
            <p className="mb-4 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
              {formation.descriptionCourte ||
                formation.description ||
                'Formation professionnelle dispensée par les experts ODC.'}
            </p>
          )}

          {/* Stats */}
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-orange-500" aria-hidden />
              <span className="tabular-nums font-medium">
                {formation.dureeHeures}h
              </span>
            </div>

            {sessionsCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-orange-500" aria-hidden />
                <span>
                  {sessionsCount} session{sessionsCount > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {prochaineSession && (
              <div className="flex items-center gap-1.5">
                <Calendar
                  className="h-3.5 w-3.5 text-green-500"
                  aria-hidden
                />
                <span className="font-medium text-green-600 dark:text-green-400">
                  Prochaine :{' '}
                  {new Date(prochaineSession.dateDebut).toLocaleDateString(
                    'fr-FR',
                    { day: 'numeric', month: 'short' },
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-sm font-semibold',
                'text-orange-600 transition-all dark:text-orange-400',
                'group-hover:gap-2.5',
              )}
            >
              En savoir plus
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>

            {prochaineSession?.lieu && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" aria-hidden />
                <span className="max-w-[100px] truncate">
                  {prochaineSession.lieu}
                </span>
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}