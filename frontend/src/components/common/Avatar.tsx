import { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/utils/cn';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
  rounded?: boolean;
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  status,
  className,
  rounded = true,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const sizes: Record<AvatarSize, string> = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl',
  };

  const statusSizes: Record<AvatarSize, string> = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  const statusColors = {
    online: 'bg-odc-success',
    offline: 'bg-gray-400',
    away: 'bg-odc-warning',
    busy: 'bg-odc-error',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const showFallback = !src || imgError;

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden',
          'bg-gradient-to-br from-odc-primary to-odc-primary-dark',
          'text-white font-semibold flex-shrink-0',
          rounded ? 'rounded-full' : 'rounded-xl',
          sizes[size],
          className
        )}
      >
        {showFallback ? (
          name ? (
            <span>{getInitials(name)}</span>
          ) : (
            <User size="60%" />
          )
        ) : (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-odc-surface-dark',
            statusSizes[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}