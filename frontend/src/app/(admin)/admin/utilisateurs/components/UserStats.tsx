// src/app/(admin)/admin/utilisateurs/components/UserStats.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

/* ============================================================================
   TYPES
   ============================================================================ */

interface UserStatsData {
  total: number;
  actifs: number;
  inactifs: number;
  parRole: Array<{ role: string; count: number }>;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function UserStats() {
  const { data, isLoading } = useQuery<UserStatsData>({
    queryKey: ['admin', 'users', 'stats'],
    queryFn: async () => {
      // Récupérer tous les users pour calculer les stats
      const { data } = await api.get('/admin/users', {
        params: { limit: 1000 },
      });

      const users = data.data ?? [];
      const total = users.length;
      const actifs = users.filter((u: any) => u.actif).length;
      const inactifs = total - actifs;

      // Compter par rôle
      const roleMap = new Map<string, number>();
      for (const user of users) {
        const roleNom = user.role?.nom ?? 'INCONNU';
        roleMap.set(roleNom, (roleMap.get(roleNom) ?? 0) + 1);
      }

      const parRole = Array.from(roleMap.entries()).map(([role, count]) => ({
        role,
        count,
      }));

      return { total, actifs, inactifs, parRole };
    },
    staleTime: 60_000,
  });

  /* -------------------- Loading -------------------- */
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  const stats = data ?? { total: 0, actifs: 0, inactifs: 0, parRole: [] };

  const cards = [
    {
      label: 'Total utilisateurs',
      value: stats.total,
      icon: Users,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
      subtitle: 'Toutes catégories',
    },
    {
      label: 'Utilisateurs actifs',
      value: stats.actifs,
      icon: UserCheck,
      color:
        'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
      subtitle: `${
        stats.total > 0
          ? Math.round((stats.actifs / stats.total) * 100)
          : 0
      }% du total`,
    },
    {
      label: 'Utilisateurs inactifs',
      value: stats.inactifs,
      icon: UserX,
      color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
      subtitle: 'À vérifier',
    },
    {
      label: 'Rôles actifs',
      value: stats.parRole.length,
      icon: ShieldCheck,
      color:
        'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
      subtitle: 'Types de comptes',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card
            key={c.label}
            className="animate-fade-in hover:shadow-odc-md transition-shadow"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={cn(
                    'w-11 h-11 rounded-lg flex items-center justify-center',
                    c.color,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <p className="text-3xl font-display font-bold mb-0.5 tabular-nums">
                {c.value.toLocaleString('fr-FR')}
              </p>

              <p className="text-sm font-medium text-odc-text-primary">
                {c.label}
              </p>

              <p className="text-xs text-odc-muted mt-0.5">{c.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}