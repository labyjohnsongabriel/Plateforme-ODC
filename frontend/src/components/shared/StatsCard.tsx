// src/components/shared/StatsCard.tsx
import * as React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  color?: 'primary' | 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'gray';
  trend?: {
    value: number;
    direction?: 'up' | 'down' | 'flat';
    label?: string;
  };
  className?: string;
  loading?: boolean;
}

/* Palette : primary en ORANGE, autres accents sémantiques sobres */
const COLORS: Record<NonNullable<StatsCardProps['color']>, string> = {
  primary:
    'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  green:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  purple:
    'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  red: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300',
  yellow:
    'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  gray: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export function StatsCard({
  label,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  trend,
  className,
  loading,
}: StatsCardProps) {
  /* ── Skeleton ───────────────────────────────────────────── */
  if (loading) {
    return (
      <Card
        className={cn(
          'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950',
          className,
        )}
      >
        <CardContent className="p-5">
          <div className="mb-3 h-11 w-11 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          <div className="mb-2 h-8 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-4 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        </CardContent>
      </Card>
    );
  }

  /* ── Direction de la tendance ───────────────────────────── */
  const trendDirection =
    trend?.direction ??
    (trend && trend.value > 0
      ? 'up'
      : trend && trend.value < 0
        ? 'down'
        : 'flat');

  const trendStyles = {
    up: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/50',
    down: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950/50',
    flat: 'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800',
  } as const;

  const TrendIcon =
    trendDirection === 'up'
      ? TrendingUp
      : trendDirection === 'down'
        ? TrendingDown
        : Minus;

  return (
    <Card
      className={cn(
        'border-slate-200 bg-white transition-shadow hover:shadow-md',
        'dark:border-slate-800 dark:bg-slate-950 dark:hover:shadow-lg dark:hover:shadow-slate-900/50',
        className,
      )}
    >
      <CardContent className="p-5">
        {/* En-tête : icône + tendance */}
        <div className="mb-3 flex items-start justify-between">
          {Icon && (
            <div
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-lg',
                COLORS[color],
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </div>
          )}

          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                trendStyles[trendDirection],
              )}
              aria-label={`Tendance : ${trendDirection === 'up' ? 'hausse' : trendDirection === 'down' ? 'baisse' : 'stable'} de ${Math.abs(trend.value)}%`}
            >
              <TrendIcon className="h-3 w-3" aria-hidden />
              {trend.value > 0 && '+'}
              {trend.value}%
            </span>
          )}
        </div>

        {/* Valeur */}
        <p className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </p>

        {/* Label */}
        <p className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </p>

        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}

        {trend?.label && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}