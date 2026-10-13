'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, BarChart3, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Formation } from '@/types/formation.types';

const NIVEAU_LABELS: Record<string, string> = {
  DEBUTANT: 'Débutant',
  INTERMEDIAIRE: 'Intermédiaire',
  AVANCE: 'Avancé',
};

const NIVEAU_COLORS: Record<string, string> = {
  DEBUTANT: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  INTERMEDIAIRE: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  AVANCE: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
};

interface Props {
  formation: Formation;
  style?: React.CSSProperties;
}

export function FormationCard({ formation, style }: Props) {
  const imageSrc = formation.imageUrl || '/images/formations/placeholder.jpg';

  return (
    <Card
      className="group overflow-hidden hover:-translate-y-1 hover:shadow-odc-lg transition-all duration-300 animate-fade-in"
      style={style}
    >
      <Link href={`/formations/${formation.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-odc-surface-alt">
          <Image
            src={imageSrc}
            alt={formation.titre}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          <div className="absolute top-3 left-3">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                NIVEAU_COLORS[formation.niveau],
              )}
            >
              {NIVEAU_LABELS[formation.niveau]}
            </span>
          </div>

          {formation.domaineRelation && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-odc-primary text-white hover:bg-odc-primary">
                {formation.domaineRelation.nom}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-5">
          <h3 className="font-display font-semibold text-lg mb-2 line-clamp-2 group-hover:text-odc-primary transition-colors">
            {formation.titre}
          </h3>

          <p className="text-sm text-odc-muted line-clamp-2 mb-4 min-h-[2.5rem]">
            {formation.description ||
              'Formation professionnelle dispensée par les experts ODC.'}
          </p>

          <div className="flex items-center gap-4 text-xs text-odc-muted mb-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-odc-primary" />
              <span>{formation.dureeHeures}h</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-odc-primary" />
              <span>{NIVEAU_LABELS[formation.niveau]}</span>
            </div>
            {formation.sessions && formation.sessions.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-odc-primary" />
                <span>{formation.sessions.length} session(s)</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-odc-border">
            <span className="text-odc-primary text-sm font-medium inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
              En savoir plus
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
            {formation.prix === 0 && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Gratuit
              </Badge>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}