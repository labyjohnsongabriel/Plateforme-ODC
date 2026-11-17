// src/app/(admin)/admin/dashboard/components/RecentUsers.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { getInitials, cn } from '@/lib/utils';
import { getRoleLabel, getRoleClasses } from '@/types/role.types';
import { QueryErrorState } from '@/components/shared/QueryErrorState';

interface RecentUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  photoUrl?: string | null;
  role?: { nom: string } | null;
}

export function RecentUsers() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery<RecentUser[]>({
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

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nouveaux utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <QueryErrorState
            onRetry={() => { void refetch(); }}
            isRetrying={isFetching}
          />
        </CardContent>
      </Card>
    );
  }

  const users = data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Nouveaux utilisateurs</CardTitle>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link
            href="/admin/utilisateurs"
            className="text-muted-foreground hover:text-foreground"
          >
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
            {users.map((u) => {
              const roleClasses = getRoleClasses(u.role?.nom);
              return (
                <li key={u.id}>
                  <Link
                    href={`/admin/utilisateurs/${u.id}`}
                    className={cn(
                      'group flex items-center gap-3 p-3 rounded-lg border transition-all',
                      'border-border bg-card',
                      'hover:border-primary/40 hover:bg-accent/50',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    )}
                  >
                    <Avatar className="h-9 w-9 shrink-0 ring-2 ring-background">
                      <AvatarImage src={u.photoUrl ?? undefined} />
                      <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                        {getInitials(u.nom, u.prenom)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {u.prenom} {u.nom}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {u.email}
                      </p>
                    </div>

                    <Badge
                      className={cn(
                        'shrink-0 text-[10px] font-medium border',
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