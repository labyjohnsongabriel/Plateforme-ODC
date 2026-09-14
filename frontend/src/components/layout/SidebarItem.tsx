import { Link, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SidebarItemProps {
  to: string;
  label: string;
  icon: ReactNode;
  badge?: string | number;
  collapsed?: boolean;
}

export function SidebarItem({ to, label, icon, badge, collapsed = false }: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={cn(
        'group relative flex items-center gap-3',
        'rounded-xl transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-odc-primary',
        collapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5',
        isActive
          ? 'bg-gradient-to-r from-odc-primary to-odc-primary-dark text-white shadow-odc-md'
          : 'text-odc-text-light dark:text-odc-text-dark hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20'
      )}
    >
      {/* Indicateur actif (barre verticale) */}
      {isActive && (
        <span
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6',
            'bg-white rounded-r-full',
            collapsed ? 'left-0' : 'left-0'
          )}
        />
      )}

      {/* Icon */}
      <span
        className={cn(
          'flex-shrink-0 transition-transform group-hover:scale-110',
          isActive ? 'text-white' : 'text-odc-primary'
        )}
      >
        {icon}
      </span>

      {/* Label + Badge */}
      {!collapsed && (
        <>
          <span className="flex-1 text-sm font-medium truncate">{label}</span>
          {badge !== undefined && (
            <span
              className={cn(
                'flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full',
                'text-[10px] font-bold flex items-center justify-center',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-odc-primary text-white'
              )}
            >
              {badge}
            </span>
          )}
        </>
      )}

      {/* Badge (collapsed) */}
      {collapsed && badge !== undefined && (
        <span
          className={cn(
            'absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full',
            'text-[9px] font-bold flex items-center justify-center',
            'bg-odc-error text-white border-2 border-white dark:border-odc-surface-dark'
          )}
        >
          {badge}
        </span>
      )}

      {/* Tooltip (collapsed) */}
      {collapsed && (
        <div
          className={cn(
            'absolute left-full ml-2 px-3 py-1.5 rounded-lg',
            'bg-odc-surface-dark dark:bg-odc-surface-alt-dark text-white text-xs font-medium whitespace-nowrap',
            'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
            'transition-all duration-200 z-50 pointer-events-none',
            'shadow-lg'
          )}
        >
          {label}
          {badge !== undefined && <span className="ml-2 text-odc-primary-light">({badge})</span>}
        </div>
      )}
    </Link>
  );
}