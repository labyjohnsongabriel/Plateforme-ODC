// src/components/shared/UserAvatar.tsx
'use client';

import * as React from 'react';
import { getMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: {
    nom?: string;
    prenom?: string;
    photoUrl?: string | null;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  className?: string;
}

const SIZES = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-14 w-14 text-sm',
  xl: 'h-24 w-24 text-2xl',
};

export function UserAvatar({
  user,
  size = 'md',
  showStatus = false,
  className,
}: UserAvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const initials =
    `${user.prenom?.charAt(0) ?? ''}${user.nom?.charAt(0) ?? ''}`.toUpperCase() ||
    '?';

  const photoSrc =
    !imageError && user.photoUrl ? getMediaUrl(user.photoUrl) : null;

  return (
    <div className={cn('relative shrink-0', className)}>
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full',
          'bg-gradient-to-br from-slate-700 to-slate-900 font-semibold text-white',
          'ring-2 ring-white dark:ring-slate-800',
          SIZES[size],
        )}
      >
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={`${user.prenom ?? ''} ${user.nom ?? ''}`.trim() || 'Avatar'}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span aria-hidden>{initials}</span>
        )}
      </div>

      {showStatus && (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900"
          aria-label="En ligne"
        />
      )}
    </div>
  );
}