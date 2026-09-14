import { cn } from '@/utils/cn';

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variants = {
    primary: 'bg-odc-primary',
    success: 'bg-odc-success',
    warning: 'bg-odc-warning',
    error: 'bg-odc-error',
  };

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5 text-xs font-medium">
          <span className="text-odc-text-light dark:text-odc-text-dark">
            {label || 'Progression'}
          </span>
          {showLabel && (
            <span className="text-odc-text-muted-light dark:text-odc-text-muted-dark">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded-full overflow-hidden',
          sizes[size]
        )}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', variants[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}