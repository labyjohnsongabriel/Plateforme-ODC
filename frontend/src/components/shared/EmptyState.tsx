// src/components/shared/EmptyState.tsx
import * as React from 'react';
import { Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: {
    wrapper: 'py-8',
    iconBox: 'w-12 h-12',
    icon: 'h-6 w-6',
    title: 'text-base',
  },
  md: {
    wrapper: 'py-12',
    iconBox: 'w-16 h-16',
    icon: 'h-8 w-8',
    title: 'text-lg',
  },
  lg: {
    wrapper: 'py-16',
    iconBox: 'w-20 h-20',
    icon: 'h-10 w-10',
    title: 'text-xl',
  },
};

export function EmptyState({
  icon: Icon = Inbox,
  title = 'Aucun résultat',
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const s = SIZES[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-4',
        s.wrapper,
        className,
      )}
      role="status"
    >
      <div
        className={cn(
          'rounded-full bg-odc-surface-alt flex items-center justify-center mb-4',
          s.iconBox,
        )}
      >
        <Icon className={cn('text-odc-muted', s.icon)} />
      </div>

      <h3 className={cn('font-display font-semibold mb-2', s.title)}>
        {title}
      </h3>

      {description && (
        <p className="text-sm text-odc-muted max-w-sm mb-6">
          {description}
        </p>
      )}

      {action}
    </div>
  );
}