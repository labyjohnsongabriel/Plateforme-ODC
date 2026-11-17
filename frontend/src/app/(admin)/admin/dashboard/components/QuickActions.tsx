// src/app/(admin)/admin/dashboard/components/QuickActions.tsx
'use client';

import Link from 'next/link';
import {
  UserPlus,
  BookOpen,
  Calendar,
  Building2,
  Award,
  Download,
  FileCheck,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/* ============================================================================
   ACTIONS — couleurs Tailwind sémantiques (light + dark explicites)
   ============================================================================ */

const ACTIONS = [
  {
    label: 'Nouvel utilisateur',
    description: 'Créer un compte',
    href: '/admin/utilisateurs?action=new',
    icon: UserPlus,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    ring: 'ring-blue-500/20',
    glow: 'group-hover:shadow-blue-500/20',
  },
  {
    label: 'Nouvelle formation',
    description: 'Publier un cours',
    href: '/admin/formations/nouveau',
    icon: BookOpen,
    color: 'text-primary',
    bg: 'bg-primary/10 dark:bg-primary/15',
    ring: 'ring-primary/20',
    glow: 'group-hover:shadow-primary/20',
  },
  {
    label: 'Nouvelle session',
    description: 'Planifier',
    href: '/admin/sessions/nouveau',
    icon: Calendar,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    ring: 'ring-emerald-500/20',
    glow: 'group-hover:shadow-emerald-500/20',
  },
  {
    label: 'Nouveau partenaire',
    description: 'Ajouter',
    href: '/admin/partenaires/nouveau',
    icon: Building2,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    ring: 'ring-purple-500/20',
    glow: 'group-hover:shadow-purple-500/20',
  },
  {
    label: 'Attestations',
    description: 'Gérer',
    href: '/admin/attestations',
    icon: Award,
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-500/10 dark:bg-pink-500/15',
    ring: 'ring-pink-500/20',
    glow: 'group-hover:shadow-pink-500/20',
  },
  {
    label: 'Inscriptions',
    description: 'Consulter',
    href: '/admin/inscriptions',
    icon: FileCheck,
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    ring: 'ring-cyan-500/20',
    glow: 'group-hover:shadow-cyan-500/20',
  },
  {
    label: 'Statistiques',
    description: 'Analyser',
    href: '/admin/statistiques',
    icon: BarChart3,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    ring: 'ring-indigo-500/20',
    glow: 'group-hover:shadow-indigo-500/20',
  },
  {
    label: 'Exporter',
    description: 'Télécharger',
    href: '/admin/exports',
    icon: Download,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    ring: 'ring-amber-500/20',
    glow: 'group-hover:shadow-amber-500/20',
  },
];

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function QuickActions() {
  return (
    <Card className="overflow-hidden bg-card p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            Actions rapides
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Accédez directement aux tâches courantes
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
          {ACTIONS.length} raccourcis
        </span>
      </div>

      {/* Grille */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.href}
              href={a.href}
              className={cn(
                'group relative flex flex-col gap-3 overflow-hidden rounded-xl border p-3.5',
                'border-border bg-card transition-all duration-300',
                // Hover
                'hover:-translate-y-1 hover:border-transparent hover:shadow-lg',
                // Focus
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                // Glow au hover (couleur par action)
                a.glow,
              )}
            >
              {/* Bandeau gradient au hover */}
              <span
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute inset-x-0 top-0 h-px',
                  'bg-gradient-to-r from-transparent via-primary/60 to-transparent',
                  'opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                )}
              />

              {/* Icône */}
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1',
                  'transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3',
                  a.bg,
                  a.ring,
                  a.color,
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>

              {/* Texte */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight text-foreground">
                  {a.label}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {a.description}
                </p>
              </div>

              {/* Flèche hover */}
              <ArrowUpRight
                aria-hidden="true"
                className={cn(
                  'absolute right-3 top-3 h-3.5 w-3.5 text-muted-foreground',
                  'opacity-0 transition-all duration-300',
                  'group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
                  'group-hover:text-primary group-hover:opacity-100',
                )}
              />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}