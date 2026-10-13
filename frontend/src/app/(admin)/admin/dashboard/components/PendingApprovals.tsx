// src/app/(admin)/admin/dashboard/components/PendingApprovals.tsx
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Clock, UserCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/formatters';

export function PendingApprovals() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'pending'],
    queryFn: async () => {
      const { data } = await api.get('/admin/inscriptions', {
        params: { statut: 'EN_ATTENTE', limit: 5 },
      });
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const items = data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-600" />
          <CardTitle className="text-base">En attente</CardTitle>
          {items.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700 text-xs">
              {items.length}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/inscriptions?statut=EN_ATTENTE">
            Voir tout
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="Aucune demande"
            description="Tout est à jour"
            size="sm"
          />
        ) : (
          <ul className="space-y-2">
            {items.map((item: any) => (
              <li key={item.id}>
                <Link
                  href={`/admin/inscriptions/${item.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 transition-colors"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={item.participant?.photoUrl} />
                    <AvatarFallback className="text-[10px] bg-amber-100 text-amber-700">
                      {getInitials(
                        item.participant?.nom ?? '',
                        item.participant?.prenom ?? '',
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {item.participant?.prenom} {item.participant?.nom}
                    </p>
                    <p className="text-xs text-odc-muted truncate">
                      {item.session?.formation?.titre}
                    </p>
                  </div>

                  <span className="text-[10px] text-odc-muted shrink-0">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}