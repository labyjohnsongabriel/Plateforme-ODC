import { ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';

export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Popover({ trigger, children, align = 'end', side = 'bottom', className }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const sides = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  const aligns = {
    start: side === 'left' || side === 'right' ? '' : 'left-0',
    center: side === 'left' || side === 'right' ? '' : 'left-1/2 -translate-x-1/2',
    end: side === 'left' || side === 'right' ? '' : 'right-0',
  };

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'absolute z-50 min-w-[200px] p-2',
            'bg-white dark:bg-odc-surface-dark',
            'border border-odc-border-light dark:border-odc-border-dark',
            'rounded-xl shadow-odc-lg animate-slide-in',
            sides[side],
            aligns[align],
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}