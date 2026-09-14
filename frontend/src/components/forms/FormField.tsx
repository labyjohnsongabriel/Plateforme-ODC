import { ReactNode } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface FormFieldProps {
  label?: string;
  name: string;
  required?: boolean;
  error?: string;
  success?: string;
  helper?: string;
  children: ReactNode;
  description?: string;
  className?: string;
}

export function FormField({
  label,
  name,
  required,
  error,
  success,
  helper,
  children,
  description,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium mb-2 text-odc-text-light dark:text-odc-text-dark"
        >
          {label}
          {required && <span className="text-odc-error ml-1">*</span>}
        </label>
      )}

      {description && (
        <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mb-2">
          {description}
        </p>
      )}

      <div className="relative">{children}</div>

      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-odc-error animate-slide-in">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}

      {success && !error && (
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-odc-success animate-slide-in">
          <CheckCircle size={12} />
          <span>{success}</span>
        </div>
      )}

      {helper && !error && !success && (
        <p className="mt-1.5 text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
          {helper}
        </p>
      )}
    </div>
  );
}