import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  side = 'right',
  size = 'md',
}: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'w-80',
    md: 'w-96',
    lg: 'w-[500px]',
  };

  const content = (
    <div className="fixed inset-0 z-50 animate-fade-in">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div
        className={cn(
          'absolute top-0 bottom-0 bg-white dark:bg-odc-surface-dark shadow-2xl',
          'flex flex-col max-w-[90vw]',
          'animate-slide-in',
          side === 'right' ? 'right-0' : 'left-0',
          sizes[size]
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-odc-border-light dark:border-odc-border-dark">
            <h2 className="font-heading text-xl font-bold text-odc-text-light dark:text-odc-text-dark">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-odc-surface-alt-light dark:hover:bg-odc-surface-alt-dark"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-odc-border-light dark:border-odc-border-dark">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}