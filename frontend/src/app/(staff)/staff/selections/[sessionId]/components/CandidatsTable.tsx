// src/app/(staff)/staff/selections/[sessionId]/components/CandidatsTable.tsx
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Users,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  ListChecks,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import { getMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Candidat {
  id: string;
  statut: string;
  dateInscription?: string;
  motivation?: string | null;
  participant?: {
    id?: string;
    prenom?: string;
    nom?: string;
    email?: string;
    telephone?: string | null;
    photoUrl?: string | null;
  } | null;
}

interface Props {
  candidats: Candidat[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATUTS
   ═══════════════════════════════════════════════════════════════════════════ */

const STATUT_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  EN_ATTENTE: {
    label: 'En attente',
    icon: Clock,
    className:
      'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  },
  ACCEPTEE: {
    label: 'Accepté',
    icon: CheckCircle2,
    className:
      'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  REFUSEE: {
    label: 'Refusé',
    icon: XCircle,
    className:
      'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30',
  },
  LISTE_ATTENTE: {
    label: "Liste d'attente",
    icon: ListChecks,
    className:
      'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   AVATAR CANDIDAT (image + fallback initiales) — ROBUSTE
   ═══════════════════════════════════════════════════════════════════════════ */

function CandidateAvatar({
  prenom,
  nom,
  photoUrl,
}: {
  prenom?: string;
  nom?: string;
  photoUrl?: string | null;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const initials =
    `${prenom?.[0] ?? '?'}${nom?.[0] ?? ''}`.toUpperCase() || '?';

  /* Résolution robuste de l'URL */
  const raw = photoUrl?.trim();
  const src =
    !imageError && raw
      ? /^https?:\/\//i.test(raw)
        ? raw                    // URL absolue → directe
        : getMediaUrl(raw)       // URL relative → via getMediaUrl
      : null;

  return (
    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[11px] font-semibold text-white ring-2 ring-white dark:ring-slate-900">
      {/* Fallback initiales — visible tant que l'image n'est pas chargée */}
      {(!src || !imageLoaded) && <span aria-hidden>{initials}</span>}

      {src && (
        <img
          src={src}
          alt={`${prenom ?? ''} ${nom ?? ''}`.trim() || 'Avatar'}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-200',
            imageLoaded ? 'opacity-100' : 'opacity-0',
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
          loading="lazy"
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */

export function CandidatsTable({ candidats, selected, onSelectionChange }: Props) {
  const safeCandidats = (candidats ?? []).filter(
    (c): c is Candidat =>
      c != null && typeof c.id === 'string' && c.id.length > 0,
  );

  if (safeCandidats.length === 0) {
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
    if (selected.length === safeCandidats.length) onSelectionChange([]);
    else onSelectionChange(safeCandidats.map((c) => c.id));
  };

  const allSelected = selected.length === safeCandidats.length;
  const someSelected = selected.length > 0 && !allSelected;

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-slate-200 hover:bg-transparent dark:border-slate-800">
          <TableHead className="w-12">
            <Checkbox
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              onCheckedChange={toggleAll}
              aria-label="Tout sélectionner"
            />
          </TableHead>
          <TableHead className="text-slate-700 dark:text-slate-300">Candidat</TableHead>
          <TableHead className="hidden text-slate-700 dark:text-slate-300 md:table-cell">
            Contact
          </TableHead>
          <TableHead className="hidden text-slate-700 dark:text-slate-300 lg:table-cell">
            Inscrit le
          </TableHead>
          <TableHead className="hidden text-slate-700 dark:text-slate-300 xl:table-cell">
            Motivation
          </TableHead>
          <TableHead className="text-right text-slate-700 dark:text-slate-300">
            Statut
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {safeCandidats.map((c) => {
          const isSelected = selected.includes(c.id);
          const statutConfig = STATUT_CONFIG[c.statut] ?? STATUT_CONFIG.EN_ATTENTE;
          const StatutIcon = statutConfig.icon;

          return (
            <TableRow
              key={c.id}
              className={cn(
                'cursor-pointer border-slate-200 transition-colors dark:border-slate-800',
                isSelected
                  ? 'bg-slate-100 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-900',
              )}
              onClick={() => toggleOne(c.id)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleOne(c.id)}
                  aria-label={`Sélectionner ${c.participant?.prenom ?? ''} ${c.participant?.nom ?? ''}`}
                />
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-3">
                  <CandidateAvatar
                    prenom={c.participant?.prenom}
                    nom={c.participant?.nom}
                    photoUrl={c.participant?.photoUrl}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {c.participant?.prenom ?? ''} {c.participant?.nom ?? ''}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400 md:hidden">
                      {c.participant?.email ?? '—'}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="hidden md:table-cell">
                <div className="space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {c.participant?.email && (
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail className="h-3 w-3 shrink-0" aria-hidden />
                      {c.participant.email}
                    </p>
                  )}
                  {c.participant?.telephone && (
                    <p className="flex items-center gap-1.5 truncate">
                      <Phone className="h-3 w-3 shrink-0" aria-hidden />
                      {c.participant.telephone}
                    </p>
                  )}
                </div>
              </TableCell>

              <TableCell className="hidden text-xs text-slate-500 dark:text-slate-400 lg:table-cell">
                {c.dateInscription ? (
                  <span className="flex items-center gap-1.5 tabular-nums">
                    <Calendar className="h-3 w-3" aria-hidden />
                    {formatDate(c.dateInscription)}
                  </span>
                ) : (
                  '—'
                )}
              </TableCell>

              <TableCell className="hidden xl:table-cell">
                <div className="flex max-w-xs items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {c.motivation ? (
                    <>
                      <MessageSquare className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                      <p className="line-clamp-2">{c.motivation}</p>
                    </>
                  ) : (
                    '—'
                  )}
                </div>
              </TableCell>

              <TableCell className="text-right">
                <Badge
                  className={cn(
                    'inline-flex items-center gap-1 text-[11px] font-semibold',
                    statutConfig.className,
                  )}
                >
                  <StatutIcon className="h-2.5 w-2.5" aria-hidden />
                  {statutConfig.label}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}