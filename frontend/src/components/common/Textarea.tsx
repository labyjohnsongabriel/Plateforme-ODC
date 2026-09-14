import { TextareaHTMLAttributes, forwardRef, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
  required?: boolean;
  showCount?: boolean;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helper,
      icon,
      fullWidth = true,
      required,
      showCount,
      maxLength,
      className,
      id,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id || props.name;
    const currentLength = String(value || '').length;

    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor={textareaId}
              className="text-sm font-medium text-odc-text-light dark:text-odc-text-dark"
            >
              {label}
              {required && <span className="text-odc-error ml-1">*</span>}
            </label>
            {showCount && maxLength && (
              <span className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
                {currentLength} / {maxLength}
              </span>
            )}
          </div>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-3.5 text-odc-text-muted-light dark:text-odc-text-muted-dark pointer-events-none">
              {icon}
            </div>
          )}

          <textarea
            ref={ref}
            id={textareaId}
            value={value}
            maxLength={maxLength}
            className={cn(
              'w-full px-4 py-3 rounded-lg min-h-[100px] resize-y',
              'bg-white dark:bg-odc-surface-dark',
              'text-odc-text-light dark:text-odc-text-dark',
              'placeholder:text-odc-text-muted-light dark:placeholder:text-odc-text-muted-dark',
              'border transition-all duration-200',
              'focus:outline-none focus:ring-4',
              error
                ? 'border-odc-error focus:border-odc-error focus:ring-odc-error/10'
                : 'border-odc-border-light dark:border-odc-border-dark focus:border-odc-primary focus:ring-odc-primary/10',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              icon && 'pl-11',
              className
            )}
            {...props}
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

Textarea.displayName = 'Textarea';