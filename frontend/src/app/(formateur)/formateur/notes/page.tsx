'use client';

import { useSearchParams } from 'next/navigation';
import { NotesSaisieTable } from '../evaluations/components/NotesSaisieTable';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';

export default function NotesPage() {
  const searchParams = useSearchParams();
  const evaluationId = searchParams.get('evaluationId') ?? '';

  const { data: evaluations } = useQuery({
    queryKey: ['formateur', 'evaluations'],
    queryFn: async () => {
      const { data } = await api.get('/formateur/evaluations');
      return data.data;
    },
  });

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
            onValueChange={(v) => {
              const params = new URLSearchParams(window.location.search);
              params.set('evaluationId', v);
              window.history.replaceState(
                {},
                '',
                `/formateur/notes?${params.toString()}`,
              );
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          >
            <SelectTrigger id="evaluation" className="mt-1.5 max-w-md">
              <SelectValue placeholder="Sélectionnez une évaluation" />
            </SelectTrigger>
            <SelectContent>
              {evaluations?.map((e: any) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.titre} — {e.session?.formation?.titre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {evaluationId ? (
        <NotesSaisieTable evaluationId={evaluationId} />
      ) : (
        <Card>
          <CardContent className="py-16 text-center text-odc-muted">
            Sélectionnez une évaluation pour commencer la saisie.
          </CardContent>
        </Card>
      )}
    </div>
  );
}