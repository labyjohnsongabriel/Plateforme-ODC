'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ============================================================================
   LABELS DE TRADUCTION
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
  'audit-logs': "Journal d'audit",
  exports: 'Exports',
  parametres: 'Paramètres',
  nouveau: 'Nouveau',
  'nouvelle': 'Nouvelle',
  edition: 'Édition',
  details: 'Détails',
};

/* ============================================================================
   TYPES
   ============================================================================ */

interface Crumb {
  href: string;
  label: string;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function AdminBreadcrumb() {
  const pathname = usePathname();

  /* -------------------- Construction des miettes -------------------- */
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

  /* -------------------- Rendu -------------------- */
  return (
    <nav aria-label="Fil d'Ariane" className="mb-5">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {/* Racine */}
        <li>
          <Link
            href="/admin/dashboard"
            className={cn(
              'group inline-flex items-center gap-1.5 rounded-md px-2 py-1',
              'text-odc-text-muted',
              'transition-colors duration-odc-fast',
              'hover:bg-odc-surface-hover hover:text-odc-primary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-odc-primary/40',
            )}
            aria-label="Tableau de bord administrateur"
          >
            <Home
              className="h-3.5 w-3.5 transition-transform group-hover:scale-110"
              aria-hidden="true"
            />
            <span className="font-medium">Admin</span>
          </Link>
        </li>

        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li key={crumb.href} className="flex items-center gap-1">
              <ChevronRight
                className="h-3.5 w-3.5 shrink-0 text-odc-text-disabled"
                aria-hidden="true"
              />

              {isLast ? (
                <span
                  aria-current="page"
                  className={cn(
                    'inline-flex items-center rounded-md px-2 py-1',
                    'bg-odc-primary-soft',
                    'text-xs font-semibold text-odc-primary-active',
                  )}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className={cn(
                    'inline-flex items-center rounded-md px-2 py-1',
                    'text-odc-text-muted',
                    'transition-colors duration-odc-fast',
                    'hover:bg-odc-surface-hover hover:text-odc-primary',
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