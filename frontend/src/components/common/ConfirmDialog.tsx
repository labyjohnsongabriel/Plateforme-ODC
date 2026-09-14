import { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'primary',
  loading = false,
}: ConfirmDialogProps) {
  const iconColor = {
    danger: 'text-odc-error',
    primary: 'text-odc-primary',
    warning: 'text-odc-warning',
  }[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      hideCloseButton
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 p-3 rounded-full bg-current/10 ${iconColor}`}>
          <AlertTriangle size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-bold text-lg mb-1 text-odc-text-light dark:text-odc-text-dark">
            {title}
          </h3>
          <div className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
            {message}
          </div>
        </div>
      </div>
    </Modal>
  );
}