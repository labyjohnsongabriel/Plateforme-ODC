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

export function FormateurHeader() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-odc-border bg-odc-surface/95 backdrop-blur-md">
      <div className="flex h-full items-center gap-3 px-4 sm:px-6">
        {/* Toggle sidebar (mobile) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9 rounded-lg lg:hidden"
          aria-label="Ouvrir le menu latéral"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo (mobile uniquement — desktop a déjà la sidebar) */}
        <div className="lg:hidden">
          <HeaderLogo size={32} title="ODC" />
        </div>

        {/* Fil d'Ariane (desktop) */}
        <HeaderBreadcrumb rootSegment="formateur" />

        {/* Recherche (desktop) */}
        <div className="ml-auto hidden md:flex md:w-full md:max-w-sm">
          <HeaderSearch
            placeholder="Rechercher une session, un participant…"
            onEnter={(q) => {
              // TODO: router.push(`/formateur/recherche?q=${encodeURIComponent(q)}`)
              console.log('search:', q);
            }}
          />
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1 md:ml-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-9 w-9 rounded-lg"
            aria-label="Voir le site public"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
            </Link>
          </Button>

          <NotificationModal />
          <ThemeToggle />
          <HeaderUserMenu />
        </div>
      </div>
    </header>
  );
}