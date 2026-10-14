// src/app/(admin)/admin/attestations/components/VerificationBadge.tsx
'use client';

import { ShieldCheck, ShieldX, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerificationBadgeProps {
  hashVerification?: string;
  valide: boolean;
  size?: 'sm' | 'md';
}

export function VerificationBadge({
  hashVerification,
  valide,
  size = 'sm',
}: VerificationBadgeProps) {
  if (!hashVerification) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-inset',
          'bg-odc-surface-alt text-odc-text-muted ring-odc-border',
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        )}
      >
        <Shield
          className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')}
        />
        Non vérifiable
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold ring-1 ring-inset',
        valide
          ? 'bg-odc-success-soft text-odc-success-dark ring-odc-success/30'
          : 'bg-odc-error-soft text-odc-error-dark ring-odc-error/30',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
      )}
    >
      {valide ? (
        <ShieldCheck
          className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')}
        />
      ) : (
        <ShieldX
          className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')}
        />
      )}
      {valide ? 'Vérifiable' : 'Invalidée'}
    </span>
  );
}