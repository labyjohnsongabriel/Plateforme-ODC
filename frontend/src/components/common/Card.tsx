// src/components/ui/card.tsx
'use client';

import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/utils/cn';

/* ============================================================================
   TYPES
   ============================================================================ */

export type CardVariant =
  | 'default'
  | 'outlined'
  | 'elevated'
  | 'glass'
  | 'gradient'
  | 'interactive'
  | 'spotlight'
  | 'aurora'
  | 'neon';

export type CardPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: CardPadding;
  hover?: boolean;
  variant?: CardVariant;
  asButton?: boolean;
  accent?: boolean;
  /** Bordure animée dégradée */
  animatedBorder?: boolean;
  /** Effet de lueur subtile autour de la carte */
  glow?: boolean;
}

/* ============================================================================
   STYLES
   ============================================================================ */

const PADDINGS: Record<CardPadding, string> = {
  none: '',
  xs: 'p-3',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
};

const VARIANTS: Record<CardVariant, string> = {
  /* ─── Défaut ─── */
  default: [
    'bg-white dark:bg-odc-surface-dark',
    'border border-odc-border-light dark:border-odc-border-dark',
    'shadow-odc-xs hover:shadow-odc-sm',
  ].join(' '),

  /* ─── Contour ─── */
  outlined: [
    'bg-transparent',
    'border-2 border-odc-border-light dark:border-odc-border-dark',
    'hover:border-odc-primary/60',
  ].join(' '),

  /* ─── Élevé ─── */
  elevated: [
    'bg-white dark:bg-odc-surface-dark',
    'shadow-odc-md hover:shadow-odc-xl',
    'border border-transparent',
  ].join(' '),

  /* ─── Verre ─── */
  glass: [
    'bg-white/60 dark:bg-odc-surface-dark/60',
    'backdrop-blur-2xl backdrop-saturate-150',
    'border border-white/50 dark:border-odc-border-dark/40',
    'shadow-odc-sm hover:shadow-odc-md',
    'before:absolute before:inset-0 before:rounded-xl',
    'before:bg-gradient-to-br before:from-white/40 before:to-transparent',
    'before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500',
    'before:pointer-events-none',
  ].join(' '),

  /* ─── Gradient ─── */
  gradient: [
    'bg-gradient-to-br from-odc-primary/5 via-white to-odc-primary/10',
    'dark:from-odc-primary/10 dark:via-odc-surface-dark dark:to-odc-primary/5',
    'border border-odc-primary/15 dark:border-odc-primary/20',
    'shadow-odc-sm hover:shadow-odc-md',
  ].join(' '),

  /* ─── Interactif ─── */
  interactive: [
    'bg-white dark:bg-odc-surface-dark',
    'border border-odc-border-light dark:border-odc-border-dark',
    'cursor-pointer',
    'hover:border-odc-primary/40 hover:shadow-odc-md hover:-translate-y-1',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-odc-primary focus-visible:ring-offset-2',
    'active:translate-y-0 active:scale-[0.99]',
  ].join(' '),

  /* ─── Spotlight ⭐ (le plus premium) ─── */
  spotlight: [
    'bg-white dark:bg-odc-surface-dark',
    'border border-odc-border-light dark:border-odc-border-dark',
    'shadow-odc-sm hover:shadow-odc-lg',
    'hover:-translate-y-0.5',
    // Effet de lumière radiale qui suit le curseur (via CSS variable)
    'before:absolute before:inset-0 before:rounded-xl before:pointer-events-none',
    'before:bg-[radial-gradient(400px_circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(255,107,0,0.12),transparent_60%)]',
    'before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300',
  ].join(' '),

  /* ─── Aurora ⭐ (gradient animé) ─── */
  aurora: [
    'relative bg-white dark:bg-odc-surface-dark',
    'border border-odc-border-light dark:border-odc-border-dark',
    'shadow-odc-md hover:shadow-odc-xl',
    'before:absolute before:inset-0 before:rounded-xl before:pointer-events-none before:overflow-hidden',
    'before:bg-[conic-gradient(from_0deg_at_50%_50%,#ff6b00_0deg,#ff8f3f_120deg,#ffb070_240deg,#ff6b00_360deg)]',
    'before:opacity-[0.06] hover:before:opacity-[0.14]',
    'before:transition-opacity before:duration-500',
    'before:[mask:radial-gradient(circle_at_50%_50%,black,transparent_75%)]',
  ].join(' '),

  /* ─── Neon ⭐ (glow néon au hover) ─── */
  neon: [
    'bg-odc-surface-dark/95 text-white',
    'border border-odc-primary/30',
    'shadow-[0_0_0_1px_rgba(255,107,0,0.1),0_4px_12px_-2px_rgba(0,0,0,0.3)]',
    'hover:border-odc-primary/70',
    'hover:shadow-[0_0_0_1px_rgba(255,107,0,0.3),0_0_20px_rgba(255,107,0,0.25),0_8px_24px_-4px_rgba(0,0,0,0.4)]',
    'hover:-translate-y-0.5',
    'transition-all duration-300',
  ].join(' '),
};

/* ============================================================================
   COMPOSANT PRINCIPAL
   ============================================================================ */

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      padding = 'md',
      hover = false,
      variant = 'default',
      asButton = false,
      accent = false,
      animatedBorder = false,
      glow = false,
      className,
      onMouseMove,
      ...props
    },
    ref,
  ) => {
    /* ─── Track curseur pour l'effet spotlight ─── */
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (variant === 'spotlight') {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      }
      onMouseMove?.(e);
    };

    return (
      <div
        ref={ref}
        role={asButton ? 'button' : undefined}
        tabIndex={asButton ? 0 : undefined}
        onMouseMove={handleMouseMove}
        className={cn(
          // Base
          'group relative isolate rounded-xl transition-all duration-300 ease-out',
          'overflow-hidden',
          // Variante
          VARIANTS[variant],
          // Padding
          PADDINGS[padding],
          // Accent (barre gradient verticale)
          accent &&
            'before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1 before:rounded-r-full before:bg-gradient-to-b before:from-odc-500 before:to-odc-700 before:z-10',
          // Bordure animée (conic gradient qui tourne)
          animatedBorder && [
            'border-transparent',
            'before:absolute before:inset-0 before:rounded-xl before:p-[1.5px]',
            'before:bg-[conic-gradient(from_var(--angle),transparent_0%,#ff6b00_20%,transparent_40%,transparent_100%)]',
            'before:animate-[spin_4s_linear_infinite]',
            'before:[mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]',
            'before:[mask-composite:exclude]',
            'before:pointer-events-none before:z-0',
          ].join(' '),
          // Glow externe
          glow && 'shadow-odc-lg hover:shadow-odc-xl',
          // Hover générique
          hover && [
            'cursor-pointer',
            'hover:shadow-odc-lg hover:-translate-y-1',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-odc-primary focus-visible:ring-offset-2',
          ].join(' '),
          className,
        )}
        {...props}
      >
        {/* Contenu au-dessus des effets */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  },
);

Card.displayName = 'Card';

/* ============================================================================
   SUB-COMPOSANTS
   ============================================================================ */

/* ─── CardHeader ─── */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  align?: 'between' | 'start' | 'center';
}

export function CardHeader({
  children,
  align = 'between',
  className,
  ...props
}: CardHeaderProps) {
  const alignment = {
    between: 'items-start justify-between gap-4',
    start: 'items-start gap-3',
    center: 'items-center justify-between gap-4',
  };

  return (
    <div className={cn('mb-4 flex', alignment[align], className)} {...props}>
      {children}
    </div>
  );
}

/* ─── CardTitle ─── */
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  gradient?: boolean;
}

export function CardTitle({
  children,
  as: Tag = 'h3',
  gradient = false,
  className,
  ...props
}: CardTitleProps) {
  return (
    <Tag
      className={cn(
        'font-heading text-lg font-semibold leading-tight tracking-tight',
        !gradient && 'text-odc-text-light dark:text-odc-text-dark',
        gradient &&
          'bg-gradient-to-br from-odc-500 to-odc-700 bg-clip-text text-transparent',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/* ─── CardDescription ─── */
export interface CardDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function CardDescription({
  children,
  className,
  ...props
}: CardDescriptionProps) {
  return (
    <p
      className={cn(
        'text-sm leading-relaxed',
        'text-odc-text-muted-light dark:text-odc-text-muted-dark',
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

/* ─── CardContent ─── */
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({
  children,
  className,
  ...props
}: CardContentProps) {
  return (
    <div className={cn('text-sm', className)} {...props}>
      {children}
    </div>
  );
}

/* ─── CardFooter ─── */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  align?: 'end' | 'start' | 'between';
}

export function CardFooter({
  children,
  align = 'end',
  className,
  ...props
}: CardFooterProps) {
  const alignment = {
    end: 'justify-end',
    start: 'justify-start',
    between: 'justify-between',
  };

  return (
    <div
      className={cn(
        'mt-4 flex items-center gap-3 border-t pt-4',
        'border-odc-border-light dark:border-odc-border-dark',
        alignment[align],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── CardMedia ─── */
export interface CardMediaProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  aspect?: 'video' | 'square' | 'wide' | 'auto';
  /** Zoom subtil de l'image au hover */
  zoom?: boolean;
}

export function CardMedia({
  children,
  aspect = 'video',
  zoom = false,
  className,
  ...props
}: CardMediaProps) {
  const ratios = {
    video: 'aspect-video',
    square: 'aspect-square',
    wide: 'aspect-[16/6]',
    auto: '',
  };

  return (
    <div
      className={cn(
        'relative -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-xl',
        ratios[aspect],
        zoom && '[&_img]:transition-transform [&_img]:duration-500 [&_img]:group-hover:scale-105',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── CardBadge ─── */
export interface CardBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  /** Position absolue dans le coin supérieur droit */
  corner?: boolean;
}

export function CardBadge({
  children,
  color = 'primary',
  corner = false,
  className,
  ...props
}: CardBadgeProps) {
  const colors = {
    primary: 'bg-odc-primary-soft text-odc-primary ring-1 ring-odc-primary/20',
    success: 'bg-odc-success/10 text-odc-success ring-1 ring-odc-success/20',
    warning: 'bg-odc-warning/10 text-odc-warning ring-1 ring-odc-warning/20',
    danger: 'bg-odc-error/10 text-odc-error ring-1 ring-odc-error/20',
    info: 'bg-odc-info/10 text-odc-info ring-1 ring-odc-info/20',
    neutral: 'bg-odc-surface-alt text-odc-text-muted-light ring-1 ring-odc-border-light',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5',
        'text-[11px] font-semibold uppercase tracking-wide',
        colors[color],
        corner && 'absolute right-4 top-4 z-20 shadow-odc-sm',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/* ─── CardDivider ⭐ ─── */
export function CardDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'my-4 h-px w-full bg-gradient-to-r from-transparent via-odc-border-light to-transparent',
        'dark:via-odc-border-dark',
        className,
      )}
    />
  );
}