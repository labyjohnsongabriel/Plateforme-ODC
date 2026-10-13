'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { MoreVertical, Edit, ClipboardCheck, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';

const TYPE_LABELS: Record<string, string> = {
  PRE_TEST: 'Pré-test',
  POST_TEST: 'Post-test',
  QUIZ: 'Quiz',
  PROJET: 'Projet',
  EXAMEN: 'Examen',
  TP: 'Travaux pratiques',
  ORAL: 'Oral',
};

export function EvaluationsTable() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['staff', 'evaluations'],
    queryFn: async () => {
      const { data } = await api.get('/staff/evaluations');
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <Card className="p-4">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 mb-2" />)}
      </Card>
    );
  }

  const evaluations = data ?? [];

  if (!evaluations.length) {
    return <Card><EmptyState icon={ClipboardCheck} title="Aucune évaluation" /></Card>;
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Évaluation</TableHead>
            <TableHead className="hidden md:table-cell">Session</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="hidden lg:table-cell">Barème</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluations.map((e: any) => (
            <TableRow key={e.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-odc-primary-soft flex items-center justify-center shrink-0">
                    <ClipboardCheck className="h-5 w-5 text-odc-primary" />
                  </div>
                  <p className="font-medium text-sm truncate">{e.titre}</p>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm">
                {e.session?.formation?.titre}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{TYPE_LABELS[e.type] ?? e.type}</Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-sm">
                {e.noteMax} pts
              </TableCell>
              <TableCell>
                {e.publiee ? (
                  <Badge className="bg-odc-success-bg text-odc-success">Publiée</Badge>
                ) : (
                  <Badge variant="outline">Brouillon</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/staff/evaluations/${e.id}`)}>
                      <Edit className="h-4 w-4 mr-2" /> Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/staff/notes?evaluationId=${e.id}`)}>
                      <FileText className="h-4 w-4 mr-2" /> Saisir les notes
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}