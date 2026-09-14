import { InputHTMLAttributes, forwardRef, ReactNode, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helper,
      icon,
      iconRight,
      fullWidth = true,
      required,
      className,
      id,
      type,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

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
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-odc-text-muted-light dark:text-odc-text-muted-dark pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={cn(
              'w-full px-4 py-3 rounded-lg',
              'bg-white dark:bg-odc-surface-dark',
              'text-odc-text-light dark:text-odc-text-dark',
              'placeholder:text-odc-text-muted-light dark:placeholder:text-odc-text-muted-dark',
              'border transition-all duration-200',
              'focus:outline-none focus:ring-4',
              error
                ? 'border-odc-error focus:border-odc-error focus:ring-odc-error/10'
                : 'border-odc-border-light dark:border-odc-border-dark focus:border-odc-primary focus:ring-odc-primary/10',
              'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-odc-surface-alt-light dark:disabled:bg-odc-surface-alt-dark',
              icon && 'pl-11',
              (isPassword || iconRight) && 'pr-11',
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-odc-text-muted-light dark:text-odc-text-muted-dark hover:text-odc-primary transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}

          {!isPassword && iconRight && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-odc-text-muted-light dark:text-odc-text-muted-dark">
              {iconRight}
            </div>
          )}
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

Input.displayName = 'Input';