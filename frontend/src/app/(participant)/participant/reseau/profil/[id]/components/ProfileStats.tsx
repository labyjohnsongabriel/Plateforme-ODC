// src/app/(participant)/participant/reseau/profil/[id]/components/ProfileStats.tsx
'use client';

import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Award,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ProfileUser } from './ProfileDetail';

interface Props {
  profile: ProfileUser;
}

const STAT_CONFIG = [
  {
    key: 'connections' as const,
    label: 'Connexions',
    icon: Users,
    href: '/participant/reseau/connexions',
    color: 'text-sky-700 dark:text-sky-300',
    bg: 'bg-sky-50 dark:bg-sky-500/10',
    ring: 'ring-sky-200 dark:ring-sky-500/30',
  },
  {
    key: 'formations' as const,
    label: 'Formations',
    icon: GraduationCap,
    href: '/participant/formations',
    color: 'text-violet-700 dark:text-violet-300',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    ring: 'ring-violet-200 dark:ring-violet-500/30',
  },
  {
    key: 'attestations' as const,
    label: 'Attestations',
    icon: Award,
    href: '/participant/attestations',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    ring: 'ring-emerald-200 dark:ring-emerald-500/30',
  },
  {
    key: 'sessions' as const,
    label: 'Sessions',
    icon: Calendar,
    href: '/participant/formations',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    ring: 'ring-amber-200 dark:ring-amber-500/30',
  },
];

export function ProfileStats({ profile }: Props) {
  const stats = profile?.stats ?? {};

  // Garder uniquement les stats qui ont une valeur (pas undefined, pas null)
  const visibleStats = STAT_CONFIG.filter((s) => {
    const value = stats[s.key];
    return typeof value === 'number';
  });

  // Si aucune stat n'est disponible → ne rien afficher
  if (visibleStats.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Statistiques</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {visibleStats.map((s) => {
          const value = stats[s.key] as number;
          const Icon = s.icon;

          return (
            <Link
              key={s.key}
              href={s.href}
              className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 transition-transform group-hover:scale-105',
                    s.bg,
                    s.color,
                    s.ring,
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-display text-lg font-bold tabular-nums text-foreground">
                    {value.toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
              <ArrowRight
                className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}