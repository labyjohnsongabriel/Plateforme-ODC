// src/app/(public)/formations/[slug]/components/InscriptionCta.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Share2,
  Heart,
  Calendar,
  Users,
  Clock,
  MapPin,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSessionsByFormation } from '@/hooks/queries/useSessions';
import { formatDate } from '@/lib/formatters';
import type { Formation } from '@/types/formation.types';

/* ============================================================================
   CONFIGURATION
   ============================================================================ */

const STATUT_CONFIG = {
  OUVERTE: {
    label: 'Inscriptions ouvertes',
    className: 'bg-odc-success-soft text-odc-success-dark',
  },
  PLANIFIEE: {
    label: 'Bientôt disponible',
    className: 'bg-odc-info-soft text-odc-info-dark',
  },
  EN_COURS: {
    label: 'En cours',
    className: 'bg-odc-warning-soft text-odc-warning-dark',
  },
  TERMINEE: {
    label: 'Terminée',
    className: 'bg-odc-surface-alt text-odc-text-secondary',
  },
} as const;

/* ============================================================================
   TYPES
   ============================================================================ */

interface InscriptionCtaProps {
  formation: Formation;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function InscriptionCta({ formation }: InscriptionCtaProps) {
  const { data: sessions = [], isLoading } = useSessionsByFormation(
    formation.id,
  );
  const [copied, setCopied] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  /* -------------------- Sessions ouvertes -------------------- */
  const openSessions = React.useMemo(
    () =>
      sessions.filter(
        (s) =>
          s.statut === 'OUVERTE' || s.statut === 'PLANIFIEE',
      ),
    [sessions],
  );

  /* -------------------- Prix -------------------- */
  const isGratuit = formation.prix === 0 || !formation.prix;

  /* -------------------- Handlers -------------------- */
  const handleShare = async () => {
    const shareData = {
      title: formation.titre,
      text:
        formation.descriptionCourte ??
        formation.description?.slice(0, 100) ??
        '',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        toast.success('Lien copié dans le presse-papier');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* Annulé par l'utilisateur */
    }
  };

  const handleBookmark = () => {
    setIsSaved(!isSaved);
    toast.success(
      isSaved ? 'Retiré des favoris' : 'Ajouté aux favoris',
    );
  };

  /* -------------------- Rendu -------------------- */
  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      {/* ================================================================
          CARTE PRINCIPALE — INSCRIPTION
          ================================================================ */}
      <Card className="overflow-hidden border-odc-primary/20 shadow-odc-md">
        {/* Bandeau gradient */}
        <div className="bg-gradient-to-br from-odc-500 to-odc-700 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/80">
                Prix de la formation
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-white">
                {isGratuit
                  ? 'Gratuit'
                  : `${new Intl.NumberFormat('fr-FR').format(
                      formation.prix ?? 0,
                    )} Ar`}
              </p>
            </div>
            {isGratuit && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
        </div>

        <CardContent className="space-y-5 p-5">
          {/* ---------------- Statut ---------------- */}
          {isLoading ? (
            <Skeleton className="h-6 w-full" />
          ) : openSessions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-odc-border bg-odc-surface-alt/50 p-4 text-center">
              <AlertCircle className="mx-auto mb-2 h-5 w-5 text-odc-text-muted" />
              <p className="text-sm font-medium text-odc-text-primary">
                Aucune session ouverte
              </p>
              <p className="mt-1 text-xs text-odc-text-muted">
                Revenez bientôt ou contactez-nous pour être informé
              </p>
              <Button
                variant="outline"
                className="mt-3 w-full"
                asChild
              >
                <Link href="/contact">
                  Être notifié
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* ---------------- Sessions disponibles ---------------- */}
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
                  <Calendar className="h-3.5 w-3.5" />
                  Prochaines sessions
                </p>

                <div className="space-y-2">
                  {openSessions.slice(0, 3).map((s) => {
                    const config =
                      STATUT_CONFIG[s.statut] ??
                      STATUT_CONFIG.PLANIFIEE;
                    const placesRestantes = s.capacite - (s.inscriptionsCount ?? 0);
                    const isFull = placesRestantes <= 0;

                    return (
                      <div
                        key={s.id}
                        className={cn(
                          'rounded-lg border p-3 transition-colors',
                          isFull
                            ? 'border-odc-error/30 bg-odc-error-soft/30'
                            : 'border-odc-border hover:bg-odc-surface-hover',
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-xs font-semibold text-odc-text-primary">
                              {s.codeSession}
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-odc-text-primary">
                              {formatDate(s.dateDebut)}
                            </p>
                            {s.lieu && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-odc-text-muted">
                                <MapPin className="h-3 w-3" />
                                {s.lieu}
                              </p>
                            )}
                          </div>

                          <span
                            className={cn(
                              'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                              config.className,
                            )}
                          >
                            {config.label}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-4 text-xs text-odc-text-muted">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>
                              {placesRestantes > 0
                                ? `${placesRestantes} places restantes`
                                : 'Complet'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ---------------- CTA principal ---------------- */}
              <Button
                variant="odc"
                size="lg"
                className="w-full"
                asChild
              >
                <Link
                  href={`/inscription-en-ligne?formation=${formation.id}`}
                >
                  S&apos;inscrire maintenant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <p className="text-center text-xs text-odc-text-muted">
                Inscription gratuite et sans engagement
              </p>
            </>
          )}

          <Separator />

          {/* ---------------- Actions secondaires ---------------- */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex-1"
            >
              {copied ? (
                <>
                  <Check className="mr-1.5 h-4 w-4 text-odc-success" />
                  Copié
                </>
              ) : (
                <>
                  <Share2 className="mr-1.5 h-4 w-4" />
                  Partager
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={cn(
                'flex-1',
                isSaved && 'text-odc-primary',
              )}
            >
              <Heart
                className={cn('mr-1.5 h-4 w-4', isSaved && 'fill-current')}
              />
              {isSaved ? 'Sauvegardée' : 'Sauvegarder'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================
          CARTE INFORMATIONS
          ================================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4 text-odc-primary" />
            Informations clés
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          <InfoRow
            icon={Clock}
            label="Durée"
            value={`${formation.dureeHeures}h`}
          />
          {formation.nbParticipantsMax && (
            <InfoRow
              icon={Users}
              label="Places max"
              value={String(formation.nbParticipantsMax)}
            />
          )}
          {formation.niveau && (
            <InfoRow
              icon={Sparkles}
              label="Niveau"
              value={
                {
                  DEBUTANT: 'Débutant',
                  INTERMEDIAIRE: 'Intermédiaire',
                  AVANCE: 'Avancé',
                }[formation.niveau as string] ?? formation.niveau
              }
            />
          )}

          <Separator />

          {/* Avantages */}
          <ul className="space-y-2 text-xs text-odc-text-secondary">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-odc-success" />
              Attestation de formation
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-odc-success" />
              Accès aux ressources pédagogiques
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-odc-success" />
              Suivi personnalisé par un formateur
            </li>
            {formation.certifiante && (
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-odc-warning" />
                <span className="font-medium text-odc-warning-dark">
                  Formation certifiante
                </span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================================
   SOUS-COMPOSANTS
   ============================================================================ */

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-odc-text-muted">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="font-medium text-odc-text-primary">{value}</span>
    </div>
  );
}