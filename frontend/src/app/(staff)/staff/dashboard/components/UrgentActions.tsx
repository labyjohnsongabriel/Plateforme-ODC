// src/app/(staff)/staff/dashboard/components/UrgentActions.tsx
'use client';

import Link from 'next/link';
import {
  UserCheck,
  CalendarPlus,
  Award,
  FolderOpen,
  QrCode,
  BookOpen,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const ACTIONS = [
  {
    icon: UserCheck,
    title: 'Sélectionner des candidats',
    description: 'Valider les inscriptions en attente',
    href: '/staff/selections',
    tone: 'warning',
    badge: 'Prioritaire',
  },
  {
    icon: CalendarPlus,
    title: 'Créer une session',
    description: 'Planifier une nouvelle session',
    href: '/staff/sessions/nouveau',
    tone: 'info',
  },
  {
    icon: QrCode,
    title: 'Gérer les présences',
    description: 'Ouvrir un QR code de présence',
    href: '/staff/presences',
    tone: 'primary',
  },
  {
    icon: Award,
    title: 'Générer des attestations',
    description: 'Pour les sessions terminées',
    href: '/staff/attestations',
    tone: 'success',
  },
  {
    icon: BookOpen,
    title: 'Créer une formation',
    description: 'Ajouter au catalogue',
    href: '/staff/formations/nouveau',
    tone: 'purple',
  },
  {
    icon: FolderOpen,
    title: 'Ajouter une ressource',
    description: 'Uploader un support',
    href: '/staff/ressources',
    tone: 'neutral',
  },
] as const;

const TONE_STYLES: Record<
  string,
  { iconBg: string; iconColor: string; ring: string; hover: string }
> = {
  primary: {
    iconBg: 'bg-primary/10 dark:bg-primary/15',
    iconColor: 'text-primary',
    ring: 'ring-primary/20',
    hover: 'hover:border-primary/40',
  },
  warning: {
    iconBg: 'bg-amber-50 dark:bg-amber-500/10',
    iconColor: 'text-amber-700 dark:text-amber-300',
    ring: 'ring-amber-200 dark:ring-amber-500/30',
    hover: 'hover:border-amber-500/40',
  },
  success: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-200 dark:ring-emerald-500/30',
    hover: 'hover:border-emerald-500/40',
  },
  info: {
    iconBg: 'bg-sky-50 dark:bg-sky-500/10',
    iconColor: 'text-sky-700 dark:text-sky-300',
    ring: 'ring-sky-200 dark:ring-sky-500/30',
    hover: 'hover:border-sky-500/40',
  },
  purple: {
    iconBg: 'bg-violet-50 dark:bg-violet-500/10',
    iconColor: 'text-violet-700 dark:text-violet-300',
    ring: 'ring-violet-200 dark:ring-violet-500/30',
    hover: 'hover:border-violet-500/40',
  },
  neutral: {
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    ring: 'ring-border',
    hover: 'hover:border-border',
  },
};

export function UrgentActions() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div>
          <CardTitle className="text-base">Actions rapides</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Accédez directement aux tâches courantes
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary dark:bg-primary/15">
          {ACTIONS.length} raccourcis
        </span>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            const tone = TONE_STYLES[a.tone];

            return (
              <Link
                key={a.href}
                href={a.href}
                className={cn(
                  'group relative flex flex-col gap-3 overflow-hidden rounded-xl border p-4 transition-all duration-300',
                  'border-border bg-card',
                  'hover:-translate-y-1 hover:shadow-md',
                  tone.hover,
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute inset-x-0 top-0 h-px',
                    'bg-gradient-to-r from-transparent via-primary/60 to-transparent',
                    'opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                  )}
                />

                <div className="flex items-start justify-between gap-2">
                  <div
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3',
                      tone.iconBg,
                      tone.iconColor,
                      tone.ring,
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <ArrowUpRight
                    aria-hidden="true"
                    className={cn(
                      'h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-300',
                      'group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
                      'group-hover:text-primary group-hover:opacity-100',
                    )}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-1.5">
                    <p className="truncate text-sm font-semibold leading-tight text-foreground group-hover:text-primary">
                      {a.title}
                    </p>
                    {'badge' in a && a.badge && (
                      <span className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
                        {a.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {a.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}