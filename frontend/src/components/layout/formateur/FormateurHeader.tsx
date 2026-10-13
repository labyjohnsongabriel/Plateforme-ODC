'use client';

import Link from 'next/link';
import { Bell, Search, Home, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useNotificationStore } from '@/store/notification.store';
import { useUIStore } from '@/store/ui.store';

export function FormateurHeader() {
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="h-16 border-b border-odc-border bg-odc-surface sticky top-0 z-30 shrink-0">
      <div className="h-full px-4 sm:px-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden h-9 w-9"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1 max-w-md relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-odc-muted pointer-events-none" />
          <Input
            type="search"
            placeholder="Rechercher une session, un participant…"
            className="pl-9 h-9 input-odc"
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href="/" aria-label="Voir le site">
              <Home className="h-5 w-5" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-9 w-9 relative"
            aria-label="Notifications"
          >
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-odc-error text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}