// src/app/(formateur)/formateur/sessions/[id]/components/AcceptedParticipants.tsx
'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Mail,
  Phone,
  CheckCircle2,
  Search,
  X,
  Download,
  Eye,
  MessageSquare,
  UserCheck,
  Calendar,
  Award,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { api } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Participant {
  id: string;
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
  telephone?: string | null;
  photoUrl?: string | null;
  statut?: string | null;
  inscriptionId?: string | null;
  dateInscription?: string | null;
  presence?: {
    present?: boolean;
    statut?: string;
  } | null;
}

interface Props {
  sessionId: string;
  participants: Participant[];
  isLoading?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function exportAcceptedCSV(
  participants: Participant[],
  sessionCode: string,
) {
  if (!participants.length) {
    toast.error('Aucun participant à exporter');
    return;
  }

  const headers = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Inscrit le'];
  const rows = participants.map((p) => [
    p.prenom ?? '',
    p.nom ?? '',
    p.email ?? '',
    p.telephone ?? '',
    p.dateInscription ? formatDate(p.dateInscription) : '',
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
    )
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `participants-acceptes-${sessionCode || 'session'}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('Export CSV téléchargé');
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function AcceptedParticipants({
  sessionId,
  participants,
  isLoading = false,
}: Props) {
  const [search, setSearch] = useState('');

  /* ─── Filtrage ─── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return participants;

    return participants.filter(
      (p) =>
        `${p.prenom ?? ''} ${p.nom ?? ''}`.toLowerCase().includes(q) ||
        (p.email ?? '').toLowerCase().includes(q),
    );
  }, [participants, search]);

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  /* ─── Vide global ─── */
  if (participants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2
              className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            Participants acceptés
            <Badge variant="outline" className="ml-1">
              0
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={UserCheck}
            title="Aucun participant accepté"
            description="Les inscriptions validées apparaîtront ici."
          />
        </CardContent>
      </Card>
    );
  }

  /* ─── Rendu principal ─── */
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <CardTitle className="text-base">Participants acceptés</CardTitle>
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
            >
              {participants.length}
            </Badge>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportAcceptedCSV(participants, sessionId.slice(0, 8))
            }
            disabled={participants.length === 0}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Exporter CSV
          </Button>
        </div>

        {/* Recherche (si > 5 participants) */}
        {participants.length > 5 && (
          <div className="relative mt-3">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Rechercher un participant…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-8 text-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Effacer la recherche"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Compteur filtré */}
        {search && (
          <p className="mt-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {filtered.length}
            </span>{' '}
            résultat{filtered.length > 1 ? 's' : ''} sur{' '}
            {participants.length}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Search}
              title="Aucun résultat"
              description={`Aucun participant ne correspond à "${search}"`}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearch('')}
                >
                  Réinitialiser la recherche
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((p, index) => (
              <AcceptedParticipantRow
                key={p.id}
                participant={p}
                index={index}
                total={filtered.length}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROW
   ═══════════════════════════════════════════════════════════════════════════ */

function AcceptedParticipantRow({
  participant: p,
  index,
  total,
}: {
  participant: Participant;
  index: number;
  total: number;
}) {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(p.nom ?? '', p.prenom ?? '');
  const isPresent = p.presence?.present === true;

  return (
    <li
      className={cn(
        'group flex items-center gap-3 p-4 transition-colors hover:bg-accent/30',
        index === 0 && 'rounded-t-none',
        index === total - 1 && 'rounded-b-none',
      )}
    >
      {/* Avatar + statut présence */}
      <div className="relative shrink-0">
        <Avatar className="h-11 w-11 ring-2 ring-background">
          {p.photoUrl && !imageError ? (
            <AvatarImage
              src={p.photoUrl}
              alt=""
              onError={() => setImageError(true)}
            />
          ) : null}
          <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Badge présence (point vert) */}
        {isPresent && (
          <span
            className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-background bg-emerald-500"
            title="Présent"
            aria-label="Présent"
          >
            <CheckCircle2 className="h-2 w-2 text-white" aria-hidden="true" />
          </span>
        )}
      </div>

      {/* Infos */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-foreground">
            {p.prenom || '(sans prénom)'} {p.nom || '(sans nom)'}
          </p>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="h-4 border-emerald-200 bg-emerald-50 px-1 text-[9px] text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                >
                  <CheckCircle2 className="h-2 w-2" aria-hidden="true" />
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Inscription validée</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {p.email && (
            <span className="inline-flex items-center gap-1 truncate">
              <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{p.email}</span>
            </span>
          )}
          {p.telephone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
              {p.telephone}
            </span>
          )}
          {p.dateInscription && (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
              {formatDate(p.dateInscription)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        <TooltipProvider delayDuration={300}>
          {/* Envoyer email */}
          {p.email && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  asChild
                >
                  <a
                    href={`mailto:${p.email}`}
                    aria-label={`Envoyer un email à ${p.prenom ?? ''} ${p.nom ?? ''}`}
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Envoyer un email</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Téléphone */}
          {p.telephone && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  asChild
                >
                  <a
                    href={`tel:${p.telephone}`}
                    aria-label={`Appeler ${p.prenom ?? ''} ${p.nom ?? ''}`}
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Appeler</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Voir le profil */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                asChild
              >
                <a
                  href={`/formateur/participants/${p.id}`}
                  aria-label={`Voir le profil de ${p.prenom ?? ''} ${p.nom ?? ''}`}
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Voir le profil</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Statut présence */}
        {isPresent ? (
          <Badge className="ml-1 border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" />
            Présent
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="ml-1 text-muted-foreground"
          >
            <AlertCircle className="mr-1 h-3 w-3" aria-hidden="true" />
            À pointer
          </Badge>
        )}
      </div>
    </li>
  );
}