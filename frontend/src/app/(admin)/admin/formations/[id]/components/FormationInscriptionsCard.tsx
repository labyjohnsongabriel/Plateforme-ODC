// src/app/(admin)/admin/formations/[id]/components/FormationInscriptionsCard.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  UserX,
  ArrowRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { getInitials } from '@/lib/utils';

/* ============================================================================
   CONFIGURATION DES STATUTS
   ============================================================================ */

const STATUT_CONFIG = {
  EN_ATTENTE: {
    label: 'En attente',
    icon: Clock,
    className:
      'bg-odc-warning-soft text-odc-warning-dark ring-odc-warning/30',
    iconColor: 'text-odc-warning',
  },
  ACCEPTEE: {
    label: 'Acceptée',
    icon: CheckCircle2,
    className:
      'bg-odc-success-soft text-odc-success-dark ring-odc-success/30',
    iconColor: 'text-odc-success',
  },
  VALIDEE: {
    label: 'Validée',
    icon: CheckCircle2,
    className:
      'bg-odc-success-soft text-odc-success-dark ring-odc-success/30',
    iconColor: 'text-odc-success',
  },
  REFUSEE: {
    label: 'Refusée',
    icon: XCircle,
    className: 'bg-odc-error-soft text-odc-error-dark ring-odc-error/30',
    iconColor: 'text-odc-error',
  },
  REJETEE: {
    label: 'Rejetée',
    icon: XCircle,
    className: 'bg-odc-error-soft text-odc-error-dark ring-odc-error/30',
    iconColor: 'text-odc-error',
  },
  LISTE_ATTENTE: {
    label: "Liste d'attente",
    icon: Clock,
    className: 'bg-odc-info-soft text-odc-info-dark ring-odc-info/30',
    iconColor: 'text-odc-info',
  },
  ANNULEE: {
    label: 'Annulée',
    icon: UserX,
    className: 'bg-odc-surface-alt text-odc-text-muted ring-odc-border',
    iconColor: 'text-odc-text-muted',
  },
} as const;

/* ============================================================================
   TYPES
   ============================================================================ */

interface Inscription {
  id: string;
  statut?: string;
  createdAt?: string;
  participant?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    photoUrl?: string;
  };
}

interface FormationInscriptionsCardProps {
  formationId: string;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function FormationInscriptionsCard({
  formationId,
}: FormationInscriptionsCardProps) {
  const {
    data: inscriptions = [],
    isLoading,
    isError,
  } = useQuery<Inscription[]>({
    queryKey: ['admin', 'formations', formationId, 'inscriptions'],
    queryFn: async () => {
      try {
        const { data } = await api.get(
          `/admin/formations/${formationId}/inscriptions`,
        );
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    enabled: !!formationId,
    retry: 0,
    staleTime: 30_000,
  });

  /* -------------------- Compteurs par statut -------------------- */
  const stats = React.useMemo(() => {
    const compteur = {
      total: inscriptions.length,
      validees: 0,
      enAttente: 0,
      refusees: 0,
    };

    inscriptions.forEach((i) => {
      if (i.statut === 'VALIDEE' || i.statut === 'ACCEPTEE') {
        compteur.validees++;
      } else if (i.statut === 'EN_ATTENTE' || i.statut === 'LISTE_ATTENTE') {
        compteur.enAttente++;
      } else if (i.statut === 'REFUSEE' || i.statut === 'REJETEE') {
        compteur.refusees++;
      }
    });

    return compteur;
  }, [inscriptions]);

  /* -------------------- Rendu -------------------- */
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-odc-primary" />
            Inscriptions
          </CardTitle>

          <Badge
            variant="outline"
            className="tabular-nums text-xs"
            aria-label={`${stats.total} inscription(s)`}
          >
            {stats.total}
          </Badge>
        </div>

        {/* Récapitulatif par statut */}
        {!isLoading && !isError && stats.total > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {stats.validees > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-odc-success-soft px-2 py-0.5 text-[10px] font-semibold text-odc-success-dark">
                <CheckCircle2 className="h-3 w-3" />
                {stats.validees} validée{stats.validees > 1 ? 's' : ''}
              </span>
            )}
            {stats.enAttente > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-odc-warning-soft px-2 py-0.5 text-[10px] font-semibold text-odc-warning-dark">
                <Clock className="h-3 w-3" />
                {stats.enAttente} en attente
              </span>
            )}
            {stats.refusees > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-odc-error-soft px-2 py-0.5 text-[10px] font-semibold text-odc-error-dark">
                <XCircle className="h-3 w-3" />
                {stats.refusees} refusée{stats.refusees > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* ================================================================
            CHARGEMENT
            ================================================================ */}
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        )}

        {/* ================================================================
            ERREUR
            ================================================================ */}
        {!isLoading && isError && (
          <div className="flex items-start gap-3 rounded-lg border border-odc-error/30 bg-odc-error-soft/30 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-odc-error" />
            <p className="text-xs text-odc-error-dark">
              Impossible de charger les inscriptions.
            </p>
          </div>
        )}

        {/* ================================================================
            VIDE
            ================================================================ */}
        {!isLoading && !isError && inscriptions.length === 0 && (
          <div className="rounded-lg border border-dashed border-odc-border p-6 text-center">
            <UserX className="mx-auto mb-2 h-8 w-8 text-odc-text-muted" />
            <p className="text-sm font-medium text-odc-text-primary">
              Aucune inscription
            </p>
            <p className="mt-1 text-xs text-odc-text-muted">
              Aucun participant ne s&apos;est encore inscrit.
            </p>
          </div>
        )}

        {/* ================================================================
            LISTE
            ================================================================ */}
        {!isLoading && !isError && inscriptions.length > 0 && (
          <ul className="space-y-2">
            {inscriptions.slice(0, 5).map((i) => (
              <InscriptionItem key={i.id} inscription={i} />
            ))}

            {inscriptions.length > 5 && (
              <li className="pt-1 text-center">
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs"
                  asChild
                >
                  <Link
                    href={`/admin/inscriptions?formationId=${formationId}`}
                  >
                    Voir les {inscriptions.length} inscriptions
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================================================
   SOUS-COMPOSANT — InscriptionItem
   ============================================================================ */

function InscriptionItem({ inscription }: { inscription: Inscription }) {
  const config =
    STATUT_CONFIG[inscription.statut as keyof typeof STATUT_CONFIG] ??
    STATUT_CONFIG.EN_ATTENTE;

  const Icon = config.icon;
  const participant = inscription.participant;

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-odc-border p-3 transition-colors hover:bg-odc-surface-hover">
      {/* Avatar + Nom */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={participant?.photoUrl} />
          <AvatarFallback className="bg-odc-primary-soft text-xs font-medium text-odc-primary">
            {participant
              ? getInitials(participant.nom, participant.prenom)
              : '?'}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-odc-text-primary">
            {participant?.prenom} {participant?.nom}
          </p>
          <p className="truncate text-xs text-odc-text-muted">
            {participant?.email}
          </p>
        </div>
      </div>

      {/* Statut */}
      <span
        className={cn(
          'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
          config.className,
        )}
      >
        <Icon className={cn('h-3 w-3', config.iconColor)} aria-hidden="true" />
        {config.label}
      </span>
    </li>
  );
}