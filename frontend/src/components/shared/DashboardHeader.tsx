'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search, Home, Menu, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useUIStore } from '@/store/ui.store';
import { NotificationModal } from '@/components/layout/NotificationModal';
import { HeaderBreadcrumb } from '@/components/shared/HeaderBreadcrumb';
import { HeaderUserMenu } from '@/components/shared/HeaderUserMenu';
import { cn } from '@/lib/utils';

type Role = 'admin' | 'staff' | 'formateur' | 'participant';

const PLACEHOLDERS: Record<Role, string> = {
  admin: 'Rechercher une formation, un utilisateur…',
  staff: 'Rechercher une formation, un candidat…',
  formateur: 'Rechercher une session, un participant…',
  participant: 'Rechercher une formation, une session…',
};

interface Props {
  role: Role;
  onSearch?: (query: string) => void;
}

export function DashboardHeader({ role, onSearch }: Props) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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

      {/*
        ⚠️ STRUCTURE CLÉ :
        - flex items-center gap-3
        - 3 groupes : gauche / centre (ml-auto) / droite (ml-auto)
      */}
      <div className="flex h-full items-center gap-3 px-4 sm:px-6">
        {/* ═══════════════════════════════════════════════════════════════════
            ZONE GAUCHE — Toggle + Breadcrumb
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-9 w-9 rounded-lg transition-all duration-200 hover:bg-odc-primary/10 hover:text-odc-primary active:scale-95 lg:hidden"
            aria-label="Ouvrir le menu latéral"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <HeaderBreadcrumb rootSegment={role} />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            ZONE CENTRE — Recherche (poussée à droite par ml-auto)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative ml-auto hidden w-full max-w-md sm:block md:max-w-lg">
          <Search
            className={cn(
              'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200',
              focused ? 'text-odc-primary' : 'text-odc-text-muted',
            )}
            aria-hidden
          />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder={PLACEHOLDERS[role]}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch?.(searchInputRef.current?.value ?? '');
            }}
            className={cn(
              'h-10 rounded-lg border pl-10 pr-20 transition-all duration-200',
              'bg-odc-surface-alt/40 border-odc-border/60',
              'focus:border-odc-primary/40 focus:bg-odc-surface',
              'focus:shadow-[0_0_0_4px_rgba(255,121,0,0.08)]',
              'focus-visible:ring-0',
            )}
            aria-label="Recherche globale"
          />
          <kbd
            className={cn(
              'pointer-events-none absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5',
              'rounded-md border border-odc-border/80 bg-odc-surface/90 px-1.5 py-0.5',
              'text-[10px] font-semibold text-odc-text-muted',
              'select-none shadow-sm transition-colors duration-200',
              focused && 'border-odc-primary/30 text-odc-primary',
            )}
            aria-hidden
          >
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </kbd>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            ZONE DROITE — Actions (toujours à droite)
            ⚠️ ml-auto ici aussi pour garantir l'alignement à droite
            même quand la recherche est cachée sur mobile
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-9 w-9 rounded-lg text-odc-text-secondary transition-all duration-200 hover:bg-odc-primary/10 hover:text-odc-primary active:scale-95"
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