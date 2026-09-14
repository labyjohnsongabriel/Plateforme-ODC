import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ChipProps {
  children: ReactNode;
  onDelete?: () => void;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  icon?: ReactNode;
  selected?: boolean;
}

export function Chip({
  children,
  onDelete,
  onClick,
  variant = 'default',
  icon,
  selected = false,
}: ChipProps) {
  const variants = {
    default:
      'bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark text-odc-text-light dark:text-odc-text-dark',
    primary: 'bg-odc-primary-soft text-odc-primary-dark',
    success: 'bg-odc-success-bg text-odc-success',
    warning: 'bg-odc-warning-bg text-odc-warning',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
        onClick && 'cursor-pointer hover:opacity-80',
        selected && 'ring-2 ring-odc-primary',
        variants[variant]
      )}
    >
      {icon}
      <span>{children}</span>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}