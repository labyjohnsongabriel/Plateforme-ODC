import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function Breadcrumb({ items, showHome = true, className }: BreadcrumbProps) {
  return (
    <nav className={cn('flex items-center gap-2 text-sm', className)} aria-label="Breadcrumb">
      {showHome && (
        <>
          <Link
            to="/dashboard"
            className="flex items-center text-odc-text-muted-light dark:text-odc-text-muted-dark hover:text-odc-primary transition-colors"
          >
            <Home size={14} />
          </Link>
          {items.length > 0 && (
            <ChevronRight size={14} className="text-odc-text-muted-light" />
          )}
        </>
      )}

      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <div key={i} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="flex items-center gap-1.5 text-odc-text-muted-light dark:text-odc-text-muted-dark hover:text-odc-primary transition-colors"
              >
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'flex items-center gap-1.5',
                  isLast
                    ? 'text-odc-text-light dark:text-odc-text-dark font-medium'
                    : 'text-odc-text-muted-light dark:text-odc-text-muted-dark'
                )}
              >
                {item.icon}
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight size={14} className="text-odc-text-muted-light" />
            )}
          </div>
        );
      })}
    </nav>
  );
}