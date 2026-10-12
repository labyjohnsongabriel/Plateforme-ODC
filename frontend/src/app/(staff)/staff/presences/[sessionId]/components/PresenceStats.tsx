'use client';

import { CheckCircle2, XCircle, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  presences: any[];
}

export function PresenceStats({ presences }: Props) {
  const presents = presences.filter((p) => p.present).length;
  const absents = presences.filter((p) => !p.present).length;
  const retards = presences.filter((p) => p.statut === 'RETARD').length;
  const total = presences.length;
  const taux = total > 0 ? Math.round((presents / total) * 100) : 0;

  const cards = [
    { label: 'Présents', value: presents, icon: CheckCircle2, color: 'text-odc-success bg-odc-success-bg' },
    { label: 'Absents', value: absents, icon: XCircle, color: 'text-odc-error bg-odc-error-bg' },
    { label: 'Retards', value: retards, icon: Clock, color: 'text-odc-warning bg-odc-warning-bg' },
    { label: 'Taux présence', value: `${taux}%`, icon: Users, color: 'text-odc-primary bg-odc-primary-soft' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', c.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{c.value}</p>
                <p className="text-xs text-odc-muted">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}