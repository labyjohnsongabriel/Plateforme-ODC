'use client';

import Link from 'next/link';
import { Home, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { NotificationModal } from '@/components/layout/NotificationModal';
import { HeaderLogo } from '@/components/shared/HeaderLogo';
import { HeaderBreadcrumb } from '@/components/shared/HeaderBreadcrumb';
import { HeaderSearch } from '@/components/shared/HeaderSearch';
import { HeaderUserMenu } from '@/components/shared/HeaderUserMenu';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

export function ParticipantHeader() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header
      role="banner"
      className={cn(
        'sticky top-0 z-30 h-16 shrink-0',
        'border-b border-odc-border/60',
        'bg-odc-surface/75 backdrop-blur-2xl backdrop-saturate-150',
        'supports-[backdrop-filter]:bg-odc-surface/65',
        'shadow-[0_1px_3px_0_rgb(0_0_0_/_0.04),0_1px_2px_-1px_rgb(0_0_0_/_0.03)]',
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-odc-primary/20 to-transparent"
      />

      <div className="flex h-full items-center gap-3 px-4 sm:px-6">
        {/* ═══════════════════════════════════════════════════════════════════
            ZONE GAUCHE — Toggle + Logo + Breadcrumb
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              'h-9 w-9 rounded-lg transition-all duration-200',
              'hover:bg-odc-primary/10 hover:text-odc-primary active:scale-95',
              'lg:hidden',
            )}
            aria-label="Ouvrir le menu latéral"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="lg:hidden">
            <HeaderLogo size={32} title="ODC" />
          </div>

          <HeaderBreadcrumb rootSegment="participant" />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            ZONE CENTRE — Recherche
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative ml-auto hidden w-full max-w-md sm:block md:max-w-lg">
          <HeaderSearch
            placeholder="Rechercher une formation, une session…"
            onEnter={(q) => {
              // TODO: router.push(`/participant/recherche?q=${q}`)
              console.log('search:', q);
            }}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            ZONE DROITE — Actions
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className={cn(
              'h-9 w-9 rounded-lg',
              'text-odc-text-secondary',
              'transition-all duration-200 hover:bg-odc-primary/10 hover:text-odc-primary active:scale-95',
            )}
          >
            <Link
              href="/"
              aria-label="Voir le site public"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Home className="h-4 w-4" />
            </Link>
          </Button>

          <NotificationModal />

          <div
            className="mx-1.5 h-5 w-px bg-gradient-to-b from-transparent via-odc-border to-transparent"
            aria-hidden
          />

          <ThemeToggle />
          <HeaderUserMenu />
        </div>
      </div>
    </header>
  );
}