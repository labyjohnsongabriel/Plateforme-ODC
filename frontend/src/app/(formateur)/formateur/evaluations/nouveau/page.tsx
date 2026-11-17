'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EvaluationFormModal } from '../components/EvaluationFormModal';

export default function NewEvaluationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId') ?? undefined;
  const [open, setOpen] = useState(true);

  // Fermeture du modal → retour à la liste
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) router.push('/formateur/evaluations');
  };

  // Si l'utilisateur arrive directement ici, on ouvre le modal
  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/formateur/evaluations')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux évaluations
      </Button>

      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Nouvelle évaluation
        </h1>
        <p className="text-odc-muted mt-1">
          Le formulaire s'adapte au type d'évaluation choisi.
        </p>
      </div>

      <EvaluationFormModal
        open={open}
        onOpenChange={handleOpenChange}
        mode="create"
        defaultSessionId={sessionId}
      />
    </div>
  );
}