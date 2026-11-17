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
          'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white transition-all',
          'dark:bg-slate-950 dark:text-slate-50 dark:ring-offset-slate-950',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-slate-400 dark:placeholder:text-slate-500',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/30 focus-visible:border-orange-400',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-900',
          error
            ? 'border-red-500 focus-visible:ring-red-400/30 focus-visible:border-red-500 dark:border-red-500'
            : 'border-slate-200 dark:border-slate-700',
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