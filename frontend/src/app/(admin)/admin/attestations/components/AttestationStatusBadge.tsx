// src/app/(admin)/admin/attestations/components/AttestationStatusBadge.tsx
'use client';

import * as React from 'react';
import { CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

export type StatutAttestation =
  | 'VALIDE'
  | 'INVALIDE'
  | 'EN_ATTENTE'
  | 'BROUILLON';

interface Props {
  statut: StatutAttestation;
  size?: 'sm' | 'md';
  /** Affiche uniquement l'icône (compact) */
  iconOnly?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════════════════ */

const CONFIG: Record<
  StatutAttestation,
  {
    label: string;
    icon: React.ElementType;
    className: string;
    ariaLabel: string;
  }
> = {
  VALIDE: {
    label: 'Valide',
    icon: CheckCircle2,
    className:
      'bg-odc-success-soft text-odc-success-dark ring-odc-success/30',
    ariaLabel: 'Attestation valide',
  },
  INVALIDE: {
    label: 'Invalide',
    icon: XCircle,
    className: 'bg-odc-error-soft text-odc-error-dark ring-odc-error/30',
    ariaLabel: 'Attestation invalide',
  },
  EN_ATTENTE: {
    label: 'En attente',
    icon: Clock,
    className:
      'bg-odc-warning-soft text-odc-warning-dark ring-odc-warning/30',
    ariaLabel: 'Attestation en attente',
  },
  BROUILLON: {
    label: 'Brouillon',
    icon: FileText,
    className:
      'bg-odc-surface-alt text-odc-text-secondary ring-odc-border',
    ariaLabel: 'Attestation en brouillon',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function AttestationStatusBadge({
  statut,
  size = 'sm',
  iconOnly = false,
}: Props) {
  const config = CONFIG[statut] ?? CONFIG.EN_ATTENTE;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        config.className,
      )}
      aria-label={config.ariaLabel}
      role="status"
    >
      <Icon
        className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')}
        aria-hidden="true"
      />
      {!iconOnly && <span>{config.label}</span>}
    </span>
  );
}