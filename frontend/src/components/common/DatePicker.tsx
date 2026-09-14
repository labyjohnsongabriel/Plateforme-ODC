import { InputHTMLAttributes, forwardRef } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
  required?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, helper, fullWidth = true, required, className, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium mb-2 text-odc-text-light dark:text-odc-text-dark"
          >
            {label}
            {required && <span className="text-odc-error ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <Calendar
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-odc-text-muted-light dark:text-odc-text-muted-dark pointer-events-none"
          />
          <input
            ref={ref}
            id={inputId}
            type="date"
            className={cn(
              'w-full pl-11 pr-4 py-3 rounded-lg',
              'bg-white dark:bg-odc-surface-dark',
              'text-odc-text-light dark:text-odc-text-dark',
              'border transition-all duration-200',
              'focus:outline-none focus:ring-4',
              'dark:[color-scheme:dark]',
              error
                ? 'border-odc-error focus:border-odc-error focus:ring-odc-error/10'
                : 'border-odc-border-light dark:border-odc-border-dark focus:border-odc-primary focus:ring-odc-primary/10',
              className
            )}
            {...props}
          />
        </div>

        {error && <p className="mt-1.5 text-xs text-odc-error">{error}</p>}
        {helper && !error && (
          <p className="mt-1.5 text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';