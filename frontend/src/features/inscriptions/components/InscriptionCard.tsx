import { Calendar, Clock } from 'lucide-react';

import { Card } from '@/components/common/Card';
import { Avatar } from '@/components/common/Avatar';
import { StatutBadge } from './StatutBadge';
import { formatDate } from '@/utils/formatDate';

// ✅ TYPE pur → import type
import type { Inscription } from '../types/inscription.types';

// ============================================================================
//  PROPS
// ============================================================================

interface InscriptionCardProps {
  inscription: Inscription;
  onClick?: () => void;
}

// ============================================================================
//  COMPONENT
// ============================================================================

export function InscriptionCard({ inscription, onClick }: InscriptionCardProps) {
  return (
    <Card hover onClick={onClick} className="relative">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar
          src={inscription.participant?.photoUrl}
          name={`${inscription.participant?.prenom} ${inscription.participant?.nom}`}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="font-heading font-semibold text-odc-text-light dark:text-odc-text-dark truncate">
            {inscription.participant?.prenom} {inscription.participant?.nom}
          </div>
          <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark truncate">
            {inscription.participant?.email}
          </div>
        </div>
        <StatutBadge statut={inscription.statut} size="sm" />
      </div>

      {/* Formation */}
      <div className="p-3 rounded-lg bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark mb-3">
        <div className="text-[10px] uppercase tracking-wider text-odc-text-muted-light dark:text-odc-text-muted-dark mb-1">
          Formation
        </div>
        <div className="font-medium text-sm text-odc-text-light dark:text-odc-text-dark">
          {inscription.session?.formation?.titre}
        </div>
      </div>

      {/* Motivation */}
      {inscription.motivation && (
        <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark line-clamp-2 mb-3">
          💬 {inscription.motivation}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark pt-3 border-t border-odc-border-light dark:border-odc-border-dark">
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {formatDate(inscription.dateInscription)}
        </span>
        {inscription.session?.dateDebut && (
          <span className="flex items-center gap-1 text-odc-primary">
            <Clock size={11} />
            Début {formatDate(inscription.session.dateDebut)}
          </span>
        )}
      </div>
    </Card>
  );
}

export default InscriptionCard;