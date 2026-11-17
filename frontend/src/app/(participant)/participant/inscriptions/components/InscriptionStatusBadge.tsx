// src/app/(participant)/participant/inscriptions/components/InscriptionStatusBadge.tsx
'use client';

import {
  Hourglass,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeConfig {
  label: string;
  icon: LucideIcon;
  className: string;
}

const CONFIG: Record<string, BadgeConfig> = {
  EN_ATTENTE: {
    label: 'En attente',
    icon: Hourglass,
    className:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  },
  ACCEPTEE: {
    label: 'Acceptée',
    icon: CheckCircle2,
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  REFUSEE: {
    label: 'Refusée',
    icon: XCircle,
    className:
      'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
  },
  LISTE_ATTENTE: {
    label: "Liste d'attente",
    icon: Clock,
    className:
      'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
  },
  ANNULEE: {
    label: 'Annulée',
    icon: Ban,
    className:
      'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
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
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {config.label}
    </span>
  );
}