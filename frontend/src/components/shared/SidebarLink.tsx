// src/components/shared/SidebarLink.tsx
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Props {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  collapsed: boolean;
  badge?: number;
  onClick?: () => void;
}

export function SidebarLink({
  href, label, icon: Icon, active, collapsed, badge, onClick,
}: Props) {
  const hasBadge = typeof badge === 'number' && badge > 0;

  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
        'dark:focus-visible:ring-slate-600 dark:focus-visible:ring-offset-slate-950',
        active
          ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-50',
        collapsed && 'justify-center',
      )}
    >
      {/* Indicateur actif — barre verticale noire */}
      {active && (
        <span
          className={cn(
            'absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-slate-900 dark:bg-slate-50',
            collapsed && 'hidden',
          )}
          aria-hidden
        />
      )}

      <Icon
        className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          active
            ? 'text-slate-900 dark:text-slate-50'
            : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200',
        )}
        aria-hidden
      />

      {!collapsed && <span className="truncate">{label}</span>}

      {/* Badge (non lus, etc.) — noir */}
      {!collapsed && hasBadge && (
        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 text-[10px] font-semibold text-white dark:bg-slate-50 dark:text-slate-900">
          {badge > 99 ? '99+' : badge}
        </span>
      )}

      {/* Badge en mode replié — pastille */}
      {collapsed && hasBadge && (
        <span
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-slate-900 ring-2 ring-white dark:bg-slate-50 dark:ring-slate-950"
          aria-label={`${badge} non lus`}
        />
      )}
    </Link>
  );
}