'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface OdcLogoProps {
  /** Taille du logo (px) */
  size?: number;
  /** Affiche le texte "Orange Digital Center" à côté du logo */
  withText?: boolean;
  /** Texte principal */
  title?: string;
  /** Sous-titre */
  subtitle?: string;
  /** Classe CSS additionnelle */
  className?: string;
  /** Lien de destination (désactivable) */
  href?: string | null;
  /** Version compacte (juste l'icône) */
  iconOnly?: boolean;
  /** Priorité de chargement */
  priority?: boolean;
}

export function OdcLogo({
  size = 40,
  withText = true,
  title = 'Orange Digital Center',
  subtitle = 'Madagascar',
  className,
  href = '/',
  iconOnly = false,
  priority = false,
}: OdcLogoProps) {
  const content = (
    <div className={cn('group flex shrink-0 items-center gap-2.5', className)}>
      {/* Logo image */}
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src="/images/brand/logo-odc.jpeg"
          alt="Orange Digital Center Madagascar"
          fill
          sizes={`${size}px`}
          priority={priority}
          className="rounded-xl object-contain transition-transform duration-300 group-hover:scale-105"
        />
        {/* Halo au survol */}
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-odc-400 to-odc-600 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-60" />
      </div>

      {/* Texte */}
      {withText && !iconOnly && (
        <div className="hidden flex-col leading-tight sm:flex">
          <span className="font-display text-sm font-bold tracking-tight text-odc-text-primary">
            {title}
          </span>
          <span className="text-[11px] font-medium text-odc-text-muted">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );

  if (href === null) return content;

  return (
    <Link
      href={href}
      aria-label="ODC Platform — Accueil"
      className="focus-visible:ring-odc-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none rounded-lg"
    >
      {content}
    </Link>
  );
}