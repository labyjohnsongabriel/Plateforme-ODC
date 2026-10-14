'use client';

import { Edit, Eye, EyeOff, ExternalLink, Award, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  useTogglePublishFormation,
  type Formation,
} from '@/hooks/useFormations';

/* ============================================================================
   TYPES
   ============================================================================ */

interface FormationHeaderProps {
  formation: Formation;
  onEdit: () => void;
}

const NIVEAU_LABELS: Record<string, string> = {
  DEBUTANT: 'Débutant',
  INTERMEDIAIRE: 'Intermédiaire',
  AVANCE: 'Avancé',
};

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function FormationHeader({ formation, onEdit }: FormationHeaderProps) {
  const togglePublish = useTogglePublishFormation();

  const handleTogglePublish = () => {
    togglePublish.mutate({
      id: formation.id,
      estPubliee: !formation.estPubliee,
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-odc-border bg-odc-surface p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            {formation.miseEnAvant && (
              <Award className="h-5 w-5 shrink-0 text-amber-500" />
            )}
            <h1 className="font-display text-2xl font-bold tracking-tight text-odc-text-primary md:text-3xl">
              {formation.titre}
            </h1>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {formation.domaine && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ring-black/5"
                style={{
                  backgroundColor: `${formation.domaine.couleur ?? '#FF7900'}20`,
                  color: formation.domaine.couleur ?? '#FF7900',
                }}
              >
                {formation.domaine.nom}
              </span>
            )}

            <span className="inline-flex items-center rounded-full bg-odc-surface-alt px-2.5 py-0.5 text-xs font-medium text-odc-text-secondary">
              {NIVEAU_LABELS[formation.niveau] ?? formation.niveau}
            </span>

            {formation.estPubliee ? (
              <Badge className="bg-odc-success-soft text-odc-success-dark hover:bg-odc-success-soft">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-odc-success" />
                Publiée
              </Badge>
            ) : (
              <Badge variant="outline" className="text-odc-text-muted">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-odc-text-muted" />
                Brouillon
              </Badge>
            )}
          </div>

          <p className="mt-3 line-clamp-2 text-sm text-odc-text-secondary">
            {formation.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={
              formation.estPubliee ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )
            }
            onClick={handleTogglePublish}
            disabled={togglePublish.isPending}
          >
            {formation.estPubliee ? 'Dépublier' : 'Publier'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<ExternalLink className="h-4 w-4" />}
            onClick={() =>
              window.open(`/formations/${formation.slug}`, '_blank')
            }
          >
            Voir la page
          </Button>

          <Button
            variant="odc"
            size="sm"
            leftIcon={<Edit className="h-4 w-4" />}
            onClick={onEdit}
          >
            Modifier
          </Button>
        </div>
      </div>
    </div>
  );
}