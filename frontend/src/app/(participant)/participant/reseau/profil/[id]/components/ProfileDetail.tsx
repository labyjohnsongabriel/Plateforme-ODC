// src/app/(participant)/participant/reseau/profil/[id]/components/ProfileDetail.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  MessageSquare,
  UserPlus,
  UserCheck,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { ProfileHeader } from './ProfileHeader';
import { ProfileInfo } from './ProfileInfo';
import { ProfileStats } from './ProfileStats';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ProfileUser {
  id: string;
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  telephone?: string | null;
  ville?: string | null;
  pays?: string | null;
  entreprise?: string | null;
  poste?: string | null;
  bio?: string | null;
  siteWeb?: string | null;
  linkedinUrl?: string | null;
  role?: { nom?: string; libelle?: string } | null;
  competences?: string[] | null;
  isConnected?: boolean;
  hasPendingRequest?: boolean;
  stats?: {
    connections?: number;
    formations?: number;
    attestations?: number;
    sessions?: number;
  };
  createdAt?: string | null;
}

function extractProfile(data: unknown): ProfileUser | null {
  if (!data || typeof data !== 'object') return null;
  const r = data as Record<string, unknown>;
  const root = (r.data ?? r) as Record<string, unknown>;
  const u = (root.user ?? root.profile ?? root) as ProfileUser;
  return u?.id ? u : null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function ProfileDetail({ userId }: { userId: string }) {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: profile, isLoading, isError, refetch, isFetching } =
    useQuery<ProfileUser | null>({
      queryKey: ['participant', 'reseau', 'profil', userId],
      queryFn: async () => {
        const response = await api.get(
          `/participant/reseau/profil/${userId}`,
        );
        return extractProfile(response.data);
      },
      enabled: !!userId,
      staleTime: 60_000,
    });

  /* ─── Mutations ─── */
  const connectMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/participant/reseau/demandes/${userId}`, {
        message: 'Bonjour, je souhaite rejoindre votre réseau.',
      });
    },
    onSuccess: () => {
      toast.success('Demande de connexion envoyée');
      qc.invalidateQueries({
        queryKey: ['participant', 'reseau', 'profil', userId],
      });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const messageMutation = useMutation({
    mutationFn: async () => {
      // Redirige vers la page messages (ou crée une conversation)
      router.push(`/participant/messages?to=${userId}`);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  /* ─── Erreur ─── */
  if (isError || !profile) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Retour
        </Button>
        <Card>
          <CardContent className="p-6">
            <QueryErrorState
              onRetry={() => void refetch()}
              isRetrying={isFetching}
              description="Ce profil n'existe pas ou n'est pas accessible."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Retour */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Retour
      </Button>

      {/* Header hero */}
      <ProfileHeader
        profile={profile}
        onMessage={() => messageMutation.mutate()}
        onConnect={() => connectMutation.mutate()}
        isMessagePending={messageMutation.isPending}
        isConnectPending={connectMutation.isPending}
      />

      {/* Grille : main + sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Colonne principale */}
        <div className="space-y-6">
          <ProfileInfo profile={profile} />
        </div>

        {/* Sidebar : stats */}
        <aside className="space-y-4">
          <ProfileStats profile={profile} />
        </aside>
      </div>
    </div>
  );
}