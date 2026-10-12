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
  Users,
  Settings,
  FileCheck,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ROUTES } from '@/lib/routes';

/* ============================================================================
   ACTIONS
   ============================================================================ */

const ACTIONS = [
  {
    label: 'Nouvel utilisateur',
    href: '/admin/utilisateurs?action=new',
    icon: UserPlus,
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
  },
  {
    label: 'Nouvelle formation',
    href: '/admin/formations/nouveau',
    icon: BookOpen,
    color: 'text-odc-primary bg-odc-primary-soft',
  },
  {
    label: 'Nouvelle session',
    href: '/admin/sessions/nouveau',
    icon: Calendar,
    color: 'text-green-600 bg-green-50 dark:bg-green-950',
  },
  {
    label: 'Nouveau partenaire',
    href: '/admin/partenaires/nouveau',
    icon: Building2,
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950',
  },
  {
    label: 'Gérer attestations',
    href: '/admin/attestations',
    icon: Award,
    color: 'text-pink-600 bg-pink-50 dark:bg-pink-950',
  },
  {
    label: 'Voir inscriptions',
    href: '/admin/inscriptions',
    icon: FileCheck,
    color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950',
  },
  {
    label: 'Statistiques',
    href: '/admin/statistiques',
    icon: BarChart3,
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950',
  },
  {
    label: 'Exporter données',
    href: '/admin/exports',
    icon: Download,
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
  },
];

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function QuickActions() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-odc-text-primary">
            Actions rapides
          </h3>
          <span className="text-xs text-odc-muted">
            {ACTIONS.length} raccourcis
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.href}
                href={a.href}
                className="group flex items-center gap-3 px-3 py-3 rounded-lg border border-odc-border bg-odc-surface hover:border-odc-primary hover:bg-odc-primary-soft/30 transition-all"
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${a.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium truncate">
                  {a.label}
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}