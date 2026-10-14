'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { useSession } from '@/hooks/useSessions';
import { SessionFormModal } from '../../components/SessionFormModal';
import { SessionHeader } from './SessionHeader';
import { SessionInfoCard } from './SessionInfoCard';
import { SessionPlanningCard } from './SessionPlanningCard';
import { SessionInscriptionsCard } from './SessionInscriptionsCard';
import { SessionPresencesCard } from './SessionPresencesCard';

/* ============================================================================
   TYPES
   ============================================================================ */

interface SessionDetailClientProps {
  sessionId: string;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function SessionDetailClient({ sessionId }: SessionDetailClientProps) {
  const router = useRouter();
  const { data: session, isLoading, isError } = useSession(sessionId);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  /* -------------------- Chargement -------------------- */
  if (isLoading) return <SessionDetailSkeleton />;

  /* -------------------- Erreur -------------------- */
  if (isError || !session) {
    return (
      <Card className="mt-6">
        <EmptyState
          icon={Calendar}
          title="Session introuvable"
          description="Cette session n'existe pas ou a été supprimée."
          action={
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => router.push('/admin/sessions')}
            >
              Retour aux sessions
            </Button>
          }
        />
      </Card>
    );
  }

  /* -------------------- Rendu -------------------- */
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Bouton retour */}
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<ArrowLeft className="h-4 w-4" />}
        onClick={() => router.push('/admin/sessions')}
      >
        Retour aux sessions
      </Button>

      {/* En-tête */}
      <SessionHeader
        session={session}
        onEdit={() => setIsEditOpen(true)}
      />

      {/* Grille principale */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne gauche (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <SessionInfoCard session={session} />
          <SessionPlanningCard session={session} />
          <SessionInscriptionsCard sessionId={session.id} />
        </div>

        {/* Colonne droite (1/3) */}
        <div className="space-y-6">
          <SessionPresencesCard session={session} />
        </div>
      </div>

      {/* Modale d'édition */}
      <SessionFormModal
        mode="edit"
        id={session.id}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  );
}

/* ============================================================================
   SQUELETTE
   ============================================================================ */

function SessionDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-32 rounded bg-odc-surface-alt" />
      <div className="h-28 rounded-lg bg-odc-surface-alt" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 rounded-lg bg-odc-surface-alt" />
          <div className="h-48 rounded-lg bg-odc-surface-alt" />
        </div>
        <div className="space-y-6">
          <div className="h-80 rounded-lg bg-odc-surface-alt" />
        </div>
      </div>
    </div>
  );
}