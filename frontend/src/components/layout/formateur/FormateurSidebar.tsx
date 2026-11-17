// src/components/layout/formateur/FormateurSidebar.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  QrCode,
  ClipboardCheck,
  FileText,
  FolderOpen,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui.store';
import { useMessagerieStore } from '@/store/messagerie.store';
import { useMessagerieModalStore } from '@/store/messagerie-modal.store';
import { SidebarLogo } from '@/components/shared/SidebarLogo';
import { SidebarLink } from '@/components/shared/SidebarLink';
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
      { href: ROUTES.formateur.dashboard, label: 'Tableau de bord', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Mes sessions',
    items: [
      { href: ROUTES.formateur.sessions, label: 'Mes sessions', icon: Calendar },
      { href: ROUTES.formateur.presences, label: 'Présences QR', icon: QrCode },
    ],
  },
  {
    label: 'Pédagogie',
    items: [
      { href: ROUTES.formateur.evaluations, label: 'Évaluations', icon: ClipboardCheck },
      { href: ROUTES.formateur.notes, label: 'Saisie des notes', icon: FileText },
      { href: ROUTES.formateur.ressources, label: 'Ressources', icon: FolderOpen },
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
];

export function FormateurSidebar() {
  const pathname = usePathname();
  const {
    sidebarCollapsed,
    sidebarMobileOpen,
    setSidebarMobileOpen,
    toggleSidebarCollapse,
  } = useUIStore();
  const unreadMessages = useMessagerieStore((s) => s.unreadCount);
  const openMessagerie = useMessagerieModalStore((s) => s.open);
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (sidebarMobileOpen && asideRef.current) {
      const firstLink = asideRef.current.querySelector<HTMLElement>('a, button');
      firstLink?.focus();
    }
  }, [sidebarMobileOpen]);

  useEffect(() => {
    if (!sidebarMobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarMobileOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [sidebarMobileOpen, setSidebarMobileOpen]);

  useEffect(() => {
    if (!sidebarMobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [sidebarMobileOpen]);

  const closeMobile = () => setSidebarMobileOpen(false);

  return (
    <>
      {sidebarMobileOpen && (
        <button
          type="button"
          onClick={closeMobile}
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 animate-in fade-in bg-black/40 backdrop-blur-sm duration-200 lg:hidden"
        />
      )}

      <aside
        ref={asideRef}
        aria-label="Navigation formateur"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col',
          'border-r border-odc-border bg-odc-surface',
          'transition-[transform,width] duration-300 ease-out',
          'lg:sticky lg:top-0 lg:z-auto lg:translate-x-0',
          sidebarMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none',
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64',
        )}
      >
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-odc-border',
            sidebarCollapsed ? 'justify-center px-2' : 'px-4',
          )}
        >
          <SidebarLogo
            href={ROUTES.formateur.dashboard}
            collapsed={sidebarCollapsed}
            title="Espace Formateur"
            subtitle="Orange Digital Center"
            onNavigate={closeMobile}
          />
        </div>

        <nav
          className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4"
          aria-label="Menu principal"
        >
          {SECTIONS.map((section, index) => (
            <div key={section.label} className={cn(index > 0 && 'mt-6')}>
              {!sidebarCollapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-odc-text-secondary">
                  {section.label}
                </p>
              )}
              {sidebarCollapsed && index > 0 && (
                <div className="mx-auto mb-3 h-px w-8 bg-odc-border" aria-hidden />
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const badge =
                    item.badgeKey === 'messages' ? unreadMessages : undefined;

                  if (item.modalTrigger === 'messagerie') {
                    return (
                      <li key={item.href}>
                        <SidebarLink
                          href={item.href}
                          label={item.label}
                          icon={item.icon}
                          active={false}
                          collapsed={sidebarCollapsed}
                          badge={badge}
                          onClick={(e) => {
                            e.preventDefault();
                            closeMobile();
                            openMessagerie();
                          }}
                        />
                      </li>
                    );
                  }

                  const active =
                    pathname === item.href || pathname?.startsWith(item.href + '/');
                  return (
                    <li key={item.href}>
                      <SidebarLink
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        active={active}
                        collapsed={sidebarCollapsed}
                        badge={badge}
                        onClick={closeMobile}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-odc-border p-3">
          <button
            type="button"
            onClick={toggleSidebarCollapse}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-odc-text-primary transition-colors',
              'hover:bg-odc-surface-alt hover:text-odc-primary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-odc-primary focus-visible:ring-offset-2',
              sidebarCollapsed && 'justify-center',
            )}
            aria-label={sidebarCollapsed ? 'Déplier la sidebar' : 'Replier la sidebar'}
            aria-expanded={!sidebarCollapsed}
          >
            {sidebarCollapsed ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Replier</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}