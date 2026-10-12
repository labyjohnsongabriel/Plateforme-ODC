// src/components/shared/PageHero.tsx
import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ============================================================================
   TYPES
   ============================================================================ */

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeroProps {
  /** Titre principal */
  title: string;
  /** Sous-titre / description */
  description?: string;
  /** Icône affichée avant le titre */
  icon?: React.ElementType;
  /** Image de fond (URL) */
  backgroundImage?: string;
  /** Fil d'Ariane */
  breadcrumbs?: Breadcrumb[];
  /** Actions (boutons) à droite */
  actions?: React.ReactNode;
  /** Contenu additionnel sous le titre */
  children?: React.ReactNode;
  /** Variante visuelle */
  variant?: 'default' | 'gradient' | 'minimal';
  /** Taille */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/* ============================================================================
   STYLES
   ============================================================================ */

const SIZE_STYLES = {
  sm: {
    wrapper: 'py-6 md:py-8',
    title: 'text-xl md:text-2xl',
    description: 'text-sm',
    icon: 'w-10 h-10',
    iconInner: 'h-5 w-5',
  },
  md: {
    wrapper: 'py-8 md:py-12',
    title: 'text-2xl md:text-3xl',
    description: 'text-base',
    icon: 'w-12 h-12',
    iconInner: 'h-6 w-6',
  },
  lg: {
    wrapper: 'py-12 md:py-16',
    title: 'text-3xl md:text-4xl',
    description: 'text-lg',
    icon: 'w-14 h-14',
    iconInner: 'h-7 w-7',
  },
};

const VARIANT_STYLES = {
  default: 'bg-odc-surface border-b border-odc-border',
  gradient:
    'bg-gradient-to-br from-odc-500 via-odc-600 to-odc-700 text-white border-b border-odc-700',
  minimal: 'bg-transparent',
};

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function PageHero({
  title,
  description,
  icon: Icon,
  backgroundImage,
  breadcrumbs,
  actions,
  children,
  variant = 'default',
  size = 'md',
  className,
}: PageHeroProps) {
  const s = SIZE_STYLES[size];
  const isGradient = variant === 'gradient';

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {/* Image de fond */}
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            aria-hidden="true"
          />
          <div
            className={cn(
              'absolute inset-0',
              isGradient
                ? 'bg-gradient-to-br from-odc-500/90 via-odc-600/90 to-odc-700/90'
                : 'bg-odc-surface/85 backdrop-blur-sm',
            )}
            aria-hidden="true"
          />
        </>
      )}

      {/* Motif décoratif (variante gradient uniquement) */}
      {isGradient && !backgroundImage && (
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className={s.wrapper}>
          {/* Fil d'Ariane */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Fil d'Ariane" className="mb-4">
              <ol
                className={cn(
                  'flex flex-wrap items-center gap-1.5 text-sm',
                  isGradient ? 'text-white/80' : 'text-odc-muted',
                )}
              >
                {breadcrumbs.map((bc, i) => {
                  const isLast = i === breadcrumbs.length - 1;
                  return (
                    <li key={`${bc.label}-${i}`} className="flex items-center gap-1.5">
                      {i > 0 && (
                        <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                      )}
                      {isLast || !bc.href ? (
                        <span
                          className={cn(
                            'font-medium',
                            isGradient ? 'text-white' : 'text-odc-text-primary',
                          )}
                        >
                          {bc.label}
                        </span>
                      ) : (
                        <Link
                          href={bc.href}
                          className={cn(
                            'transition-colors',
                            isGradient
                              ? 'hover:text-white'
                              : 'hover:text-odc-primary',
                          )}
                        >
                          {bc.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}

          {/* Contenu principal */}
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              {Icon && (
                <div
                  className={cn(
                    'rounded-xl flex items-center justify-center shrink-0',
                    s.icon,
                    isGradient
                      ? 'bg-white/15 text-white backdrop-blur-sm'
                      : 'bg-odc-primary-soft text-odc-primary',
                  )}
                >
                  <Icon className={s.iconInner} />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h1
                  className={cn(
                    'font-display font-bold leading-tight',
                    s.title,
                    isGradient ? 'text-white' : 'text-odc-text-primary',
                  )}
                >
                  {title}
                </h1>

                {description && (
                  <p
                    className={cn(
                      'mt-2 max-w-3xl',
                      s.description,
                      isGradient ? 'text-white/90' : 'text-odc-muted',
                    )}
                  >
                    {description}
                  </p>
                )}

                {children && <div className="mt-4">{children}</div>}
              </div>
            </div>

            {actions && (
              <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}