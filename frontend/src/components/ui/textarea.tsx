// src/components/ui/textarea.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[100px] w-full rounded-md border bg-odc-surface px-3 py-2 text-sm text-odc-text-primary ring-offset-background transition-all',
          'placeholder:text-odc-muted',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-odc-primary/30 focus-visible:border-odc-primary',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-odc-surface-alt',
          'resize-y scrollbar-thin',
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
Textarea.displayName = 'Textarea';

export { Textarea };