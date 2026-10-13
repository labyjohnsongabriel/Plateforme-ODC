// src/components/shared/StatusBadge.tsx
import * as React from 'react';
import {
  CheckCircle2, XCircle, Clock, AlertTriangle, Info, Loader, Ban,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusVariant =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'pending'
  | 'neutral'
  | 'cancelled';

interface StatusConfig {
  label: string;
  icon?: React.ElementType;
  className: string;
}

const DEFAULT_STATUSES: Record<StatusVariant, StatusConfig> = {
  success: {
    label: 'Actif',
    icon: CheckCircle2,
    className: 'bg-odc-success-bg text-odc-success',
  },
  error: {
    label: 'Erreur',
    icon: XCircle,
    className: 'bg-odc-error-bg text-odc-error',
  },
  warning: {
    label: 'Attention',
    icon: AlertTriangle,
    className: 'bg-odc-warning-bg text-odc-warning',
  },
  info: {
    label: 'Information',
    icon: Info,
    className: 'bg-odc-info-bg text-odc-info',
  },
  pending: {
    label: 'En attente',
    icon: Clock,
    className: 'bg-odc-warning-bg text-odc-warning',
  },
  neutral: {
    label: 'Neutre',
    className: 'bg-odc-surface-alt text-odc-muted',
  },
  cancelled: {
    label: 'Annulé',
    icon: Ban,
    className: 'bg-odc-surface-alt text-odc-muted',
  },
};

/** Map optionnel : transformer un statut backend → variante + label custom */
export const STATUS_MAP: Record<string, { variant: StatusVariant; label?: string }> = {
  // Exemple générique
  ACTIF: { variant: 'success', label: 'Actif' },
  INACTIF: { variant: 'neutral', label: 'Inactif' },
  EN_ATTENTE: { variant: 'pending', label: 'En attente' },
  ACCEPTEE: { variant: 'success', label: 'Acceptée' },
  REFUSEE: { variant: 'error', label: 'Refusée' },
  ANNULEE: { variant: 'cancelled', label: 'Annulée' },
  LISTE_ATTENTE: { variant: 'info', label: "Liste d'attente" },
  PUBLIEE: { variant: 'success', label: 'Publiée' },
  BROUILLON: { variant: 'neutral', label: 'Brouillon' },
  PRESENT: { variant: 'success', label: 'Présent' },
  ABSENT: { variant: 'error', label: 'Absent' },
  RETARD: { variant: 'warning', label: 'Retard' },
  EXCUSE: { variant: 'neutral', label: 'Excusé' },
};

interface StatusBadgeProps {
  status?: string;
  variant?: StatusVariant;
  label?: string;
  icon?: React.ElementType;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  variant,
  label,
  icon,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  // Priorité : status (via map) > variant
  let config: StatusConfig;
  if (status) {
    const mapped = STATUS_MAP[status];
    if (mapped) {
      const base = DEFAULT_STATUSES[mapped.variant];
      config = { ...base, label: mapped.label ?? base.label };
    } else {
      config = { label: status, className: 'bg-odc-surface-alt text-odc-muted' };
    }
  } else {
    config = DEFAULT_STATUSES[variant ?? 'neutral'];
  }

  const Icon = icon ?? config.icon;
  const displayLabel = label ?? config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      {showIcon && Icon && <Icon className="h-3 w-3" />}
      {displayLabel}
    </span>
  );
}