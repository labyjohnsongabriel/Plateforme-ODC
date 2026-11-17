'use client';

import Link from 'next/link';
import { Search, Home, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useUIStore } from '@/store/ui.store';
import { NotificationModal } from '@/components/layout/NotificationModal';

export function PartenaireHeader() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="border-odc-border bg-odc-surface sticky top-0 z-30 h-16 shrink-0 border-b">
      <div className="flex h-full items-center gap-3 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9 lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative hidden max-w-md flex-1 sm:block">
          <Search className="text-odc-muted pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Rechercher une formation, une session…"
            className="input-odc h-9 pl-9"
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href="/" aria-label="Voir le site">
              <Home className="h-5 w-5" />
            </Link>
          </Button>

          <NotificationModal />

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
