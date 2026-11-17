// src/app/(formateur)/formateur/dashboard/components/QuickAccess.tsx
'use client';

import Link from 'next/link';
import {
  QrCode,
  ClipboardCheck,
  FileText,
  FolderOpen,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Action {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  tone: {
    icon: string;
    ring: string;
  };
}

const ACTIONS: Action[] = [
  {
    icon: QrCode,
    title: 'Ouvrir une présence QR',
    description: 'Générer le QR code pour une session',
    href: '/formateur/presences',
    tone: {
      icon: 'bg-primary/10 text-primary dark:bg-primary/15',
      ring: 'ring-primary/20',
    },
  },
  {
    icon: ClipboardCheck,
    title: 'Créer une évaluation',
    description: 'Quiz, projet, examen…',
    href: '/formateur/evaluations/nouveau',
    tone: {
      icon: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
      ring: 'ring-sky-200 dark:ring-sky-500/30',
    },
  },
  {
    icon: FileText,
    title: 'Saisir des notes',
    description: 'Évaluer les participants',
    href: '/formateur/notes',
    tone: {
      icon: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
      ring: 'ring-emerald-200 dark:ring-emerald-500/30',
    },
  },
  {
    icon: FolderOpen,
    title: 'Uploader une ressource',
    description: 'PDF, vidéo, présentation…',
    href: '/formateur/ressources',
    tone: {
      icon: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
      ring: 'ring-violet-200 dark:ring-violet-500/30',
    },
  },
];

export function QuickAccess() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
          Accès rapides
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Raccourcis vers vos tâches courantes
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.href}
                href={a.href}
                className={cn(
                  'group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all',
                  'hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/40 hover:shadow-md',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg ring-1 transition-transform group-hover:scale-110',
                    a.tone.icon,
                    a.tone.ring,
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary">
                    {a.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.description}
                  </p>
                </div>

                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 self-end text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary"
                />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}