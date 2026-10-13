// src/components/ui/skeleton.tsx
import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-md bg-odc-surface-alt',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };