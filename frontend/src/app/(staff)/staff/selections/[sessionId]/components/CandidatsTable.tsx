'use client';

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Users } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  ACCEPTEE: 'Acceptée',
  REFUSEE: 'Refusée',
  LISTE_ATTENTE: "Liste d'attente",
};

const STATUT_COLORS: Record<string, string> = {
  EN_ATTENTE: 'bg-odc-warning-bg text-odc-warning',
  ACCEPTEE: 'bg-odc-success-bg text-odc-success',
  REFUSEE: 'bg-odc-error-bg text-odc-error',
  LISTE_ATTENTE: 'bg-odc-info-bg text-odc-info',
};

interface Props {
  candidats: any[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
}

export function CandidatsTable({ candidats, selected, onSelectionChange }: Props) {
  if (!candidats.length) {
    return (
      <EmptyState
        icon={Users}
        title="Aucun candidat"
        description="Aucune inscription ne correspond à ce filtre."
      />
    );
  }

  const toggleOne = (id: string) => {
    onSelectionChange(
      selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id],
    );
  };

  const toggleAll = () => {
    if (selected.length === candidats.length) onSelectionChange([]);
    else onSelectionChange(candidats.map((c) => c.id));
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={selected.length === candidats.length && candidats.length > 0}
              onCheckedChange={toggleAll}
            />
          </TableHead>
          <TableHead>Candidat</TableHead>
          <TableHead className="hidden md:table-cell">Inscrit le</TableHead>
          <TableHead className="hidden lg:table-cell">Motivation</TableHead>
          <TableHead>Statut</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidats.map((c: any) => (
          <TableRow key={c.id}>
            <TableCell>
              <Checkbox
                checked={selected.includes(c.id)}
                onCheckedChange={() => toggleOne(c.id)}
              />
            </TableCell>
            <TableCell>
              <p className="font-medium text-sm">
                {c.participant?.prenom} {c.participant?.nom}
              </p>
              <p className="text-xs text-odc-muted">{c.participant?.email}</p>
            </TableCell>
            <TableCell className="hidden md:table-cell text-sm text-odc-muted">
              {formatDate(c.dateInscription)}
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              <p className="text-xs text-odc-muted max-w-xs truncate">
                {c.motivation ?? '—'}
              </p>
            </TableCell>
            <TableCell>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_COLORS[c.statut]}`}>
                {STATUT_LABELS[c.statut]}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}