import { ReactNode, useState } from 'react';
import { cn } from '@/utils/cn';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({ content, children, side = 'top', delay = 200 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    const id = setTimeout(() => setVisible(true), delay);
    setTimeoutId(id);
  };

  const hide = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setVisible(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-odc-surface-dark dark:border-t-odc-surface-alt-dark',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-odc-surface-dark dark:border-b-odc-surface-alt-dark',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-odc-surface-dark dark:border-l-odc-surface-alt-dark',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-odc-surface-dark dark:border-r-odc-surface-alt-dark',
  };

  return (
    <div className="relative inline-block" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div className={cn('absolute z-50 pointer-events-none animate-fade-in', positions[side])}>
          <div className="px-3 py-2 bg-odc-surface-dark dark:bg-odc-surface-alt-dark text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
            {content}
          </div>
          <div className={cn('absolute w-0 h-0 border-4 border-transparent', arrows[side])} />
        </div>
      )}
    </div>
  );
}