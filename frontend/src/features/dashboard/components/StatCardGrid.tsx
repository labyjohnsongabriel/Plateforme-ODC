import type { KPI, KPIVariant } from '../types/dashboard.types';
import { cn } from '@/utils/cn';

export interface StatCardGridProps {
  kpis: KPI[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

const variantClasses: Record<KPIVariant, string> = {
  primary: 'text-odc-primary bg-odc-primary/10',
  success: 'text-odc-success bg-odc-success/10',
  warning: 'text-odc-warning bg-odc-warning/10',
  error: 'text-odc-error bg-odc-error/10',
  info: 'text-odc-info bg-odc-info/10',
  purple: 'text-purple-600 bg-purple-100',
  neutral: 'text-odc-text-muted-light bg-odc-border-light/40',
};

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const;

export function StatCardGrid({
  kpis,
  columns = 4,
  className,
}: StatCardGridProps) {
  if (!kpis || kpis.length === 0) return null;

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {kpis.map((kpi, index) => (
        <div
          key={`${kpi.label}-${index}`}
          onClick={kpi.onClick}
          className={cn(
            'bg-white dark:bg-odc-surface-dark rounded-xl border border-odc-border-light dark:border-odc-border-dark p-5 transition-all',
            kpi.onClick &&
              'cursor-pointer hover:shadow-odc-md hover:-translate-y-0.5'
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-medium text-odc-text-muted-light dark:text-odc-text-muted-dark">
              {kpi.label}
            </p>
            {kpi.icon && (
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg',
                  variantClasses[kpi.variant ?? 'primary']
                )}
              >
                {kpi.icon}
              </div>
            )}
          </div>

          <p className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark">
            {kpi.value}
          </p>

          {(kpi.trend || kpi.subtitle) && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              {kpi.trend && (
                <span
                  className={cn(
                    'font-medium',
                    kpi.trend.isPositive
                      ? 'text-odc-success'
                      : 'text-odc-error'
                  )}
                >
                  {kpi.trend.isPositive ? '↑' : '↓'}{' '}
                  {Math.abs(kpi.trend.value)}%
                </span>
              )}
              {kpi.subtitle && (
                <span className="text-odc-text-muted-light dark:text-odc-text-muted-dark">
                  {kpi.subtitle}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default StatCardGrid;