import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface FormSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3;
}

export function FormSection({
  title,
  description,
  icon,
  children,
  className,
  columns = 2,
}: FormSectionProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header de section */}
      <div className="flex items-start gap-3 pb-3 border-b border-odc-border-light dark:border-odc-border-dark">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-odc-primary-soft dark:bg-odc-primary-soft/20 flex items-center justify-center text-odc-primary-dark dark:text-odc-primary-light">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-base text-odc-text-light dark:text-odc-text-dark">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className={cn('grid gap-4', gridCols[columns])}>{children}</div>
    </div>
  );
}