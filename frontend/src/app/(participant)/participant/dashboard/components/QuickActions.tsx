'use client';

import Link from 'next/link';
import {
  QrCode,
  Award,
  Users,
  BookOpen,
  ArrowUpRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════════════════ */

const ACTIONS = [
  {
    icon: QrCode,
    title: 'Scanner un QR',
    description: 'Enregistrer ma présence',
    href: '/participant/presences/scanner',
    tone: 'primary',
    featured: true,
  },
  {
    icon: Award,
    title: 'Mes attestations',
    description: 'Télécharger mes diplômes',
    href: '/participant/attestations',
    tone: 'purple',
  },
  {
    icon: Users,
    title: 'Annuaire',
    description: 'Découvrir la communauté',
    href: '/participant/reseau/annuaire',
    tone: 'info',
  },
  {
    icon: BookOpen,
    title: 'Catalogue',
    description: 'Nouvelles formations',
    href: '/formations',
    tone: 'success',
  },
] as const;

const TONES: Record<
  string,
  { iconBg: string; iconColor: string; ring: string; hover: string }
> = {
  primary: {
    iconBg: 'bg-odc-primary/10',
    iconColor: 'text-odc-primary',
    ring: 'ring-odc-primary/20',
    hover: 'hover:border-odc-primary/40 hover:shadow-odc-primary/10',
  },
  purple: {
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-600 dark:text-purple-400',
    ring: 'ring-purple-500/20',
    hover: 'hover:border-purple-500/40 hover:shadow-purple-500/10',
  },
  info: {
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/20',
    hover: 'hover:border-blue-500/40 hover:shadow-blue-500/10',
  },
  success: {
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/20',
    hover: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function QuickActions() {
  return (
    <Card variant="elevated" padding="lg">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="font-display text-base font-semibold tracking-tight">
            Accès rapides
          </h3>
          <p className="text-odc-muted mt-0.5 text-xs">
            Vos raccourcis les plus utilisés
          </p>
        </div>
        <span className="bg-odc-primary-soft text-odc-primary inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold">
          {ACTIONS.length} raccourcis
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          const tone = TONES[a.tone];

          return (
            <Link
              key={a.href}
              href={a.href}
              className={cn(
                'group relative flex flex-col gap-3 overflow-hidden rounded-xl border p-4',
                'border-odc-border-light bg-white transition-all duration-300',
                'dark:border-odc-border-dark dark:bg-odc-surface-dark',
                'hover:-translate-y-1 hover:shadow-odc-lg',
                tone.hover,
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-odc-primary focus-visible:ring-offset-2',
                'featured' in a && a.featured && 'ring-1 ring-odc-primary/20',
              )}
            >
              {/* Bandeau gradient hover */}
              <span
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute inset-x-0 top-0 h-px',
                  'bg-gradient-to-r from-transparent via-odc-primary/60 to-transparent',
                  'opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                )}
              />

              {/* Icône + flèche */}
              <div className="flex items-start justify-between gap-2">
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-xl ring-1',
                    'transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3',
                    tone.iconBg,
                    tone.iconColor,
                    tone.ring,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <ArrowUpRight
                  aria-hidden="true"
                  className={cn(
                    'text-odc-muted h-4 w-4 shrink-0',
                    'opacity-0 transition-all duration-300',
                    'group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
                    'group-hover:text-odc-primary group-hover:opacity-100',
                  )}
                />
              </div>

              {/* Texte */}
              <div className="min-w-0 flex-1">
                <p className="text-odc-text-primary truncate text-sm font-semibold leading-tight">
                  {a.title}
                </p>
                <p className="text-odc-muted mt-0.5 truncate text-xs">
                  {a.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}