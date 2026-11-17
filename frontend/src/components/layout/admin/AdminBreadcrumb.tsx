// src/components/layout/admin/AdminBreadcrumb.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ============================================================================
   LABELS
   ============================================================================ */

const LABELS: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Tableau de bord',
  utilisateurs: 'Utilisateurs',
  roles: 'Rôles',
  domaines: 'Domaines',
  formations: 'Formations',
  sessions: 'Sessions',
  partenaires: 'Partenaires',
  attestations: 'Attestations',
  presences: 'Présences',
  'audit-logs': "Journal d'audit",
  exports: 'Exports',
  parametres: 'Paramètres',
  nouveau: 'Nouveau',
  nouvelle: 'Nouvelle',
  edition: 'Édition',
  details: 'Détails',
};

interface Crumb {
  href: string;
  label: string;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function AdminBreadcrumb() {
  const pathname = usePathname();

  const crumbs = React.useMemo<Crumb[]>(() => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return [];

    return segments.slice(1).map((segment, index) => {
      const href = `/${segments.slice(0, index + 2).join('/')}`;
      const label = LABELS[segment] ?? decodeURIComponent(segment);
      return { href, label };
    });
  }, [pathname]);

  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Fil d'Ariane"
      className="mb-5"
    >
      <ol
        className={cn(
          'inline-flex flex-wrap items-center gap-0.5 rounded-xl px-2 py-1.5',
          // Fond glass subtil
          'bg-odc-surface-alt/40 border border-odc-border/40',
          'backdrop-blur-sm',
        )}
      >
        {/* ─── Racine ─── */}
        <li>
          <Link
            href="/admin/dashboard"
            className={cn(
              'group inline-flex items-center gap-1.5 rounded-lg px-2 py-1',
              'text-odc-text-muted text-xs font-medium',
              'transition-all duration-200',
              'hover:bg-odc-primary/10 hover:text-odc-primary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-odc-primary/40',
            )}
            aria-label="Tableau de bord administrateur"
          >
            <Home
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110"
              aria-hidden="true"
            />
            <span>Admin</span>
          </Link>
        </li>

        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li
              key={crumb.href}
              className="flex items-center"
            >
              {/* Chevron séparateur */}
              <ChevronRight
                className="text-odc-text-disabled h-3 w-3 shrink-0"
                aria-hidden="true"
              />

              {isLast ? (
                /* ─── Dernier (page actuelle) ─── */
                <span
                  aria-current="page"
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-2 py-1',
                    'bg-gradient-to-br from-odc-primary/15 to-odc-primary/10',
                    'text-odc-primary text-xs font-semibold',
                    'ring-1 ring-odc-primary/20',
                  )}
                >
                  <span
                    className="bg-odc-primary h-1.5 w-1.5 rounded-full"
                    aria-hidden="true"
                  />
                  {crumb.label}
                </span>
              ) : (
                /* ─── Intermédiaire ─── */
                <Link
                  href={crumb.href}
                  className={cn(
                    'inline-flex items-center rounded-lg px-2 py-1',
                    'text-odc-text-muted text-xs font-medium',
                    'transition-all duration-200',
                    'hover:bg-odc-primary/10 hover:text-odc-primary',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-odc-primary/40',
                  )}
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}