import { AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface FormErrorProps {
  message?: string;
  errors?: Array<{ field: string; message: string }>;
  className?: string;
}

export function FormError({ message, errors, className }: FormErrorProps) {
  if (!message && (!errors || errors.length === 0)) return null;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl',
        'bg-odc-error-bg border border-odc-error/20',
        'animate-slide-in',
        className
      )}
    >
      <AlertTriangle size={20} className="text-odc-error flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {message && (
          <p className="text-sm font-medium text-odc-error">{message}</p>
        )}
        {errors && errors.length > 0 && (
          <ul className="mt-1 space-y-0.5 list-disc list-inside">
            {errors.map((err, i) => (
              <li key={i} className="text-xs text-odc-error">
                <span className="font-medium">{err.field}:</span> {err.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}