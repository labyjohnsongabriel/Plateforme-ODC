// src/app/(admin)/admin/audit-logs/components/AuditLogSeverityBadge.tsx
'use client';

import { Info, AlertTriangle, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SeveriteAudit } from '@/hooks/useAuditLogs';

interface AuditLogSeverityBadgeProps {
  severite: SeveriteAudit;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const CONFIG: Record<
  SeveriteAudit,
  { label: string; icon: React.ElementType; className: string }
> = {
  INFO: {
    label: 'Info',
    icon: Info,
    className: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  WARNING: {
    label: 'Attention',
    icon: AlertTriangle,
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  CRITICAL: {
    label: 'Critique',
    icon: AlertOctagon,
    className: 'bg-red-50 text-red-700 ring-red-200',
  },
};

export function AuditLogSeverityBadge({
  severite,
  showLabel = true,
  size = 'sm',
}: AuditLogSeverityBadgeProps) {
  const config = CONFIG[severite] ?? CONFIG.INFO;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        config.className,
      )}
      aria-label={`Sévérité : ${config.label}`}
    >
      <Icon
        className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')}
        aria-hidden="true"
      />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}