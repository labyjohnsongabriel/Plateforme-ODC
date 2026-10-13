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

const COLORS = {
  primary: 'bg-odc-primary-soft text-odc-primary',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  green: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  gray: 'bg-odc-surface-alt text-odc-muted',
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
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-5">
          <div className="animate-shimmer h-11 w-11 rounded-lg mb-3" />
          <div className="animate-shimmer h-8 w-24 rounded mb-2" />
          <div className="animate-shimmer h-4 w-32 rounded" />
        </CardContent>
      </Card>
    );
  }

  const trendDirection =
    trend?.direction ?? (trend && trend.value > 0 ? 'up' : trend && trend.value < 0 ? 'down' : 'flat');

  return (
    <Card className={cn('hover:shadow-odc-md transition-shadow', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          {Icon && (
            <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center', COLORS[color])}>
              <Icon className="h-5 w-5" />
            </div>
          )}

          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                trendDirection === 'up' && 'text-odc-success bg-odc-success-bg',
                trendDirection === 'down' && 'text-odc-error bg-odc-error-bg',
                trendDirection === 'flat' && 'text-odc-muted bg-odc-surface-alt',
              )}
            >
              {trendDirection === 'up' && <TrendingUp className="h-3 w-3" />}
              {trendDirection === 'down' && <TrendingDown className="h-3 w-3" />}
              {trendDirection === 'flat' && <Minus className="h-3 w-3" />}
              {trend.value > 0 && '+'}{trend.value}%
            </span>
          )}
        </div>

        <p className="text-3xl font-display font-bold mb-0.5">
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </p>

        <p className="text-sm font-medium">{label}</p>

        {subtitle && (
          <p className="text-xs text-odc-muted mt-0.5">{subtitle}</p>
        )}

        {trend?.label && (
          <p className="text-xs text-odc-muted mt-1">{trend.label}</p>
        )}
      </CardContent>
    </Card>
  );
}