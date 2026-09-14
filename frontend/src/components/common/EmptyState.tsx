import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="mb-4 p-4 rounded-2xl bg-odc-primary-soft dark:bg-odc-primary-soft/20">
        <div className="text-odc-primary">
          {icon || <Inbox size={40} />}
        </div>
      </div>
      <h3 className="font-heading text-lg font-semibold mb-2 text-odc-text-light dark:text-odc-text-dark">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark max-w-md mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}