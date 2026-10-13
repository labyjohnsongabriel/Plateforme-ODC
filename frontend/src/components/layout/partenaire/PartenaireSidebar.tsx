'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Calendar, Building2, User,
  ChevronLeft, ChevronRight, LogOut, Handshake, MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui.store';
import { useAuth } from '@/hooks/useAuth';

const SECTIONS = [
  {
    label: 'Général',
    items: [
      { href: '/partenaire/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Découvrir',
    items: [
      { href: '/partenaire/formations', label: 'Formations', icon: BookOpen },
      { href: '/partenaire/sessions', label: 'Sessions', icon: Calendar },
    ],
  },
  {
    label: 'Mon compte',
    items: [
      { href: '/partenaire/fiche', label: 'Ma fiche', icon: Building2 },
      { href: '/partenaire/profil', label: 'Mon profil', icon: User },
      { href: '/messagerie', label: 'Messagerie', icon: MessageSquare },
    ],
  },
];

export function PartenaireSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore();
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        'h-screen flex flex-col bg-odc-surface border-r border-odc-border transition-all duration-300',
        sidebarCollapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 h-16 px-4 border-b border-odc-border shrink-0">
        <Link href="/partenaire/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shrink-0">
            <Handshake className="h-5 w-5" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-sm">Espace Partenaire</span>
              <span className="text-xs text-odc-muted">Orange Digital Center</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            {!sidebarCollapsed && (
              <p className="text-[10px] uppercase tracking-wider text-odc-muted font-semibold px-3 mb-2">
                {section.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'sidebar-link',
                        active && 'sidebar-link-active',
                        sidebarCollapsed && 'justify-center',
                      )}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User + Actions */}
      <div className="border-t border-odc-border p-3 space-y-1 shrink-0">
        {!sidebarCollapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-medium">
              {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">
                {user.prenom} {user.nom}
              </p>
              <p className="text-[10px] text-odc-muted truncate">Partenaire</p>
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
            <><ChevronLeft className="h-4 w-4" /><span>Replier</span></>
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
  );
}