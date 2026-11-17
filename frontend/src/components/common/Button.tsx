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
  | 'outline'
  | 'soft'
  | 'link';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// ============================================================================
//  PROPS
// ============================================================================

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  elevated?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
  children?: ReactNode;
}

// ============================================================================
//  STYLES
// ============================================================================

const variantClasses: Record<ButtonVariant, string> = {
  /* --- Primaire --- */
  primary: [
    'bg-odc-primary text-white',
    'shadow-sm hover:shadow-md',
    'hover:bg-odc-primary-dark',
    'hover:-translate-y-px',
  ].join(' '),

  /* --- Secondaire --- */
  secondary: [
    'bg-odc-light text-odc-dark',
    'shadow-xs',
    'hover:bg-odc-primary hover:text-white',
    'hover:shadow-sm hover:-translate-y-px',
  ].join(' '),

  /* --- Fantôme --- */
  ghost: [
    'bg-transparent text-odc-text-light dark:text-odc-text-dark',
    'hover:bg-odc-light dark:hover:bg-odc-surface-alt-dark',
    'hover:text-odc-primary',
  ].join(' '),

  /* --- Danger --- */
  danger: [
    'bg-odc-error text-white',
    'shadow-sm hover:shadow-md',
    'hover:bg-odc-error/90',
    'hover:-translate-y-px',
  ].join(' '),

  /* --- Contour --- */
  outline: [
    'bg-transparent text-odc-text-light dark:text-odc-text-dark',
    'border border-odc-border-light dark:border-odc-border-dark',
    'hover:bg-odc-light dark:hover:bg-odc-surface-alt-dark',
    'hover:border-odc-primary/50 hover:text-odc-primary',
    'hover:shadow-sm',
  ].join(' '),

  /* --- Soft (nouveau) : fond coloré doux --- */
  soft: [
    'bg-odc-primary/10 text-odc-primary',
    'hover:bg-odc-primary/15',
    'hover:shadow-xs',
  ].join(' '),

  /* --- Lien (nouveau) : inline --- */
  link: [
    'bg-transparent text-odc-primary p-0 h-auto',
    'underline-offset-4 hover:underline',
  ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1 rounded-md [&_svg:not([class*="size-"])]:size-3',
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-xl',
  xl: 'h-14 px-8 text-base gap-2.5 rounded-xl',
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
      loadingText,
      fullWidth = false,
      elevated = false,
      icon,
      iconPosition = 'left',
      iconOnly = false,
      disabled,
      className,
      children,
      type,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        data-loading={loading || undefined}
        className={cn(
          // Base
          'group relative inline-flex items-center justify-center overflow-hidden',
          'font-semibold tracking-tight whitespace-nowrap',
          'transition-all duration-200 ease-out',
          'active:scale-[0.97] active:duration-75',
          // Focus
          'outline-none focus-visible:ring-2 focus-visible:ring-odc-primary focus-visible:ring-offset-2',
          'focus-visible:ring-offset-background',
          // Disabled
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0',
          // Icônes internes
          '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-200',
          '[&_svg:not([class*="size-"])]:size-4',
          // Variante + taille + options
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          elevated && 'shadow-md hover:shadow-lg',
          className
        )}
        {...rest}
      >
        {/* Shine effect au hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />

        {loading ? (
          <span className="relative inline-flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" aria-hidden="true" />
            {(loadingText ?? children) && (
              <span className="opacity-80">{loadingText ?? children}</span>
            )}
          </span>
        ) : (
          <span className="relative inline-flex items-center justify-center gap-2">
            {icon && iconPosition === 'left' && (
              <span
                className="inline-flex shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
                aria-hidden="true"
              >
                {icon}
              </span>
            )}

            {!iconOnly && children && <span>{children}</span>}
            {iconOnly && children && (
              <span className="sr-only">{children}</span>
            )}

            {icon && iconPosition === 'right' && (
              <span
                className="inline-flex shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                {icon}
              </span>
            )}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';