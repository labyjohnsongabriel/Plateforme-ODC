// src/components/ui/input.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border bg-odc-surface px-3 py-2 text-sm text-odc-text-primary ring-offset-background transition-all',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-odc-muted',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-odc-primary/30 focus-visible:border-odc-primary',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-odc-surface-alt',
          error
            ? 'border-odc-error focus-visible:ring-odc-error/30'
            : 'border-odc-border',
          className,
        )}
        ref={ref}
        aria-invalid={error}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };