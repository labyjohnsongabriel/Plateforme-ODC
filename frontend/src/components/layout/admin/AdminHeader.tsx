'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bell, Search, Home, Menu, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useNotificationStore } from '@/store/notification.store';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

/* ============================================================================
   HEADER ADMIN — Version premium
   ============================================================================ */

export function AdminHeader() {
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  /* -------------------- Raccourci clavier Ctrl+K -------------------- */
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      role="banner"
      className={cn(
        // Position & taille
        'sticky top-0 z-30 h-16 shrink-0',
        // Fond glassmorphism premium
        'border-b border-odc-border/80',
        'bg-odc-surface/80 backdrop-blur-xl',
        'supports-[backdrop-filter]:bg-odc-surface/70',
      )}
    >
      <div className="flex h-full items-center gap-3 px-4 sm:px-6">
        {/* ================================================================
            MENU MOBILE
            ================================================================ */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9 lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* ================================================================
            RECHERCHE GLOBALE
            ================================================================ */}
        <div className="relative hidden max-w-md flex-1 sm:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-odc-text-muted"
            aria-hidden="true"
          />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder="Rechercher une formation, un utilisateur..."
            className={cn(
              'input-odc h-10 pl-9 pr-20',
              'bg-odc-surface-alt/50',
              'border-odc-border/60',
              'focus:bg-odc-surface',
            )}
            aria-label="Recherche globale"
          />
          {/* Raccourci clavier */}
          <kbd
            className={cn(
              'pointer-events-none absolute right-2 top-1/2 -translate-y-1/2',
              'inline-flex items-center gap-1 rounded-md',
              'border border-odc-border bg-odc-surface px-1.5 py-0.5',
              'text-[10px] font-medium text-odc-text-muted',
              'select-none',
            )}
            aria-hidden="true"
          >
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </kbd>
        </div>

        {/* ================================================================
            ACTIONS
            ================================================================ */}
        <div className="ml-auto flex items-center gap-1.5">
          {/* Voir le site */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className={cn(
              'h-9 w-9',
              'text-odc-text-secondary hover:text-odc-primary',
              'transition-colors',
            )}
          >
            <Link href="/" aria-label="Voir le site public" target="_blank" rel="noopener noreferrer">
              <Home className="h-4 w-4" />
            </Link>
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className={cn(
              'relative h-9 w-9',
              'text-odc-text-secondary hover:text-odc-primary',
              'transition-colors',
            )}
          >
            <Link href="/notifications" aria-label={`Notifications (${unreadCount} non lues)`}>
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span
                  className={cn(
                    'absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center',
                    'rounded-full bg-odc-error px-1',
                    'text-[10px] font-bold text-white',
                    'ring-2 ring-odc-surface',
                    'animate-pulse-soft',
                  )}
                  aria-hidden="true"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </Button>

          {/* Séparateur vertical */}
          <div
            className="mx-1 h-6 w-px bg-odc-border"
            aria-hidden="true"
          />

          {/* Toggle thème */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}