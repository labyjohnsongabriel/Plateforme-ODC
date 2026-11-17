'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

const SEGMENT_LABELS: Record<string, string> = {
  formateur: 'Formateur',
  participant: 'Participant',
  staff: 'Staff',
  admin: 'Administrateur',
  dashboard: 'Tableau de bord',
  evaluations: 'Évaluations',
  notes: 'Notes',
  sessions: 'Sessions',
  participants: 'Participants',
  formations: 'Formations',
  profil: 'Profil',
  parametres: 'Paramètres',
  nouveau: 'Nouveau',
  nouvelle: 'Nouvelle',
  edit: 'Édition',
};

const DASHBOARD_ROOTS = new Set([
  'formateur', 'participant', 'staff', 'admin',
]);

function humanize(segment: string): string {
  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];
  // UUID ou id : on affiche "Détail"
  if (/^[0-9a-f]{8}-/i.test(segment) || segment.length > 20) {
    return 'Détail';
  }
  // camelCase → Camel Case
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, (c) => c.toUpperCase());
}

interface Props {
  /** Segment racine à masquer (ex: 'formateur') */
  rootSegment: string;
  className?: string;
}

export function HeaderBreadcrumb({ rootSegment, className = '' }: Props) {
  const pathname = usePathname();
  if (!pathname) return null;

  const segments = pathname.split('/').filter(Boolean);

  // Construire les items en ignorant le root
  const items: { label: string; href: string }[] = [];
  let acc = '';

  segments.forEach((segment, index) => {
    acc += `/${segment}`;
    if (index === 0 && DASHBOARD_ROOTS.has(segment)) return;
    items.push({ label: humanize(segment), href: acc });
  });

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Fil d'Ariane"
      className={`hidden items-center gap-1.5 text-sm md:flex ${className}`}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <div key={item.href} className="flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight
                className="h-3.5 w-3.5 shrink-0 text-odc-text-muted"
                aria-hidden
              />
            )}
            {isLast ? (
              <span
                className="max-w-[200px] truncate font-medium text-odc-text-primary"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="max-w-[150px] truncate text-odc-text-muted transition-colors hover:text-odc-primary"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}