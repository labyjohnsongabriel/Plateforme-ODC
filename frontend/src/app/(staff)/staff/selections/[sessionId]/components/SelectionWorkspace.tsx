'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, Users, Zap, RotateCcw, Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { CandidatsTable } from './CandidatsTable';
import { SelectionActions } from './SelectionActions';
import { AutoSelectionDialog } from './AutoSelectionDialog';
import { SelectionStats } from './SelectionStats';

export function SelectionWorkspace({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [filterStatut, setFilterStatut] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['staff', 'selection', sessionId, filterStatut],
    queryFn: async () => {
      const { data } = await api.get(
        `/staff/selections/session/${sessionId}/candidats`,
        {
          params: {
            limit: 200,
            statut: filterStatut === 'all' ? undefined : filterStatut,
          },
        },
      );
      return data;
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/staff/selections/session/${sessionId}/reset`);
    },
    onSuccess: () => {
      toast.success('Sélections réinitialisées');
      qc.invalidateQueries({ queryKey: ['staff', 'selection', sessionId] });
    },
  });

  const candidats = data?.data ?? [];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
      </Button>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Sélection des candidats
          </h1>
          <p className="text-odc-muted mt-1">
            Session {data?.session?.codeSession}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (confirm('Réinitialiser toutes les sélections ?')) resetMutation.mutate();
            }}
            disabled={resetMutation.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
          <AutoSelectionDialog sessionId={sessionId} />
        </div>
      </header>

      <SelectionStats sessionId={sessionId} stats={data?.stats} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-4">
          <CardTitle className="text-base">
            {candidats.length} candidat(s)
            {selected.length > 0 && (
              <span className="ml-2 text-sm text-odc-primary">
                • {selected.length} sélectionné(s)
              </span>
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-odc-muted" />
            <Select value={filterStatut} onValueChange={setFilterStatut}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                <SelectItem value="ACCEPTEE">Acceptées</SelectItem>
                <SelectItem value="REFUSEE">Refusées</SelectItem>
                <SelectItem value="LISTE_ATTENTE">Liste d&apos;attente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {selected.length > 0 && (
          <SelectionActions
            sessionId={sessionId}
            selected={selected}
            onDone={() => setSelected([])}
          />
        )}

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : (
            <CandidatsTable
              candidats={candidats}
              selected={selected}
              onSelectionChange={setSelected}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}