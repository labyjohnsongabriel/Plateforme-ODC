// src/app/(public)/sessions/[codeSession]/components/SessionDetail.tsx
'use client';

import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  ChevronRight,
  Video,
  Clock,
  Sparkles,
  CheckCircle2,
  Info,
  Award,
  User as UserIcon,
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
import { cn } from '@/lib/utils';
import { formatDate, formatDuration } from '@/lib/formatters';
import type { Session } from '@/types/session.types';

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
   TYPES
   ============================================================================ */

interface Props {
  session: Session;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function SessionDetail({ session }: Props) {
  const config =
    STATUT_CONFIG[session.statut as keyof typeof STATUT_CONFIG] ??
    STATUT_CONFIG.PLANIFIEE;

  const placesRestantes = session.capacite - (session.inscriptionsCount ?? 0);
  const isFull = placesRestantes <= 0;
  const canRegister = session.statut === 'OUVERTE' && !isFull;

  const formation = session.formation as any;

  return (
    <>
      {/* ================================================================
          HERO
          ================================================================ */}
      <section className="border-b border-odc-border bg-gradient-to-br from-odc-surface to-odc-surface-alt">
        <div className="container-page py-8 md:py-12">
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-odc-text-muted">
              <li>
                <Link href="/" className="transition-colors hover:text-odc-primary">
                  Accueil
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" />
              <li>
                <Link
                  href="/sessions"
                  className="transition-colors hover:text-odc-primary"
                >
                  Sessions
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" />
              <li className="font-medium text-odc-text-primary">
                {session.codeSession}
              </li>
            </ol>
          </nav>

          {/* Contenu hero */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              {/* Badges */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-odc-surface-alt px-2.5 py-1 font-mono text-xs font-semibold text-odc-text-secondary">
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
                {formation?.certifiante && (
                  <Badge className="gap-1 bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-50">
                    <Sparkles className="h-3 w-3" />
                    Certifiante
                  </Badge>
                )}
              </div>

              {/* Titre */}
              <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-odc-text-primary md:text-4xl">
                {formation?.titre ?? 'Session de formation'}
              </h1>

              {formation?.domaineRelation && (
                <p className="mt-2 text-sm text-odc-text-muted">
                  Domaine :{' '}
                  <span className="font-medium text-odc-text-secondary">
                    {formation.domaineRelation.nom}
                  </span>
                </p>
              )}
            </div>

            {/* CTA Hero */}
            <div className="shrink-0">
              {canRegister ? (
                <Button variant="odc" size="lg" asChild>
                  <Link
                    href={`/inscription-en-ligne?session=${session.id}`}
                  >
                    S&apos;inscrire à cette session
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : isFull ? (
                <Badge
                  variant="outline"
                  className="border-odc-error/30 px-4 py-2 text-odc-error"
                >
                  Session complète
                </Badge>
              ) : (
                <Button variant="outline" size="lg" disabled>
                  Indisponible
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          CONTENU
          ================================================================ */}
      <section className="container-page py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* -------------------- COLONNE GAUCHE -------------------- */}
          <div className="space-y-6">
            {/* Informations de la session */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-odc-primary" />
                  Informations de la session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoCard
                    icon={Calendar}
                    label="Date de début"
                    value={formatDate(session.dateDebut)}
                  />
                  <InfoCard
                    icon={Calendar}
                    label="Date de fin"
                    value={formatDate(session.dateFin)}
                  />
                  <InfoCard
                    icon={Clock}
                    label="Durée"
                    value={formatDuration(
                      session.dateDebut,
                      session.dateFin,
                    )}
                  />
                  <InfoCard
                    icon={MapPin}
                    label="Lieu"
                    value={session.lieu || 'En ligne'}
                  />
                  <InfoCard
                    icon={Users}
                    label="Capacité"
                    value={`${session.capacite} place${session.capacite > 1 ? 's' : ''}`}
                  />
                  <InfoCard
                    icon={Users}
                    label="Inscrits"
                    value={`${session.inscriptionsCount ?? 0} participant${(session.inscriptionsCount ?? 0) > 1 ? 's' : ''}`}
                    tone={isFull ? 'error' : 'primary'}
                  />
                </div>

                {session.lienVisio && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3 rounded-lg border border-odc-info/30 bg-odc-info-soft/30 p-3">
                      <Video className="h-5 w-5 shrink-0 text-odc-info" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-odc-info-dark">
                          Visioconférence
                        </p>
                        <a
                          href={session.lienVisio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-sm font-medium text-odc-info hover:underline"
                        >
                          Rejoindre la session
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Formation associée */}
            {formation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-odc-primary" />
                    À propos de la formation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-odc-text-primary">
                      {formation.titre}
                    </h3>
                    {formation.descriptionCourte && (
                      <p className="mt-1 text-sm text-odc-text-secondary">
                        {formation.descriptionCourte}
                      </p>
                    )}
                  </div>

                  {formation.description && (
                    <p className="text-sm leading-relaxed text-odc-text-secondary">
                      {formation.description}
                    </p>
                  )}

                  {formation.objectifs &&
                    formation.objectifs.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
                            Objectifs
                          </p>
                          <ul className="space-y-1.5">
                            {formation.objectifs
                              .slice(0, 5)
                              .map((o: string, i: number) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-odc-text-secondary"
                                >
                                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-odc-success" />
                                  <span>{o}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </>
                    )}

                  {formation.slug && (
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/formations/${formation.slug}`}>
                        Voir la fiche complète
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* -------------------- COLONNE DROITE -------------------- */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* CTA principal */}
            <Card className="border-odc-primary/20 shadow-odc-md">
              <CardContent className="p-5">
                {canRegister ? (
                  <>
                    <div className="mb-4 rounded-lg bg-odc-success-soft/50 p-3">
                      <p className="text-xs font-medium text-odc-success-dark">
                        Inscriptions ouvertes
                      </p>
                      <p className="mt-1 text-sm font-semibold text-odc-text-primary">
                        {placesRestantes} place
                        {placesRestantes > 1 ? 's' : ''} disponible
                        {placesRestantes > 1 ? 's' : ''}
                      </p>
                    </div>
                    <Button variant="odc" size="lg" className="w-full" asChild>
                      <Link
                        href={`/inscription-en-ligne?session=${session.id}`}
                      >
                        S&apos;inscrire maintenant
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </>
                ) : isFull ? (
                  <div className="rounded-lg bg-odc-error-soft/50 p-4 text-center">
                    <p className="text-sm font-semibold text-odc-error-dark">
                      Session complète
                    </p>
                    <p className="mt-1 text-xs text-odc-text-muted">
                      Contactez-nous pour rejoindre la liste d&apos;attente
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                      asChild
                    >
                      <Link href="/contact">Nous contacter</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg bg-odc-surface-alt p-4 text-center">
                    <p className="text-sm text-odc-text-muted">
                      Inscriptions non ouvertes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Formateur */}
            {session.formateur && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <UserIcon className="h-4 w-4 text-odc-primary" />
                    Formateur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-odc-500 to-odc-700 text-sm font-bold text-white">
                      {session.formateur.prenom?.charAt(0)}
                      {session.formateur.nom?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-odc-text-primary">
                        {session.formateur.prenom} {session.formateur.nom}
                      </p>
                      <p className="truncate text-xs text-odc-text-muted">
                        {session.formateur.poste || 'Formateur ODC'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Récapitulatif */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <SummaryRow
                  label="Code"
                  value={session.codeSession}
                  mono
                />
                <SummaryRow
                  label="Dates"
                  value={`${formatDate(session.dateDebut)} → ${formatDate(session.dateFin)}`}
                />
                <SummaryRow
                  label="Lieu"
                  value={session.lieu || 'En ligne'}
                />
                <SummaryRow
                  label="Places"
                  value={`${session.capacite}`}
                />
                <SummaryRow
                  label="Disponibles"
                  value={
                    isFull ? 'Complet' : `${placesRestantes}`
                  }
                  tone={isFull ? 'error' : 'success'}
                />
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </>
  );
}

/* ============================================================================
   SOUS-COMPOSANTS
   ============================================================================ */

interface InfoCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: 'primary' | 'error';
}

function InfoCard({
  icon: Icon,
  label,
  value,
  tone = 'primary',
}: InfoCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-odc-border p-3">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
          tone === 'primary' ? 'bg-odc-primary-soft' : 'bg-odc-error-soft',
        )}
      >
        <Icon
          className={cn(
            'h-5 w-5',
            tone === 'primary' ? 'text-odc-primary' : 'text-odc-error',
          )}
        />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-odc-text-muted">{label}</p>
        <p className="truncate font-medium text-odc-text-primary">
          {value}
        </p>
      </div>
    </div>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  mono?: boolean;
  tone?: 'default' | 'success' | 'error';
}

function SummaryRow({
  label,
  value,
  mono,
  tone = 'default',
}: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-odc-text-muted">{label}</span>
      <span
        className={cn(
          'text-right font-medium',
          mono && 'font-mono text-xs',
          tone === 'success' && 'text-odc-success-dark',
          tone === 'error' && 'text-odc-error-dark',
          tone === 'default' && 'text-odc-text-primary',
        )}
      >
        {value}
      </span>
    </div>
  );
}