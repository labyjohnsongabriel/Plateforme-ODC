'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Users, MapPin, Building2, UserPlus, Mail, Briefcase, Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Pagination } from '@/components/shared/Pagination';
import { MemberCard } from './MemberCard';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

export function DirectoryGrid() {
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
    q: searchParams.get('q') ?? undefined,
    role: searchParams.get('role') ?? undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['participant', 'annuaire', filters],
    queryFn: async () => {
      const { data } = await api.get('/participant/reseau/annuaire', {
        params: filters,
      });
      return data;
    },
  });

  const connectMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.post(`/participant/reseau/demandes/${userId}`, {
        message: 'Bonjour, je souhaite rejoindre votre réseau.',
      });
    },
    onSuccess: () => {
      toast.success('Demande de connexion envoyée');
      qc.invalidateQueries({ queryKey: ['participant', 'annuaire'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
      </div>
    );
  }

  const users = data?.data ?? [];

  if (!users.length) {
    return (
      <Card>
        <EmptyState
          icon={Users}
          title="Aucun membre trouvé"
          description="Essayez de modifier vos filtres."
        />
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u: any) => (
          <MemberCard
            key={u.id}
            user={u}
            onConnect={() => connectMutation.mutate(u.id)}
            isConnecting={connectMutation.isPending}
          />
        ))}
      </div>

      {data?.pagination?.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
          />
        </div>
      )}
    </>
  );
}