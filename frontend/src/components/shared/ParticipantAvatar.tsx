// src/components/shared/ParticipantAvatar.tsx
'use client';

import { useState } from 'react';
import { getMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

interface ParticipantAvatarProps {
  prenom?: string | null;
  nom?: string | null;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-10 w-10 text-sm',
};

export function ParticipantAvatar({
  prenom,
  nom,
  photoUrl,
  size = 'md',
  className,
}: ParticipantAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const initials =
    `${prenom?.[0] ?? '?'}${nom?.[0] ?? ''}`.toUpperCase() || '?';

  const raw = photoUrl?.trim();
  const src =
    !imageError && raw
      ? /^https?:\/\//i.test(raw)
        ? raw
        : getMediaUrl(raw)
      : null;

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'bg-gradient-to-br from-slate-700 to-slate-900 font-semibold text-white',
        'ring-2 ring-white dark:ring-slate-900',
        SIZES[size],
        className,
      )}
    >
      {(!src || !imageLoaded) && <span aria-hidden>{initials}</span>}

      {src && (
        <img
          src={src}
          alt={`${prenom ?? ''} ${nom ?? ''}`.trim() || 'Avatar'}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-200',
            imageLoaded ? 'opacity-100' : 'opacity-0',
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
          loading="lazy"
        />
      )}
    </div>
  );
}