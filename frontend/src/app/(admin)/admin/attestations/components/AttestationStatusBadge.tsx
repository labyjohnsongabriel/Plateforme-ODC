// src/app/(admin)/admin/attestations/components/AttestationStatusBadge.tsx
'use client';

import { CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatutAttestation = 'VALIDE' | 'INVALIDE' | 'EN_ATTENTE' | 'BROUILLON';

interface AttestationStatusBadgeProps {
  statut: StatutAttestation;
  size?: 'sm' | 'md';
}

const CONFIG: Record<
  StatutAttestation,
  { label: string; icon: React.ElementType; className: string }
> = {
  VALIDE: {
    label: 'Valide',
    icon: CheckCircle2,
    className: 'bg-odc-success-soft text-odc-success-dark ring-odc-success/30',
  },
  INVALIDE: {
    label: 'Invalide',
    icon: XCircle,
    className: 'bg-odc-error-soft text-odc-error-dark ring-odc-error/30',
  },
  EN_ATTENTE: {
    label: 'En attente',
    icon: Clock,
    className: 'bg-odc-warning-soft text-odc-warning-dark ring-odc-warning/30',
  },
  BROUILLON: {
    label: 'Brouillon',
    icon: FileText,
    className: 'bg-odc-surface-alt text-odc-text-secondary ring-odc-border',
  },
};

export function AttestationStatusBadge({
  statut,
  size = 'sm',
}: AttestationStatusBadgeProps) {
  const config = CONFIG[statut] ?? CONFIG.EN_ATTENTE;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        config.className,
      )}
    >
      <Icon
        className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}