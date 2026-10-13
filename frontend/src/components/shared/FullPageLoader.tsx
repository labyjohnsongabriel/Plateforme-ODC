// src/components/shared/FullPageLoader.tsx
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FullPageLoaderProps {
  message?: string;
  className?: string;
}

export function FullPageLoader({
  message = 'Chargement…',
  className,
}: FullPageLoaderProps) {
  return (
    <div
      className={cn(
        'min-h-screen flex flex-col items-center justify-center gap-4 bg-background',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-odc-border/30 border-t-odc-primary animate-spin" />
        <Loader2 className="absolute inset-0 m-auto h-6 w-6 text-odc-primary animate-pulse" />
      </div>

      <p className="text-sm text-odc-muted font-medium">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
}