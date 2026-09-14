import {
  forwardRef,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

// ============================================================================
//  TYPES
// ============================================================================

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'outline';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

// ============================================================================
//  PROPS
// ============================================================================

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children?: ReactNode;
}

// ============================================================================
//  STYLES
// ============================================================================

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-odc-primary hover:bg-odc-primary-dark text-white shadow-sm hover:shadow-md',
  secondary:
    'bg-odc-light text-odc-dark hover:bg-odc-primary hover:text-white',
  ghost:
    'bg-transparent text-odc-text-light dark:text-odc-text-dark hover:bg-odc-light dark:hover:bg-odc-surface-alt-dark',
  danger: 'bg-odc-error hover:bg-odc-error/90 text-white',
  outline:
    'bg-transparent border border-odc-border-light dark:border-odc-border-dark text-odc-text-light dark:text-odc-text-dark hover:bg-odc-light dark:hover:bg-odc-surface-alt-dark',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-7 px-2 text-xs gap-1 rounded-md',
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
};

// ============================================================================
//  COMPONENT
// ============================================================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      icon,
      iconPosition = 'left',
      disabled,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-odc-primary focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...rest}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {children && <span>{children}</span>}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="shrink-0">{icon}</span>
            )}
            {children && <span>{children}</span>}
            {icon && iconPosition === 'right' && (
              <span className="shrink-0">{icon}</span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';