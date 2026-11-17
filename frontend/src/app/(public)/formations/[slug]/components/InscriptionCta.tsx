// src/components/formations/InscriptionCta.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight, Share2, Heart, Calendar, Users, Clock, MapPin,
  Sparkles, Info, CheckCircle2, AlertCircle, Check, Video,
  Shield, Award, Download,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSessionsByFormation } from '@/hooks/queries/useSessions';
import { formatDate } from '@/lib/formatters';
import { useInscriptionModal } from '@/components/inscription/InscriptionModalProvider';
import type { Formation } from '@/types/formation.types';

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG STATUTS
   ═══════════════════════════════════════════════════════════════════════════ */

const STATUT_CONFIG = {
  OUVERTE: {
    label: 'Ouverte',
    className: 'bg-odc-success-soft text-odc-success-dark',
  },
  PLANIFIEE: {
    label: 'Bientôt',
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

/* ═══════════════════════════════════════════════════════════════════════════
   PROPS
   ═══════════════════════════════════════════════════════════════════════════ */

interface InscriptionCtaProps {
  formation: Formation;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function InscriptionCta({ formation }: InscriptionCtaProps) {
  const { data: sessions = [], isLoading } = useSessionsByFormation(formation.id);
  const [copied, setCopied] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  // ⭐ Hook pour ouvrir le modal d'inscription
  const { open: openInscriptionModal } = useInscriptionModal();

  /* ═══════ Sessions ouvertes ═══════ */
  const openSessions = React.useMemo(
    () =>
      sessions.filter(
        (s) => s.statut === 'OUVERTE' || s.statut === 'PLANIFIEE',
      ),
    [sessions],
  );

  const isGratuit = formation.prix === 0 || !formation.prix;

  /* ═══════ Handlers ═══════ */
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const data = {
      title: formation.titre,
      text:
        formation.descriptionCourte ??
        formation.description?.slice(0, 100) ??
        '',
      url,
    };
    try {
      if (navigator.share && navigator.canShare?.(data)) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Lien copié');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* cancelled */
    }
  };

  const handleBookmark = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  /**
   * ⭐ Ouvre le modal d'inscription avec la première session disponible
   */
  const handleInscription = (sessionId?: string) => {
    openInscriptionModal({
      sessionId: sessionId ?? openSessions[0]?.id,
      formationId: formation.id,
    });
  };

  /* ═══════ Rendu ═══════ */
  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      {/* ── CARTE PRINCIPALE ─────────────────────────────────────────── */}
      <Card className="overflow-hidden border-orange-200/40 shadow-lg dark:border-orange-900/40">
        {/* Bandeau prix */}
        <div className="relative bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/80">
                {isGratuit ? 'Formation gratuite' : 'Tarif'}
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-white">
                {isGratuit
                  ? 'Gratuit'
                  : `${new Intl.NumberFormat('fr-MG').format(formation.prix ?? 0)} Ar`}
              </p>
              {!isGratuit && formation.prixReduit && (
                <p className="mt-1 text-xs text-white/80 line-through">
                  {new Intl.NumberFormat('fr-MG').format(formation.prixReduit)} Ar
                </p>
              )}
            </div>
            {isGratuit && (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-6 w-6 text-white" aria-hidden />
              </div>
            )}
          </div>
          {formation.certifiante && (
            <Badge className="mt-3 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
              <Award className="mr-1 h-3 w-3" aria-hidden /> Certificat inclus
            </Badge>
          )}
        </div>

        <CardContent className="space-y-5 p-5">
          {/* ── Statut / Sessions ──────────────────────────────────── */}
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : openSessions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center">
              <AlertCircle className="mx-auto mb-2 h-5 w-5 text-muted-foreground" aria-hidden />
              <p className="text-sm font-medium">Aucune session ouverte</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Soyez notifié dès l&apos;ouverture
              </p>
              <Button variant="outline" className="mt-3 w-full" asChild>
                <Link href="/contact">
                  Être notifié
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" aria-hidden />
                  Sessions disponibles ({openSessions.length})
                </p>

                <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
                  {openSessions.slice(0, 3).map((s) => {
                    const config =
                      STATUT_CONFIG[
                        s.statut as keyof typeof STATUT_CONFIG
                      ] ?? STATUT_CONFIG.PLANIFIEE;
                    const restantes =
                      s.capacite - (s.inscriptionsCount ?? 0);
                    const isFull = restantes <= 0;

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleInscription(s.id)}
                        disabled={isFull}
                        className={cn(
                          'w-full rounded-lg border p-3 text-left transition-all',
                          isFull
                            ? 'cursor-not-allowed border-destructive/30 bg-destructive/5 opacity-70'
                            : 'border-border hover:border-orange-300 hover:bg-orange-50/50 dark:hover:border-orange-900 dark:hover:bg-orange-950/30',
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-xs font-semibold">
                              {s.codeSession}
                            </p>
                            <p className="mt-0.5 text-sm font-medium">
                              {formatDate(s.dateDebut)}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              {s.lieu && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" aria-hidden />
                                  {s.lieu}
                                </span>
                              )}
                              {s.lienVisio && (
                                <span className="flex items-center gap-1">
                                  <Video className="h-3 w-3" aria-hidden />
                                  En ligne
                                </span>
                              )}
                            </div>
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
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" aria-hidden />
                          {restantes > 0
                            ? `${restantes} places`
                            : 'Complet'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ⭐ Bouton principal qui ouvre le modal */}
              <Button
                variant="odc"
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                onClick={() => handleInscription()}
              >
                S&apos;inscrire maintenant
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Button>

              <p className="flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
                <Shield className="h-3 w-3" aria-hidden />
                Inscription gratuite et sans engagement
              </p>
            </>
          )}

          <Separator />

          {/* ── Actions secondaires ────────────────────────────────── */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex-1"
            >
              {copied ? (
                <>
                  <Check className="mr-1.5 h-4 w-4 text-odc-success" aria-hidden />
                  Copié
                </>
              ) : (
                <>
                  <Share2 className="mr-1.5 h-4 w-4" aria-hidden />
                  Partager
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={cn('flex-1', isSaved && 'text-orange-600')}
            >
              <Heart
                className={cn('mr-1.5 h-4 w-4', isSaved && 'fill-current')}
                aria-hidden
              />
              {isSaved ? 'Sauvegardée' : 'Sauvegarder'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── CARTE INFORMATIONS CLÉS ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4 text-orange-500" aria-hidden />
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
                (
                  {
                    DEBUTANT: 'Débutant',
                    INTERMEDIAIRE: 'Intermédiaire',
                    AVANCE: 'Avancé',
                  } as Record<string, string>
                )[formation.niveau] ?? formation.niveau
              }
            />
          )}
          {formation.langue && (
            <InfoRow icon={BookIcon} label="Langue" value={formation.langue} />
          )}

          <Separator />

          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-odc-success" aria-hidden />
              Attestation de formation
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-odc-success" aria-hidden />
              Accès aux ressources pédagogiques
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-odc-success" aria-hidden />
              Suivi personnalisé
            </li>
            {formation.certifiante && (
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-odc-warning" aria-hidden />
                <span className="font-medium text-odc-warning-dark">
                  Formation certifiante
                </span>
              </li>
            )}
          </ul>

          {formation.brochureUrl && (
            <>
              <Separator />
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a
                  href={formation.brochureUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download className="mr-2 h-4 w-4" aria-hidden />
                  Télécharger la brochure
                </a>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

const BookIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {label}
      </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}