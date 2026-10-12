'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { getInitials } from '@/lib/utils';

interface Props { sessionId: string }

export function ParticipantsList({ sessionId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['formateur', 'session', sessionId, 'participants'],
    queryFn: async () => {
      const { data } = await api.get(`/formateur/sessions/${sessionId}/participants`);
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const participants = data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-odc-primary" />
          Participants
          <Badge variant="outline" className="ml-1">{participants.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {participants.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aucun participant"
            description="Aucun participant accepté pour cette session."
          />
        ) : (
          <ul className="divide-y divide-odc-border">
            {participants.map((p: any) => (
              <li key={p.id} className="flex items-center gap-3 p-4 hover:bg-odc-surface-alt/50 transition-colors">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={p.photoUrl ?? undefined} />
                  <AvatarFallback className="bg-odc-primary-soft text-odc-primary text-xs font-medium">
                    {getInitials(p.nom, p.prenom)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {p.prenom} {p.nom}
                  </p>
                  <p className="text-xs text-odc-muted truncate flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {p.email}
                  </p>
                  {p.telephone && (
                    <p className="text-xs text-odc-muted truncate flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" /> {p.telephone}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}