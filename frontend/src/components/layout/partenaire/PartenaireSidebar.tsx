// src/components/layout/partenaire/PartenaireSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Building2,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Handshake,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui.store';
import { useMessagerieStore } from '@/store/messagerie.store';
import { useMessagerieModalStore } from '@/store/messagerie-modal.store';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/routes';

interface SectionItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badgeKey?: 'messages';
  modalTrigger?: 'messagerie';
}

interface Section {
  label: string;
  items: SectionItem[];
}

const SECTIONS: Section[] = [
  {
    label: 'Général',
    items: [
      { href: ROUTES.partenaire.dashboard, label: 'Tableau de bord', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Découvrir',
    items: [
      { href: ROUTES.partenaire.formations, label: 'Formations', icon: BookOpen },
      { href: ROUTES.partenaire.sessions, label: 'Sessions', icon: Calendar },
    ],
  },
  {
    label: 'Communication',
    items: [
      {
        href: ROUTES.common.messagerie,
        label: 'Messagerie',
        icon: MessageSquare,
        badgeKey: 'messages',
        modalTrigger: 'messagerie',
      },
    ],
  },
  {
    label: 'Mon compte',
    items: [
      { href: ROUTES.partenaire.fiche, label: 'Ma fiche', icon: Building2 },
      { href: ROUTES.partenaire.profil, label: 'Mon profil', icon: User },
    ],
  },
];

export function PartenaireSidebar() {
  const pathname = usePathname();
  const {
    sidebarCollapsed,
    sidebarMobileOpen,
    setSidebarMobileOpen,
    toggleSidebarCollapse,
  } = useUIStore();
  const unreadMessages = useMessagerieStore((s) => s.unreadCount);
  const openMessagerie = useMessagerieModalStore((s) => s.open);
  const { user, logout } = useAuth();

  const closeMobile = () => setSidebarMobileOpen(false);

  return (
    <>
      {sidebarMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
          onClick={closeMobile}
          aria-label="Fermer le menu"
        />
      )}

      <aside
        className={cn(
          'border-odc-border bg-odc-surface fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r transition-all duration-300 lg:sticky lg:top-0 lg:z-auto lg:translate-x-0',
          sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full',
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64',
        )}
      >
        {/* Logo */}
        <div className="border-odc-border flex h-16 shrink-0 items-center gap-2.5 border-b px-4">
          <Link
            href={ROUTES.partenaire.dashboard}
            onClick={closeMobile}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 text-white">
              <Handshake className="h-5 w-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col leading-tight">
                <span className="font-display text-sm font-bold">Espace Partenaire</span>
                <span className="text-odc-muted text-xs">Orange Digital Center</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {SECTIONS.map((section) => (
            <div key={section.label}>
              {!sidebarCollapsed && (
                <p className="text-odc-muted mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider">
                  {section.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const badge =
                    item.badgeKey === 'messages' ? unreadMessages : undefined;

                  // ⭐ MODAL TRIGGER
                  if (item.modalTrigger === 'messagerie') {
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            closeMobile();
                            openMessagerie();
                          }}
                          className={cn(
                            'sidebar-link relative',
                            sidebarCollapsed && 'justify-center',
                          )}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {!sidebarCollapsed && (
                            <span className="truncate flex-1">{item.label}</span>
                          )}
                          {badge !== undefined && badge > 0 && (
                            <span
                              className={cn(
                                'inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold min-w-[18px] h-[18px] px-1',
                                sidebarCollapsed && 'absolute -top-1 -right-1',
                              )}
                              aria-label={`${badge} message${badge > 1 ? 's' : ''} non lu${badge > 1 ? 's' : ''}`}
                            >
                              {badge > 99 ? '99+' : badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  }

                  const active =
                    pathname === item.href || pathname.startsWith(item.href + '/');

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeMobile}
                        className={cn(
                          'sidebar-link',
                          active && 'sidebar-link-active',
                          sidebarCollapsed && 'justify-center',
                        )}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!sidebarCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User + Actions */}
        <div className="border-odc-border shrink-0 space-y-1 border-t p-3">
          {!sidebarCollapsed && user && (
            <div className="mb-1 flex items-center gap-3 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-xs font-medium text-white">
                {user.prenom?.charAt(0)}
                {user.nom?.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">
                  {user.prenom} {user.nom}
                </p>
                <p className="text-odc-muted truncate text-[10px]">Partenaire</p>
              </div>
            </div>
          )}

          <button
            onClick={toggleSidebarCollapse}
            className={cn('sidebar-link w-full', sidebarCollapsed && 'justify-center')}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Replier</span>
              </>
            )}
          </button>

          <button
            onClick={logout}
            className={cn(
              'sidebar-link w-full text-odc-error hover:bg-odc-error-bg',
              sidebarCollapsed && 'justify-center',
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
}