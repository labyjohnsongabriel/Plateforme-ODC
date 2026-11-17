'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  PRESENT: 'bg-odc-success-soft text-odc-success-dark',
  ABSENT: 'bg-odc-error-soft text-odc-error-dark',
  RETARD: 'bg-odc-warning-soft text-odc-warning-dark',
  EXCUSE: 'bg-odc-surface-alt text-odc-text-secondary',
};

const STATUS_LABELS: Record<string, string> = {
  PRESENT: 'Présent',
  ABSENT: 'Absent',
  RETARD: 'En retard',
  EXCUSE: 'Excusé',
};

interface PresenceStatusBadgeProps {
  statut: string;
  size?: 'sm' | 'md';
}

export function PresenceStatusBadge({
  statut,
  size = 'sm',
}: PresenceStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-transparent font-medium',
        STATUS_STYLES[statut] ?? 'bg-odc-surface-alt text-odc-text-secondary',
        size === 'md' && 'px-3 py-1 text-sm',
      )}
    >
      {STATUS_LABELS[statut] ?? statut}
    </Badge>
  );
}
