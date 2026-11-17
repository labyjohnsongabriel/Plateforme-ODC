'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Props {
  href: string;
  collapsed: boolean;
  title: string;
  subtitle?: string;
  onNavigate?: () => void;
}

export function SidebarLogo({ href, collapsed, title, subtitle, onNavigate }: Props) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2.5 rounded-lg',
        'focus-visible:ring-2 focus-visible:ring-odc-primary focus-visible:ring-offset-2 focus-visible:outline-none',
      )}
      aria-label={`${title} — Accueil`}
    >
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-odc-border/40 shadow-odc-xs">
        <Image
          src="/images/brand/logo-odc.jpeg"
          alt="Orange Digital Center"
          fill
          sizes="36px"
          priority
          className="object-contain p-0.5"
        />
      </div>
      {!collapsed && (
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-display text-sm font-bold text-odc-text-primary">
            {title}
          </span>
          {subtitle && (
            <span className="truncate text-[11px] font-medium text-odc-text-muted">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}