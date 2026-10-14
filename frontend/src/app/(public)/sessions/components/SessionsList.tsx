// src/app/(public)/sessions/components/SessionsList.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  CalendarX,
  Clock,
  Video,
  Filter,
  Search,
  X,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useSessionsPublic } from '@/hooks/queries/useSessions';
import { formatDate } from '@/lib/formatters';

/* ============================================================================
   CONFIGURATION
   ============================================================================ */

const STATUT_CONFIG = {
  PLANIFIEE: {
    label: 'Planifiée',
    className: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  OUVERTE: {
    label: 'Inscriptions ouvertes',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  EN_COURS: {
    label: 'En cours',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  TERMINEE: {
    label: 'Terminée',
    className: 'bg-odc-surface-alt text-odc-text-secondary ring-odc-border',
  },
  ANNULEE: {
    label: 'Annulée',
    className: 'bg-red-50 text-red-700 ring-red-200',
  },
} as const;

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function SessionsList() {
  const [search, setSearch] = React.useState('');
  const [statutFilter, setStatutFilter] = React.useState('all');
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useSessionsPublic({
    page: 1,
    limit: 20,
    search: debouncedSearch || undefined,
    statut: statutFilter !== 'all' ? statutFilter : undefined,
  });

  const sessions = data?.data ?? [];

  /* -------------------- Reset -------------------- */
  const clearFilters = () => {
    setSearch('');
    setStatutFilter('all');
  };

  const hasFilters = !!search || statutFilter !== 'all';

  /* -------------------- Rendu -------------------- */
  return (
    <div className="space-y-6">
      {/* ================================================================
          FILTRES
          ================================================================ */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Recherche */}
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-odc-text-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une session, une formation..."
                className="pl-9"
              />
            </div>

            {/* Statut */}
            <Select value={statutFilter} onValueChange={setStatutFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="OUVERTE">Inscriptions ouvertes</SelectItem>
                <SelectItem value="PLANIFIEE">Planifiées</SelectItem>
                <SelectItem value="EN_COURS">En cours</SelectItem>
                <SelectItem value="TERMINEE">Terminées</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset */}
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1.5 h-4 w-4" />
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ================================================================
          CHARGEMENT
          ================================================================ */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      )}

      {/* ================================================================
          VIDE
          ================================================================ */}
      {!isLoading && sessions.length === 0 && (
        <Card className="p-12">
          <EmptyState
            icon={CalendarX}
            title="Aucune session trouvée"
            description={
              hasFilters
                ? 'Essayez de modifier vos filtres.'
                : 'Les prochaines sessions seront publiées prochainement.'
            }
            action={
              hasFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Réinitialiser les filtres
                </Button>
              )
            }
          />
        </Card>
      )}

      {/* ================================================================
          LISTE
          ================================================================ */}
      {!isLoading && sessions.length > 0 && (
        <div className="space-y-4">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   CARTE SESSION
   ============================================================================ */

interface SessionCardProps {
  session: any;
}

function SessionCard({ session }: SessionCardProps) {
  const config =
    STATUT_CONFIG[session.statut as keyof typeof STATUT_CONFIG] ??
    STATUT_CONFIG.PLANIFIEE;

  const placesRestantes = session.capacite - (session.inscriptionsCount ?? 0);
  const isFull = placesRestantes <= 0;
  const canRegister = session.statut === 'OUVERTE' && !isFull;
  const fillPercent =
    session.capacite > 0
      ? Math.min(100, ((session.inscriptionsCount ?? 0) / session.capacite) * 100)
      : 0;

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-odc-base',
        'hover:shadow-odc-md',
        canRegister && 'border-odc-success/30 hover:border-odc-success',
      )}
    >
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          {/* -------------------- Infos -------------------- */}
          <div className="min-w-0 space-y-4">
            {/* Badges haut */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-odc-text-primary">
                {session.codeSession}
              </span>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
                  config.className,
                )}
              >
                {config.label}
              </span>
              {session.formation?.certifiante && (
                <Badge className="gap-1 bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-50">
                  <Sparkles className="h-3 w-3" />
                  Certifiante
                </Badge>
              )}
            </div>

            {/* Titre */}
            <div>
              <h3 className="font-display text-lg font-semibold leading-tight text-odc-text-primary transition-colors group-hover:text-odc-primary">
                {session.formation?.titre ?? 'Formation'}
              </h3>
              {session.formateur && (
                <p className="mt-1 text-xs text-odc-text-muted">
                  Formateur : {session.formateur.prenom}{' '}
                  {session.formateur.nom}
                </p>
              )}
            </div>

            {/* Métadonnées */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-odc-text-secondary">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 shrink-0 text-odc-primary" />
                <span className="whitespace-nowrap">
                  {formatDate(session.dateDebut)} →{' '}
                  {formatDate(session.dateFin)}
                </span>
              </div>

              {session.lieu && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0 text-odc-primary" />
                  <span className="truncate">{session.lieu}</span>
                </div>
              )}

              {session.lienVisio && (
                <div className="flex items-center gap-1.5">
                  <Video className="h-4 w-4 shrink-0 text-odc-info" />
                  <span>En ligne</span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 shrink-0 text-odc-primary" />
                <span
                  className={cn(
                    isFull && 'font-semibold text-odc-error',
                  )}
                >
                  {isFull
                    ? 'Complet'
                    : `${placesRestantes} place${placesRestantes > 1 ? 's' : ''} restante${placesRestantes > 1 ? 's' : ''}`}
                </span>
              </div>
            </div>

            {/* Barre de remplissage */}
            {session.capacite > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-odc-text-muted">
                  <span>
                    {session.inscriptionsCount ?? 0} / {session.capacite}{' '}
                    inscrit(s)
                  </span>
                  <span>{Math.round(fillPercent)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-odc-surface-alt">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      fillPercent >= 90
                        ? 'bg-odc-error'
                        : fillPercent >= 70
                          ? 'bg-odc-warning'
                          : 'bg-odc-success',
                    )}
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* -------------------- Actions -------------------- */}
          <div className="flex flex-col gap-2 md:shrink-0">
            {canRegister ? (
              <Button variant="odc" size="lg" asChild>
                <Link href={`/inscription-en-ligne?session=${session.id}`}>
                  S&apos;inscrire
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : isFull ? (
              <Badge
                variant="outline"
                className="justify-center border-odc-error/30 px-4 py-2 text-odc-error"
              >
                Session complète
              </Badge>
            ) : (
              <Button variant="outline" disabled>
                Indisponible
              </Button>
            )}

            <Button variant="outline" asChild>
              <Link href={`/sessions/${session.codeSession}`}>
                Voir les détails
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}