import { ReactNode, useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  selected?: boolean;
  danger?: boolean;
}

export function DropdownItem({ children, onClick, icon, disabled, selected, danger }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors',
        'text-odc-text-light dark:text-odc-text-dark',
        'hover:bg-odc-surface-alt-light dark:hover:bg-odc-surface-alt-dark',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        danger && 'text-odc-error hover:bg-odc-error-bg',
        selected && 'bg-odc-primary-soft dark:bg-odc-primary-soft/20 font-medium'
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
      {selected && <Check size={14} className="text-odc-primary flex-shrink-0" />}
    </button>
  );
}

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'absolute top-full mt-2 min-w-[200px] p-1.5 z-50',
            'bg-white dark:bg-odc-surface-dark',
            'border border-odc-border-light dark:border-odc-border-dark',
            'rounded-xl shadow-odc-lg animate-slide-in',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownDivider() {
  return <div className="my-1 h-px bg-odc-border-light dark:bg-odc-border-dark" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-odc-text-muted-light dark:text-odc-text-muted-dark">
      {children}
    </div>
  );
}