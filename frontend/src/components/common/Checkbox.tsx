import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  error?: string;
  description?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, description, indeterminate, className, id, checked, ...props }, ref) => {
    const checkboxId = id || props.name;

    return (
      <div className="flex items-start gap-2.5">
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all',
              'peer-focus:ring-4 peer-focus:ring-odc-primary/10',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              checked || indeterminate
                ? 'bg-odc-primary border-odc-primary'
                : 'bg-white dark:bg-odc-surface-dark border-odc-border-light dark:border-odc-border-dark peer-hover:border-odc-primary',
              error && 'border-odc-error'
            )}
          >
            {indeterminate ? (
              <div className="w-2.5 h-0.5 bg-white rounded-full" />
            ) : (
              checked && <Check size={14} className="text-white" strokeWidth={3} />
            )}
          </div>
        </div>

        {(label || description) && (
          <div className="flex-1 min-w-0">
            <label
              htmlFor={checkboxId}
              className="text-sm cursor-pointer text-odc-text-light dark:text-odc-text-dark select-none"
            >
              {label}
            </label>
            {description && (
              <p className="text-xs mt-0.5 text-odc-text-muted-light dark:text-odc-text-muted-dark">
                {description}
              </p>
            )}
            {error && <p className="text-xs mt-1 text-odc-error">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';