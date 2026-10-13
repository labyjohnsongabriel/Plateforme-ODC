// src/components/shared/LoadingSpinner.tsx
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

const SIZES = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
  xl: 'h-16 w-16',
};

export function LoadingSpinner({
  size = 'md',
  label,
  fullScreen = false,
  className,
}: Props) {
  const spinner = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullScreen && 'min-h-screen',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className={cn('animate-spin text-odc-primary', SIZES[size])} />
      {label && <p className="text-sm text-odc-muted">{label}</p>}
      <span className="sr-only">{label ?? 'Chargement…'}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}