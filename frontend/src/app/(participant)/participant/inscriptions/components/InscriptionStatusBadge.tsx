import {
  Hourglass, CheckCircle2, XCircle, Clock, XOctagon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CONFIG: Record<
  string,
  { label: string; icon: any; className: string }
> = {
  EN_ATTENTE: {
    label: 'En attente',
    icon: Hourglass,
    className: 'bg-odc-warning-bg text-odc-warning',
  },
  ACCEPTEE: {
    label: 'Acceptée',
    icon: CheckCircle2,
    className: 'bg-odc-success-bg text-odc-success',
  },
  REFUSEE: {
    label: 'Refusée',
    icon: XCircle,
    className: 'bg-odc-error-bg text-odc-error',
  },
  LISTE_ATTENTE: {
    label: "Liste d'attente",
    icon: Clock,
    className: 'bg-odc-info-bg text-odc-info',
  },
  ANNULEE: {
    label: 'Annulée',
    icon: XOctagon,
    className: 'bg-odc-surface-alt text-odc-muted',
  },
};

interface Props {
  statut: string;
  className?: string;
}

export function InscriptionStatusBadge({ statut, className }: Props) {
  const config = CONFIG[statut] ?? CONFIG.EN_ATTENTE;
  const Icon = config.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}