'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/formatters';
import { useAuthStore } from '@/store/auth.store';

export function ConversationList() {
  const currentUserId = useAuthStore((s) => s.user?.id);

  const { data, isLoading } = useQuery({
    queryKey: ['messagerie', 'conversations'],
    queryFn: async () => {
      const { data } = await api.get('/messagerie/conversations');
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <Card className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </Card>
    );
  }

  const conversations = data ?? [];

  if (!conversations.length) {
    return (
      <Card>
        <EmptyState
          icon={MessageSquare}
          title="Aucune conversation"
          description="Démarrez une nouvelle conversation avec un membre."
        />
      </Card>
    );
  }

  return (
    <Card>
      <ul className="divide-y divide-odc-border">
        {conversations.map((c: any) => {
          const other = c.estGroupe
            ? null
            : c.membres?.find((m: any) => m.id !== currentUserId);

          return (
            <li key={c.id}>
              <Link
                href={`/messagerie/${c.id}`}
                className="flex items-center gap-4 p-4 hover:bg-odc-surface-alt/50 transition-colors"
              >
                {c.estGroupe ? (
                  <div className="w-12 h-12 rounded-full bg-odc-primary-soft flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-odc-primary" />
                  </div>
                ) : (
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={other?.photoUrl ?? undefined} />
                    <AvatarFallback className="bg-odc-primary-soft text-odc-primary font-display font-bold">
                      {getInitials(other?.nom ?? '', other?.prenom ?? '')}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">
                      {c.estGroupe
                        ? c.titre
                        : `${other?.prenom ?? ''} ${other?.nom ?? ''}`}
                    </p>
                    {c.dernierMessageAt && (
                      <span className="text-xs text-odc-muted shrink-0">
                        {formatRelativeTime(c.dernierMessageAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-xs text-odc-muted truncate">
                      {c.messages?.[0]?.contenu ?? 'Aucun message'}
                    </p>
                    {!c.estGroupe && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {other?.role?.libelle ?? other?.role?.nom}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}