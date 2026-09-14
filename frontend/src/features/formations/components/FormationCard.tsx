import { Link } from 'react-router-dom';
import { BookOpen, Clock, BarChart3, ArrowRight, Users } from 'lucide-react';

import type { Formation } from '../types/formation.types';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { FormationService } from '../services/formation.service';

const gradientMap: Record<string, string> = {
  WEB: 'from-orange-500 to-orange-600',
  DATA: 'from-blue-500 to-blue-600',
  CYBER: 'from-red-500 to-red-600',
  IA: 'from-purple-500 to-purple-600',
  DESIGN: 'from-green-500 to-green-600',
  CLOUD: 'from-cyan-500 to-cyan-600',
};

interface FormationCardProps {
  formation: Formation;
  compact?: boolean;
}

export function FormationCard({ formation, compact }: FormationCardProps) {
  const gradient =
    gradientMap[formation.domaine] || 'from-odc-primary to-odc-primary-dark';
  const niveauVariant = FormationService.getNiveauVariant(formation.niveau);

  return (
    <Link to={`/formations/${formation.id}`}>
      <Card hover className="h-full flex flex-col overflow-hidden group">
        {/* Header gradient */}
        <div
          className={`relative -m-6 mb-4 h-24 bg-gradient-to-br ${gradient} flex items-center justify-center`}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '20px 20px',
            }}
          />
          <BookOpen
            size={40}
            className="text-white/90 relative z-10 group-hover:scale-110 transition-transform"
          />
          <div className="absolute top-3 right-3">
            <Badge
              variant="neutral"
              size="xs"
              className="bg-white/20 text-white backdrop-blur-sm border-0"
            >
              {formation.domaine}
            </Badge>
          </div>
        </div>

        {/* Titre */}
        <h3 className="font-heading font-bold text-odc-text-light dark:text-odc-text-dark mb-2 line-clamp-2 group-hover:text-odc-primary transition-colors">
          {formation.titre}
        </h3>

        {/* Description */}
        {!compact && formation.description && (
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark line-clamp-2 mb-4">
            {formation.description}
          </p>
        )}

        {/* Meta */}
        <div className="mt-auto pt-3 border-t border-odc-border-light dark:border-odc-border-dark flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-odc-text-muted-light dark:text-odc-text-muted-dark">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formation.dureeHeures}h
            </span>
            <Badge variant={niveauVariant} size="xs">
              {FormationService.formatNiveau(formation.niveau)}
            </Badge>
          </div>
          <ArrowRight
            size={16}
            className="text-odc-primary group-hover:translate-x-1 transition-transform"
          />
        </div>
      </Card>
    </Link>
  );
}