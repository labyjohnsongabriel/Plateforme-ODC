'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { useFormation } from '@/hooks/useFormations';
import { FormationFormModal } from '../../components/FormationFormModal';
import { FormationHeader } from './FormationHeader';
import { FormationInfoCard } from './FormationInfoCard';
import { FormationProgramCard } from './FormationProgramCard';
import { FormationSessionsCard } from './FormationSessionsCard';
import { FormationInscriptionsCard } from './FormationInscriptionsCard';

/* ============================================================================
   TYPES
   ============================================================================ */

interface FormationDetailClientProps {
  formationId: string;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function FormationDetailClient({
  formationId,
}: FormationDetailClientProps) {
  const router = useRouter();
  const { data: formation, isLoading, isError } = useFormation(formationId);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  /* -------------------- Chargement -------------------- */
  if (isLoading) {
    return <FormationDetailSkeleton />;
  }

  /* -------------------- Erreur -------------------- */
  if (isError || !formation) {
    return (
      <Card className="mt-6">
        <EmptyState
          icon={BookOpen}
          title="Formation introuvable"
          description="Cette formation n'existe pas ou a été supprimée."
          action={
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => router.push('/admin/formations')}
            >
              Retour à la liste
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
        onClick={() => router.push('/admin/formations')}
      >
        Retour aux formations
      </Button>

      {/* En-tête */}
      <FormationHeader
        formation={formation}
        onEdit={() => setIsEditOpen(true)}
      />

      {/* Grille d'informations */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <FormationInfoCard formation={formation} />
          <FormationProgramCard formation={formation} />
        </div>

        <div className="space-y-6">
          <FormationSessionsCard formationId={formation.id} />
          <FormationInscriptionsCard formationId={formation.id} />
        </div>
      </div>

      {/* Modale d'édition */}
      <FormationFormModal
        mode="edit"
        id={formation.id}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  );
}

/* ============================================================================
   SQUELETTE
   ============================================================================ */

function FormationDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-32 rounded bg-odc-surface-alt" />
      <div className="h-24 rounded-lg bg-odc-surface-alt" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 rounded-lg bg-odc-surface-alt" />
          <div className="h-96 rounded-lg bg-odc-surface-alt" />
        </div>
        <div className="space-y-6">
          <div className="h-48 rounded-lg bg-odc-surface-alt" />
          <div className="h-48 rounded-lg bg-odc-surface-alt" />
        </div>
      </div>
    </div>
  );
}