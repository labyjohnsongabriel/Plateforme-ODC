import { ReactNode } from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({ variant = 'info', title, children, onClose, className }: AlertProps) {
  const variants = {
    info: {
      container: 'bg-odc-info-bg border-odc-info/30 text-odc-info',
      icon: <Info size={20} />,
    },
    success: {
      container: 'bg-odc-success-bg border-odc-success/30 text-odc-success',
      icon: <CheckCircle size={20} />,
    },
    warning: {
      container: 'bg-odc-warning-bg border-odc-warning/30 text-odc-warning',
      icon: <AlertTriangle size={20} />,
    },
    error: {
      container: 'bg-odc-error-bg border-odc-error/30 text-odc-error',
      icon: <XCircle size={20} />,
    },
  };

  const v = variants[variant];

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 p-4 rounded-xl border',
        v.container,
        className
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{v.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-0.5 hover:opacity-70 transition-opacity"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}