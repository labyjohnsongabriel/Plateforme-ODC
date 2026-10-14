// src/components/ui/button.tsx
'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ============================================================================
   VARIANTES
   ============================================================================ */

const buttonVariants = cva(
  [
    // Mise en page
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    // Typographie
    'text-sm font-medium',
    // Forme
    'rounded-md',
    // Transitions & animations
    'transition-all duration-200 ease-out active:scale-[0.98]',
    // Focus (accessibilité)
    'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
    // État désactivé
    'disabled:pointer-events-none disabled:opacity-50',
    // Icônes SVG internes
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4',
  ].join(' '),
  {
    variants: {
      variant: {
        /* --- Primaire (couleur ODC) --- */
        default:
          'bg-primary text-primary-foreground shadow-odc-sm hover:bg-primary/90 hover:shadow-odc-md',

        /* --- Destructif (suppression) --- */
        destructive:
          'bg-destructive text-destructive-foreground shadow-odc-sm hover:bg-destructive/90 hover:shadow-odc-md focus-visible:ring-destructive',

        /* --- Contour --- */
        outline:
          'border border-odc-border bg-odc-surface text-odc-text-primary hover:bg-odc-surface-alt hover:border-odc-primary hover:text-odc-primary',

        /* --- Secondaire --- */
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',

        /* --- Fantôme (ghost) --- */
        ghost:
          'text-odc-text-primary hover:bg-odc-surface-alt hover:text-odc-primary',

        /* --- Lien --- */
        link:
          'text-odc-primary underline-offset-4 hover:underline',

        /* --- Dégradé ODC (mise en avant) --- */
        odc:
          'bg-gradient-to-br from-odc-500 to-odc-700 text-white shadow-odc-sm hover:shadow-odc-lg hover:-translate-y-px',

        /* --- Succès (validation) --- */
        success:
          'bg-odc-success text-white shadow-odc-sm hover:bg-odc-success/90 hover:shadow-odc-md',

        /* --- Avertissement --- */
        warning:
          'bg-odc-warning text-white shadow-odc-sm hover:bg-odc-warning/90 hover:shadow-odc-md',

        /* --- Information --- */
        info:
          'bg-odc-info text-white shadow-odc-sm hover:bg-odc-info/90 hover:shadow-odc-md',
      },
      size: {
        sm: 'h-8 rounded-md px-3 text-xs',
        default: 'h-10 px-4 py-2',
        lg: 'h-11 rounded-md px-6 text-base',
        xl: 'h-12 rounded-lg px-8 text-base',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-11 w-11 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  },
);

/* ============================================================================
   TYPES
   ============================================================================ */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Rend le bouton comme un composant enfant (ex : `<Link>`) */
  asChild?: boolean;
  /** Affiche un spinner et désactive le bouton */
  loading?: boolean;
  /** Texte affiché pendant le chargement (par défaut : children) */
  loadingText?: string;
  /** Icône à afficher à gauche */
  leftIcon?: React.ReactNode;
  /** Icône à afficher à droite */
  rightIcon?: React.ReactNode;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

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
      disabled,
      children,
      type,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type ?? 'button'}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        data-loading={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            <span>{loadingText ?? children}</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="inline-flex shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="inline-flex shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

/* ============================================================================
   EXPORTS
   ============================================================================ */

export { Button, buttonVariants };