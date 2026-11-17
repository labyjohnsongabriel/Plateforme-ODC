'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/chart-theme';
import { cn } from '@/lib/utils';
import { Sparkline } from './Sparkline';
import { TONES, type Tone } from './tones';
import { TrendChip } from './TrendChip';

export type StatCardVariant = Tone;

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  variant?: StatCardVariant;
  trend?: {
    value: number;
    /** Jugement métier (une baisse peut être favorable). Défaut : hausse = favorable. */
    isPositive?: boolean;
    label?: string;
  };
  subtitle?: string;
  /** Historique court pour afficher une mini-courbe. */
  sparkline?: number[];
  /** Rend la carte cliquable comme un vrai lien. */
  href?: string;
  /** Rend la carte cliquable comme un vrai bouton. */
  onClick?: () => void;
  className?: string;
  loading?: boolean;
}

/**
 * Base commune : surface `card` shadcn (cohérent avec <Card>, PanelCard, etc.),
 * bordure `border`, focus ring `ring`.
 */
const CARD_BASE = cn(
  'group relative block w-full rounded-xl border border-border bg-card p-5 text-left shadow-sm',
  // Accessibilité clavier : ring cohérent sur les 3 modes (lien, bouton, div)
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
);

const CARD_INTERACTIVE = cn(
  'transition-[box-shadow,transform,border-color] duration-200',
  'hover:border-primary/30 hover:shadow-md',
  'motion-safe:hover:-translate-y-0.5',
);

export function StatCard({
  label,
  value,
  icon,
  variant = 'primary',
  trend,
  subtitle,
  sparkline,
  href,
  onClick,
  className,
  loading,
}: StatCardProps) {
  if (loading) {
    return (
      <div
        className={cn(CARD_BASE, className)}
        aria-busy="true"
        aria-label="Chargement de l’indicateur"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="mt-4 h-9 w-32" />
        <Skeleton className="mt-3 h-5 w-24 rounded-full" />
      </div>
    );
  }

  const tone = TONES[variant];
  const interactive = Boolean(href || onClick);
  const displayValue = typeof value === 'number' ? formatNumber(value) : value;
  const footnote = [trend?.label, subtitle].filter(Boolean).join(' · ');

  const body = (
    <>
      {/* En-tête : icône + label + flèche */}
      <div className="flex items-center gap-3">
        {icon && (
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              tone.chip,
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-muted-foreground">
          {label}
        </p>
        {interactive && (
          <ArrowUpRight
            className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity',
              'group-hover:opacity-100 group-focus-visible:opacity-100',
            )}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Valeur + sparkline */}
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="min-w-0 truncate font-display text-3xl font-bold tracking-tight tabular-nums text-foreground">
          {displayValue}
        </p>
        {sparkline && sparkline.length > 1 && (
          <Sparkline values={sparkline} stroke={tone.stroke} />
        )}
      </div>

      {/* Pied : trend + footnote */}
      {(trend || footnote) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {trend && (
            <TrendChip
              value={trend.value}
              isPositive={trend.isPositive}
              periodLabel={trend.label}
            />
          )}
          {footnote && <span>{footnote}</span>}
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn(CARD_BASE, CARD_INTERACTIVE, className)}>
        {body}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(CARD_BASE, CARD_INTERACTIVE, 'cursor-pointer', className)}
      >
        {body}
      </button>
    );
  }

  return <div className={cn(CARD_BASE, className)}>{body}</div>;
}