// src/components/ui/button.tsx
'use client';

import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   VARIANTS — Orange · Blanc · Noir
   ═══════════════════════════════════════════════════════════════════════════ */

const buttonVariants = cva(
  [
    'group relative inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-medium tracking-tight rounded-lg overflow-hidden',
    'transition-all duration-200 ease-out',
    'active:scale-[0.98] active:duration-75',
    'outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    '[&_svg:not([class*="size-"])]:size-4',
  ].join(' '),
  {
    variants: {
      variant: {
        /* Orange principal (gradient) */
        default:
          'bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 text-white shadow-sm hover:shadow-md hover:from-orange-600 hover:to-orange-700',
        primary:
          'bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 text-white shadow-sm hover:shadow-md hover:from-orange-600 hover:to-orange-700',
        /* Noir premium */
        dark:
          'bg-slate-900 text-white shadow-sm hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
        /* Outline orange */
        outline:
          'border border-orange-200 bg-white text-orange-700 hover:bg-orange-50 hover:border-orange-300 dark:border-orange-500/30 dark:bg-transparent dark:text-orange-300 dark:hover:bg-orange-500/10',
        /* Outline neutre */
        secondary:
          'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50',
        /* Ghost */
        ghost:
          'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50',
        /* Destructive */
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-700',
        /* Success */
        success:
          'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700',
        /* Warning */
        warning:
          'bg-amber-500 text-white shadow-sm hover:bg-amber-600',
        /* Soft orange */
        soft:
          'bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/20',
        /* Link */
        link:
          'text-orange-600 underline-offset-4 hover:underline p-0 h-auto dark:text-orange-400',
        /* Glass */
        glass:
          'bg-white/60 text-slate-900 backdrop-blur-md border border-slate-200/50 hover:bg-white/80 dark:bg-slate-900/60 dark:text-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-900/80',
      },
      size: {
        xs: 'h-7 rounded-md px-2.5 text-xs',
        sm: 'h-8 rounded-md px-3 text-xs',
        default: 'h-10 px-4 py-2 text-sm',
        lg: 'h-11 rounded-lg px-6 text-sm',
        xl: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-11 w-11 p-0',
      },
      fullWidth: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'default', fullWidth: false },
  },
);

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      iconOnly = false,
      disabled,
      children,
      type,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    const content = loading ? (
      <>
        <Loader2 className="animate-spin" aria-hidden="true" />
        <span className="opacity-80">{loadingText ?? children}</span>
      </>
    ) : (
      <>
        {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        {!iconOnly ? children : <span className="sr-only">{children}</span>}
        {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </>
    );

    if (asChild) {
      return (
        <Comp
          ref={ref}
          className={cn(buttonVariants({ variant, size, fullWidth }), className)}
          aria-busy={loading || undefined}
          aria-disabled={isDisabled || undefined}
          {...props}
        >
          <Slottable>
            <span className="relative inline-flex items-center justify-center gap-2">
              {content}
            </span>
          </Slottable>
        </Comp>
      );
    }

    return (
      <Comp
        ref={ref}
        type={type ?? 'button'}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        {...props}
      >
        {/* Shine effect au hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
        <span className="relative inline-flex items-center justify-center gap-2">
          {content}
        </span>
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };