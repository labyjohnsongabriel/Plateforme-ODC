'use client';

import { Users, CheckCircle2, XCircle, Clock, Hourglass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  sessionId: string;
  stats?: any;
}

export function SelectionStats({ stats }: Props) {
  const cards = [
    {
      label: 'Total',
      value: stats?.total ?? 0,
      icon: Users,
      color: 'text-odc-text-primary bg-odc-surface-alt',
    },
    {
      label: 'En attente',
      value: stats?.enAttente ?? 0,
      icon: Hourglass,
      color: 'text-odc-warning bg-odc-warning-bg',
    },
    {
      label: 'Acceptées',
      value: stats?.acceptees ?? 0,
      icon: CheckCircle2,
      color: 'text-odc-success bg-odc-success-bg',
    },
    {
      label: 'Refusées',
      value: stats?.refusees ?? 0,
      icon: XCircle,
      color: 'text-odc-error bg-odc-error-bg',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center', c.color)}>
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