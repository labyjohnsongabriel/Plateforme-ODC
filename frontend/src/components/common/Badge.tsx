import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'orange';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: ReactNode;
  rounded?: boolean;
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon,
  rounded = true,
}: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    primary: 'bg-odc-primary-soft text-odc-primary-dark dark:bg-odc-primary-soft/20 dark:text-odc-primary-light',
    orange: 'bg-odc-primary text-white',
    success: 'bg-odc-success-bg text-odc-success',
    warning: 'bg-odc-warning-bg text-odc-warning',
    error: 'bg-odc-error-bg text-odc-error',
    info: 'bg-odc-info-bg text-odc-info',
    neutral:
      'bg-odc-surface-alt-light text-odc-text-muted-light dark:bg-odc-surface-alt-dark dark:text-odc-text-muted-dark',
  };

  const sizes: Record<BadgeSize, string> = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold',
        rounded ? 'rounded-full' : 'rounded',
        variants[variant],
        sizes[size]
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {icon}
      {children}
    </span>
  );
}