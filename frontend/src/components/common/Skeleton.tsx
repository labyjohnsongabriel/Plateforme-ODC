import { cn } from '@/utils/cn';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  return (
    <div
      style={{ width, height }}
      className={cn(
        'bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark',
        variants[variant],
        animations[animation],
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="p-6 bg-white dark:bg-odc-surface-dark rounded-xl border border-odc-border-light dark:border-odc-border-dark">
      <Skeleton width="40%" height={20} className="mb-4" />
      <Skeleton width="100%" className="mb-2" />
      <Skeleton width="80%" className="mb-2" />
      <Skeleton width="60%" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 bg-white dark:bg-odc-surface-dark rounded-lg"
        >
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1">
            <Skeleton width="60%" className="mb-2" />
            <Skeleton width="40%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}