// src/components/ui/badge.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1.5 rounded-full border',
    'px-2.5 py-0.5 text-xs font-medium',
    'transition-colors duration-150',
    'focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:ring-offset-1',
    'whitespace-nowrap',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-orange-500 text-white hover:bg-orange-600',
        secondary:
          'border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
        destructive:
          'border-transparent bg-red-600 text-white hover:bg-red-700',
        success:
          'border-transparent bg-emerald-600 text-white hover:bg-emerald-700',
        warning:
          'border-transparent bg-amber-500 text-white hover:bg-amber-600',
        info:
          'border-transparent bg-sky-600 text-white hover:bg-sky-700',
        outline:
          'border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900',
        'soft-primary':
          'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300',
        'soft-success':
          'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
        'soft-warning':
          'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
        'soft-error':
          'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
        'soft-info':
          'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  ),
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };