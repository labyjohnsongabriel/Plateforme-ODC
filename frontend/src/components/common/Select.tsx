import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options?: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  required?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helper,
      options = [],
      placeholder = 'Sélectionnez...',
      fullWidth = true,
      required,
      className,
      id,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name;

    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium mb-2 text-odc-text-light dark:text-odc-text-dark"
          >
            {label}
            {required && <span className="text-odc-error ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full px-4 py-3 rounded-lg appearance-none pr-10 cursor-pointer',
              'bg-white dark:bg-odc-surface-dark',
              'text-odc-text-light dark:text-odc-text-dark',
              'border transition-all duration-200',
              'focus:outline-none focus:ring-4',
              error
                ? 'border-odc-error focus:border-odc-error focus:ring-odc-error/10'
                : 'border-odc-border-light dark:border-odc-border-dark focus:border-odc-primary focus:ring-odc-primary/10',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
            {children}
          </select>

          <ChevronDown
            size={18}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-odc-text-muted-light dark:text-odc-text-muted-dark pointer-events-none"
          />
        </div>

        {error && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-odc-error">
            <AlertCircle size={12} />
            <span>{error}</span>
          </div>
        )}

        {helper && !error && (
          <p className="mt-1.5 text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';