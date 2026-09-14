import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ban,
} from 'lucide-react';
import type { ComponentType } from 'react';

// ✅ VALEUR (composant) → import normal
import { Badge } from '@/components/common/Badge';

// ✅ TYPE pur → import type séparé
import type { BadgeVariant, BadgeSize } from '@/components/common/Badge';

// ✅ VALEUR (enum) → import normal
import { StatutInscription } from '../types/inscription.types';

// ============================================================================
//  CONFIG
// ============================================================================

interface StatutConfig {
  variant: BadgeVariant;
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
}

const config: Record<StatutInscription, StatutConfig> = {
  EN_ATTENTE: { variant: 'warning', icon: Clock, label: 'En attente' },
  ACCEPTEE: { variant: 'success', icon: CheckCircle, label: 'Acceptée' },
  REFUSEE: { variant: 'error', icon: XCircle, label: 'Refusée' },
  LISTE_ATTENTE: {
    variant: 'info',
    icon: AlertCircle,
    label: "Liste d'attente",
  },
  ANNULEE: { variant: 'neutral', icon: Ban, label: 'Annulée' },
};

// ============================================================================
//  PROPS
// ============================================================================

interface StatutBadgeProps {
  statut: StatutInscription;
  size?: BadgeSize;
  className?: string;
}

// ============================================================================
//  COMPONENT
// ============================================================================

export function StatutBadge({
  statut,
  size = 'md',
  className,
}: StatutBadgeProps) {
  const c = config[statut] ?? config.EN_ATTENTE;
  const Icon = c.icon;

  return (
    <Badge variant={c.variant} size={size} className={className}>
      <Icon size={12} />
      {c.label}
    </Badge>
  );
}

export default StatutBadge;