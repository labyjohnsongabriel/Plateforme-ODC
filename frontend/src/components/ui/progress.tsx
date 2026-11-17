// src/components/ui/progress.tsx
'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

const VARIANT_STYLES: Record<NonNullable<ProgressProps['variant']>, string> = {
  default: 'bg-orange-500',
  success: 'bg-emerald-600',
  warning: 'bg-amber-500',
  error: 'bg-red-600',
  info: 'bg-sky-600',
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    { className, value, indicatorClassName, variant = 'default', ...props },
    ref,
  ) => {
    const safeValue = Math.max(0, Math.min(100, value ?? 0));

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800',
          className,
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full w-full flex-1 rounded-full transition-all duration-500 ease-out',
            VARIANT_STYLES[variant],
            indicatorClassName,
          )}
          style={{ transform: `translateX(-${100 - safeValue}%)` }}
        />
      </ProgressPrimitive.Root>
    );
  },
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };