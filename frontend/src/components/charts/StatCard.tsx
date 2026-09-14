import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/utils/cn';

export type StatCardVariant = 'primary' | 'success' | 'warning' | 'info' | 'error' | 'purple';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  variant?: StatCardVariant;
  trend?: {
    value: number;
    isPositive?: boolean;
    label?: string;
  };
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  icon,
  variant = 'primary',
  trend,
  subtitle,
  onClick,
  className,
  loading,
}: StatCardProps) {
  const variants: Record<StatCardVariant, { bg: string; text: string; gradient: string }> = {
    primary: {
      bg: 'bg-odc-primary-soft dark:bg-odc-primary-soft/20',
      text: 'text-odc-primary-dark dark:text-odc-primary-light',
      gradient: 'from-odc-primary to-odc-primary-dark',
    },
    success: {
      bg: 'bg-odc-success-bg',
      text: 'text-odc-success',
      gradient: 'from-green-500 to-green-700',
    },
    warning: {
      bg: 'bg-odc-warning-bg',
      text: 'text-odc-warning',
      gradient: 'from-orange-400 to-orange-600',
    },
    info: {
      bg: 'bg-odc-info-bg',
      text: 'text-odc-info',
      gradient: 'from-blue-500 to-blue-700',
    },
    error: {
      bg: 'bg-odc-error-bg',
      text: 'text-odc-error',
      gradient: 'from-red-500 to-red-700',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      text: 'text-purple-700 dark:text-purple-300',
      gradient: 'from-purple-500 to-purple-700',
    },
  };

  const v = variants[variant];

  if (loading) {
    return (
      <div className="bg-white dark:bg-odc-surface-dark border border-odc-border-light dark:border-odc-border-dark rounded-xl p-5">
        <div className="animate-pulse">
          <div className="h-3 bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded w-1/2 mb-3" />
          <div className="h-8 bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded w-2/3 mb-2" />
          <div className="h-3 bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded w-1/3" />
        </div>
      </div>
    );
  }

  const trendIcon =
    trend &&
    (trend.value > 0 ? (
      <TrendingUp size={12} />
    ) : trend.value < 0 ? (
      <TrendingDown size={12} />
    ) : (
      <Minus size={12} />
    ));

  const trendColor =
    trend && trend.value > 0
      ? 'text-odc-success'
      : trend && trend.value < 0
      ? 'text-odc-error'
      : 'text-odc-text-muted-light dark:text-odc-text-muted-dark';

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden',
        'bg-white dark:bg-odc-surface-dark',
        'border border-odc-border-light dark:border-odc-border-dark',
        'rounded-xl p-5 transition-all duration-300',
        onClick && 'cursor-pointer hover:shadow-odc-md hover:-translate-y-0.5',
        className
      )}
    >
      {/* Bande décorative */}
      <div
        className={cn(
          'absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20 -translate-y-1/2 translate-x-1/2',
          v.bg
        )}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-odc-text-muted-light dark:text-odc-text-muted-dark uppercase tracking-wider">
            {label}
          </p>

          <p className="mt-2 font-heading text-3xl font-bold text-odc-text-light dark:text-odc-text-dark truncate">
            {value}
          </p>

          {(trend || subtitle) && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {trend && (
                <span className={cn('flex items-center gap-1 text-xs font-semibold', trendColor)}>
                  {trendIcon}
                  {Math.abs(trend.value)}%
                </span>
              )}
              {trend?.label && (
                <span className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
                  {trend.label}
                </span>
              )}
              {subtitle && !trend && (
                <span className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div
            className={cn(
              'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
              'transition-transform group-hover:scale-110',
              v.bg,
              v.text
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}