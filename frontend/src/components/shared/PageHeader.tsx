// src/components/shared/PageHeader.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4 mb-6', className)}>
      {breadcrumbs}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          {Icon && (
            <div className="w-12 h-12 rounded-xl bg-odc-primary-soft flex items-center justify-center shrink-0">
              <Icon className="h-6 w-6 text-odc-primary" />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-odc-text-primary truncate">
              {title}
            </h1>
            {description && (
              <p className="text-odc-muted mt-1">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex flex-wrap gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}