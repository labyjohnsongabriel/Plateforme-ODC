'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const ODC_LOGO_SRC = '/images/brand/logo-odc.png';

interface Props {
  href?: string;
  size?: number;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function HeaderLogo({
  href = '/',
  size = 36,
  title = 'ODC Platform',
  subtitle,
  className,
}: Props) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex shrink-0 items-center gap-2.5 rounded-lg',
        'focus-visible:ring-2 focus-visible:ring-odc-primary focus-visible:ring-offset-2 focus-visible:outline-none',
        className,
      )}
      aria-label={`${title} — Accueil`}
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-odc-border/40 shadow-odc-xs transition-all duration-300 group-hover:scale-105 group-hover:shadow-odc-sm"
        style={{ width: size, height: size }}
      >
        <Image
          src={ODC_LOGO_SRC}
          alt="Orange Digital Center Madagascar"
          fill
          sizes={`${size}px`}
          priority
          className="object-contain p-0.5"
        />
      </div>
      <div className="hidden flex-col leading-tight sm:flex">
        <span className="font-display text-sm font-bold tracking-tight text-odc-text-primary">
          {title}
        </span>
        {subtitle && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-odc-text-muted">
            {subtitle}
          </span>
        )}
      </div>
    </Link>
  );
}