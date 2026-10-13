'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

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
  'audit-logs': 'Journal d\'audit',
  exports: 'Exports',
  parametres: 'Paramètres',
  nouveau: 'Nouveau',
};

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <nav aria-label="Fil d'Ariane" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-odc-muted">
        <li>
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1 hover:text-odc-primary transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            Admin
          </Link>
        </li>

        {segments.slice(1).map((segment, index) => {
          const isLast = index === segments.length - 2;
          const href = '/' + segments.slice(0, index + 2).join('/');
          const label = LABELS[segment] ?? segment;

          return (
            <li key={href} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 opacity-50" />
              {isLast ? (
                <span className="text-odc-text-primary font-medium">{label}</span>
              ) : (
                <Link href={href} className="hover:text-odc-primary transition-colors">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}