// src/app/(admin)/admin/dashboard/components/RecentUsers.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, ArrowRight, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { getInitials, cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/formatters';
import { getRoleLabel, getRoleClasses } from '@/types/role.types';

export function RecentUsers() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'recent-users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', {
        params: { limit: 5, sortBy: 'createdAt', sortOrder: 'DESC' },
      });
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const users = data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-odc-primary" />
          <CardTitle className="text-base">Nouveaux utilisateurs</CardTitle>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/utilisateurs">
            Voir tout
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {users.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="Aucun utilisateur"
            size="sm"
          />
        ) : (
          <ul className="space-y-2">
            {users.map((u: any) => {
              const roleClasses = getRoleClasses(u.role?.nom);
              return (
                <li key={u.id}>
                  <Link
                    href={`/admin/utilisateurs/${u.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-odc-border bg-odc-surface hover:border-odc-primary hover:bg-odc-primary-soft/30 transition-all"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={u.photoUrl} />
                      <AvatarFallback className="text-[10px] bg-odc-primary-soft text-odc-primary">
                        {getInitials(u.nom, u.prenom)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {u.prenom} {u.nom}
                      </p>
                      <p className="text-xs text-odc-muted truncate">
                        {u.email}
                      </p>
                    </div>

                    <Badge
                      className={cn(
                        'text-[10px] shrink-0',
                        roleClasses.bg,
                        roleClasses.text,
                      )}
                    >
                      {getRoleLabel(u.role?.nom)}
                    </Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}