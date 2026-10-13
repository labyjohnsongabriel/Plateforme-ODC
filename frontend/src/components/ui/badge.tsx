// src/components/ui/badge.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-odc-primary/30',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-odc-primary text-white hover:bg-odc-primary-dark',
        secondary:
          'border-transparent bg-odc-surface-alt text-odc-text-secondary',
        destructive:
          'border-transparent bg-odc-error text-white hover:bg-odc-error/90',
        success:
          'border-transparent bg-odc-success text-white hover:bg-odc-success/90',
        warning:
          'border-transparent bg-odc-warning text-white hover:bg-odc-warning/90',
        info:
          'border-transparent bg-odc-info text-white hover:bg-odc-info/90',
        outline:
          'border-odc-border text-odc-text-primary bg-odc-surface',
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

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };