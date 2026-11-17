'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Props {
  label?: string;
  compact?: boolean;
  showLogo?: boolean;
  className?: string;
}

export function PageLoader({
  label = 'Chargement…',
  compact = false,
  showLogo = true,
  className,
}: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        'flex flex-col items-center justify-center gap-4 bg-odc-background',
        compact ? 'py-12' : 'min-h-[60vh]',
        className,
      )}
    >
      {showLogo && (
        <div className="relative flex h-16 w-16 items-center justify-center">
          {/* Ripple */}
          <div className="absolute inset-0 animate-ripple rounded-full border-2 border-odc-primary/30" />

          {/* Logo */}
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-odc-md ring-1 ring-odc-border/60">
            <Image
              src="/images/brand/logo-odc.jpeg"
              alt=""
              width={48}
              height={48}
              priority
              className="h-full w-full object-contain p-1"
            />
          </div>
        </div>
      )}

      {!showLogo && (
        <div className="relative flex h-10 w-10 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-odc-border/50" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-odc-primary border-r-odc-primary" />
          <div className="h-1.5 w-1.5 rounded-full bg-odc-primary" />
        </div>
      )}

      <p className="text-sm font-medium text-odc-text-secondary">{label}</p>
      <span className="sr-only">{label}</span>
    </div>
  );
}