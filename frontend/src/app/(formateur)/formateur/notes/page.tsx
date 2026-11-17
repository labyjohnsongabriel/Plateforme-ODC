'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { NotesSaisieModal } from '../evaluations/components/NotesSaisieModal';
import { EmptyState } from '@/components/shared/EmptyState';

export default function NotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const evaluationId = searchParams.get('evaluationId') ?? '';

  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ['formateur', 'evaluations'],
    queryFn: async () => {
      const { data } = await api.get('/formateur/evaluations');
      return (data.data ?? []) as any[];
    },
  });

  // ✅ Navigation propre via le router Next (remplace history.replaceState)
  const handleSelect = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('evaluationId', id);
      router.replace(`/formateur/notes?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // ✅ Fermeture du modal : on nettoie le paramètre d'URL
  const handleClose = useCallback(
    (open: boolean) => {
      if (!open) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('evaluationId');
        router.replace(
          `/formateur/notes${params.toString() ? `?${params}` : ''}`,
          { scroll: false },
        );
      }
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Saisie des notes
        </h1>
        <p className="text-odc-muted mt-1">
          Sélectionnez une évaluation pour saisir les notes des participants
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-odc-primary" />
            Évaluation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="evaluation">Choisir une évaluation</Label>
          <Select
            value={evaluationId}
            onValueChange={handleSelect}
            disabled={isLoading || !evaluations.length}
          >
            <SelectTrigger id="evaluation" className="mt-1.5 max-w-md">
              <SelectValue
                placeholder={
                  isLoading
                    ? 'Chargement…'
                    : evaluations.length
                      ? 'Sélectionnez une évaluation'
                      : 'Aucune évaluation disponible'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {evaluations.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.titre} — {e.session?.formation?.titre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* ✅ Affichage : modal si évaluation sélectionnée, sinon EmptyState */}
      {!evaluationId ? (
        <EmptyState
          icon={FileText}
          title="Aucune évaluation sélectionnée"
          description="Choisissez une évaluation ci-dessus pour ouvrir la saisie des notes."
        />
      ) : (
        <NotesSaisieModal
          open
          onOpenChange={handleClose}
          evaluationId={evaluationId}
        />
      )}
    </div>
  );
}