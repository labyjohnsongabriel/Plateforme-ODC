// src/app/(staff)/staff/presences/[sessionId]/components/PresenceStats.tsx
'use client';

import { CheckCircle2, XCircle, Clock, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Presence {
  id: string;
  participantId: string;
  statut: string;
  present?: boolean;
}

interface Props {
  presences: Presence[];
  participantsCount: number;
}

type Tone = 'success' | 'error' | 'warning' | 'neutral' | 'primary';

const TONES: Record<
  Tone,
  { iconBg: string; iconColor: string; ring: string; bar: string }
> = {
  success: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-200 dark:ring-emerald-500/30',
    bar: 'from-emerald-400 to-emerald-600',
  },
  error: {
    iconBg: 'bg-red-50 dark:bg-red-500/10',
    iconColor: 'text-red-700 dark:text-red-300',
    ring: 'ring-red-200 dark:ring-red-500/30',
    bar: 'from-red-400 to-red-600',
  },
  warning: {
    iconBg: 'bg-amber-50 dark:bg-amber-500/10',
    iconColor: 'text-amber-700 dark:text-amber-300',
    ring: 'ring-amber-200 dark:ring-amber-500/30',
    bar: 'from-amber-400 to-amber-600',
  },
  neutral: {
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    ring: 'ring-border',
    bar: 'from-border to-border',
  },
  primary: {
    iconBg: 'bg-primary/10 dark:bg-primary/15',
    iconColor: 'text-primary',
    ring: 'ring-primary/20',
    bar: 'from-primary to-primary/60',
  },
};

export function PresenceStats({ presences, participantsCount }: Props) {
  const presents = presences.filter((p) => p.present).length;
  const absents = presences.filter((p) => !p.present).length;
  const retards = presences.filter((p) => p.statut === 'RETARD').length;
  const pending = Math.max(participantsCount - presences.length, 0);
  const taux =
    participantsCount > 0 ? Math.round((presents / participantsCount) * 100) : 0;

  const cards = [
    { label: 'Présents', value: presents, icon: CheckCircle2, tone: 'success' as Tone },
    { label: 'Absents', value: absents, icon: XCircle, tone: 'error' as Tone },
    { label: 'Retards', value: retards, icon: Clock, tone: 'warning' as Tone },
    { label: 'À marquer', value: pending, icon: Users, tone: 'neutral' as Tone },
    {
      label: 'Taux présence',
      value: `${taux}%`,
      icon: TrendingUp,
      tone:
        taux >= 75
          ? ('success' as Tone)
          : taux >= 50
            ? ('warning' as Tone)
            : ('error' as Tone),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((c) => {
        const Icon = c.icon;
        const tone = TONES[c.tone];

        return (
          <Card
            key={c.label}
            className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >
            <span
              aria-hidden="true"
              className={cn(
                'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
                tone.bar,
                'opacity-60 transition-opacity duration-300 group-hover:opacity-100',
              )}
            />
            <CardContent className="flex items-center gap-3 p-4 pt-5">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1',
                  tone.iconBg,
                  tone.iconColor,
                  tone.ring,
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-2xl font-bold tabular-nums leading-none text-foreground">
                  {c.value}
                </p>
                <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
                  {c.label}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}