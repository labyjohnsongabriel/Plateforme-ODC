'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DomaineDetails } from './components/DomaineDetails';
import { api } from '@/lib/api';
import type { Domaine } from '@/features/admin/domaines/hooks/useDomaines';

interface Props {
  id: string;
}

export function DomaineDetailsClient({ id }: Props) {
  const router = useRouter();

  const { data: domaine, isLoading, isError, error } = useQuery<Domaine>({
    queryKey: ['admin', 'domaines', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/domaines/${id}`);
      // ⚠️ Selon votre API, la donnée peut être dans data.data ou data
      return data.data ?? data;
    },
    enabled: !!id,
    retry: 1,
  });

  /* ─── Loading ─────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  /* ─── Erreur ──────────────────────────────────────────────────────── */
  if (isError || !domaine) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-odc-error-bg">
          <AlertCircle className="h-8 w-8 text-odc-error" />
        </div>
        <div className="text-center">
          <h2 className="font-display text-lg font-semibold text-odc-text-primary">
            Domaine introuvable
          </h2>
          <p className="mt-1 text-sm text-odc-text-secondary">
            {(error as any)?.response?.status === 404
              ? "Ce domaine n'existe pas ou a été supprimé."
              : 'Une erreur est survenue lors du chargement.'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/admin/domaines')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  /* ─── Détails ─────────────────────────────────────────────────────── */
  return (
    <div className="animate-fade-in space-y-6">
      <DomaineDetails
        domaine={domaine}
        onBack={() => router.push('/admin/domaines')}
        onEdit={() => router.push(`/admin/domaines/${domaine.id}/edit`)}
      />
    </div>
  );
}