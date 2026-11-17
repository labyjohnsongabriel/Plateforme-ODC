// src/app/(public)/formations/[slug]/components/FormationDetail.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Clock, BarChart3, Users, BookOpen, Target, CheckCircle2,
  ChevronRight, Award, GraduationCap, Sparkles, Calendar,
  Share2, Heart, Download, PlayCircle, Star, MapPin,
  Shield, TrendingUp, Eye, FileText, Video,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { SessionList } from './SessionList';
import { InscriptionCta } from './InscriptionCta';
//import { FormationTestimonials } from './FormationTestimonials';
import { FormationFaq } from './FormationFaq';
import { RelatedFormations } from './RelatedFormations';
import type { Formation } from '@/types/formation.types';
import { getMediaUrl } from '@/lib/media';

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════════════════ */

const NIVEAU_LABELS: Record<string, string> = {
  DEBUTANT: 'Débutant',
  INTERMEDIAIRE: 'Intermédiaire',
  AVANCE: 'Avancé',
};

const NIVEAU_COLORS: Record<string, string> = {
  DEBUTANT:
    'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900',
  INTERMEDIAIRE:
    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
  AVANCE:
    'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
};

/* ═══════════════════════════════════════════════════════════════════════════
   PROPS
   ═══════════════════════════════════════════════════════════════════════════ */

interface Props {
  formation: Formation;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function FormationDetail({ formation }: Props) {
  const imageSrc =
    getMediaUrl(
      formation.imageCouvertureUrl ||
        formation.imageUrl ||
        '/images/formations/placeholder.jpg',
    ) ?? '/images/formations/placeholder.jpg';

  const isGratuit = formation.prix === 0 || !formation.prix;
  const niveauLabel = NIVEAU_LABELS[formation.niveau] ?? formation.niveau;

  return (
    <main className="min-h-screen">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO — Image + Titre + CTA
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-orange-50/30 to-background dark:from-orange-950/20 dark:via-orange-950/5 dark:to-background">
        {/* Décoration de fond */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, #FF7900 0%, transparent 50%), radial-gradient(circle at 75% 75%, #E65100 0%, transparent 50%)',
          }}
        />

        <div className="relative container-page py-8">
          {/* ═══════ Fil d'Ariane ═══════ */}
          <nav aria-label="Fil d'Ariane" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-orange-600"
                >
                  Accueil
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li>
                <Link
                  href="/formations"
                  className="transition-colors hover:text-orange-600"
                >
                  Formations
                </Link>
              </li>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <li className="max-w-xs truncate font-medium text-foreground">
                {formation.titre}
              </li>
            </ol>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
            {/* ═══════ Colonne gauche — Image + Titre ═══════ */}
            <div>
              {/* Image avec overlay */}
              <div className="group relative mb-6 aspect-[16/9] overflow-hidden rounded-2xl bg-muted shadow-2xl ring-4 ring-orange-500/20">
                <Image
                  src={imageSrc}
                  alt={formation.titre}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                  unoptimized
                />

                {/* Overlay gradient pour lisibilité */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                  aria-hidden
                />

                {/* Play vidéo */}
                {formation.videoUrl && (
                  <button
                    type="button"
                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100"
                    aria-label="Lire la présentation vidéo"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-xl transition-transform hover:scale-110">
                      <PlayCircle className="h-8 w-8 text-orange-500" aria-hidden />
                    </div>
                  </button>
                )}

                {/* Badges overlay */}
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <Badge className="bg-orange-500 text-white shadow-lg hover:bg-orange-600">
                    <BookOpen className="mr-1 h-3 w-3" aria-hidden />
                    {formation.domaineRelation?.nom ?? formation.domaine}
                  </Badge>
                  {isGratuit && (
                    <Badge className="bg-green-600 text-white shadow-lg hover:bg-green-700">
                      <Sparkles className="mr-1 h-3 w-3" aria-hidden /> Gratuit
                    </Badge>
                  )}
                  {formation.certifiante && (
                    <Badge className="bg-amber-500 text-white shadow-lg hover:bg-amber-600">
                      <Award className="mr-1 h-3 w-3" aria-hidden /> Certifiante
                    </Badge>
                  )}
                </div>

                {/* Badge niveau (bas droite) */}
                <div className="absolute bottom-4 right-4">
                  <Badge
                    className={`shadow-lg ${NIVEAU_COLORS[formation.niveau]}`}
                  >
                    <BarChart3 className="mr-1 h-3 w-3" aria-hidden />
                    {niveauLabel}
                  </Badge>
                </div>
              </div>

              {/* Titre + méta */}
              <div className="space-y-4">
                {/* Badge catégorie + réf */}
                <div className="flex flex-wrap items-center gap-2">
                  {formation.reference && (
                    <Badge
                      variant="outline"
                      className="font-mono text-xs"
                    >
                      Réf. {formation.reference}
                    </Badge>
                  )}
                </div>

                {/* Titre principal */}
                <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
                  {formation.titre}
                </h1>

                {/* Description */}
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {formation.descriptionCourte ?? formation.description}
                </p>

                {/* Stats rapides */}
                <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
                  <StatCard
                    icon={Clock}
                    label="Durée"
                    value={`${formation.dureeHeures}h`}
                  />
                  <StatCard
                    icon={Users}
                    label="Places"
                    value={String(formation.nbParticipantsMax ?? '—')}
                  />
                  <StatCard
                    icon={GraduationCap}
                    label="Niveau"
                    value={niveauLabel}
                  />
                  <StatCard
                    icon={Award}
                    label="Certificat"
                    value={formation.certifiante ? 'Oui' : 'Non'}
                  />
                </div>
              </div>
            </div>

            {/* ═══════ Colonne droite — CTA sticky (desktop) ═══════ */}
            <div className="hidden lg:block">
              <InscriptionCta formation={formation} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CONTENU PRINCIPAL — Tabs
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="container-page py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
          <div>
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-2 gap-1 sm:grid-cols-4">
                <TabsTrigger value="description" className="text-xs sm:text-sm">
                  <FileText className="mr-1.5 h-4 w-4" aria-hidden />
                  Description
                </TabsTrigger>
                <TabsTrigger value="programme" className="text-xs sm:text-sm">
                  <BookOpen className="mr-1.5 h-4 w-4" aria-hidden />
                  Programme
                </TabsTrigger>
                <TabsTrigger value="sessions" className="text-xs sm:text-sm">
                  <Calendar className="mr-1.5 h-4 w-4" aria-hidden />
                  Sessions
                </TabsTrigger>
                <TabsTrigger value="formateurs" className="text-xs sm:text-sm">
                  <Users className="mr-1.5 h-4 w-4" aria-hidden />
                  Formateurs
                </TabsTrigger>
              </TabsList>

              {/* ─── DESCRIPTION ────────────────────────────────────── */}
              <TabsContent value="description" className="space-y-6">
                {formation.objectifs && (
                  <InfoCard
                    icon={Target}
                    title="Objectifs pédagogiques"
                    color="orange"
                  >
                    <FormattedList text={formation.objectifs} />
                  </InfoCard>
                )}

                {formation.prerequis && (
                  <InfoCard
                    icon={CheckCircle2}
                    title="Prérequis"
                    color="green"
                  >
                    <FormattedList text={formation.prerequis} />
                  </InfoCard>
                )}

                {formation.publicCible && (
                  <InfoCard
                    icon={Users}
                    title="Public cible"
                    color="blue"
                  >
                    <FormattedList text={formation.publicCible} />
                  </InfoCard>
                )}

                {formation.debouches && (
                  <InfoCard
                    icon={TrendingUp}
                    title="Débouchés & perspectives"
                    color="purple"
                  >
                    <FormattedList text={formation.debouches} />
                  </InfoCard>
                )}

                {!formation.objectifs &&
                  !formation.prerequis &&
                  !formation.publicCible &&
                  !formation.debouches && (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        <BookOpen
                          className="mx-auto mb-3 h-10 w-10 opacity-40"
                          aria-hidden
                        />
                        <p>Description détaillée en cours de finalisation.</p>
                      </CardContent>
                    </Card>
                  )}
              </TabsContent>

              {/* ─── PROGRAMME ──────────────────────────────────────── */}
              <TabsContent value="programme">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/40">
                        <BookOpen
                          className="h-4 w-4 text-orange-600 dark:text-orange-400"
                          aria-hidden
                        />
                      </div>
                      Programme détaillé
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {formation.programme ? (
                      <ProgrammeDisplay programme={formation.programme} />
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        <BookOpen
                          className="mx-auto mb-3 h-10 w-10 opacity-40"
                          aria-hidden
                        />
                        <p>Programme en cours de finalisation.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ─── SESSIONS ───────────────────────────────────────── */}
              <TabsContent value="sessions">
                <SessionList formationId={formation.id} />
              </TabsContent>

              {/* ─── FORMATEURS ─────────────────────────────────────── */}
              <TabsContent value="formateurs">
                <FormateursList formateurs={formation.formateurs ?? []} />
              </TabsContent>
            </Tabs>

            {/* ─── FAQ ──────────────────────────────────────────────── */}
            <div className="mt-12">
              <FormationFaq formation={formation} />
            </div>
          </div>

          {/* CTA mobile / tablette */}
          <div className="lg:hidden">
            <InscriptionCta formation={formation} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FORMATIONS SIMILAIRES
      <RelatedFormations
        formationId={formation.id}
        domaineId={formation.domaineRelation?.id ?? formation.domaineId}
      />
       */}
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SOUS-COMPOSANTS
   ═══════════════════════════════════════════════════════════════════════════ */

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:border-orange-300 hover:shadow-md dark:hover:border-orange-900">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  color = 'orange',
  children,
}: {
  icon: React.ElementType;
  title: string;
  color?: 'orange' | 'green' | 'blue' | 'purple';
  children: React.ReactNode;
}) {
  const colors = {
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-950/40',
      text: 'text-orange-600 dark:text-orange-400',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-950/40',
      text: 'text-green-600 dark:text-green-400',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-950/40',
      text: 'text-blue-600 dark:text-blue-400',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-950/40',
      text: 'text-purple-600 dark:text-purple-400',
    },
  };
  const c = colors[color];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.bg}`}>
            <Icon className={`h-4 w-4 ${c.text}`} aria-hidden />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** Affiche du texte multi-lignes en liste à puces si possible */
function FormattedList({ text }: { text: string }) {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const isList = lines.every((l) => /^[-•*]\s/.test(l)) && lines.length > 1;

  if (isList) {
    return (
      <ul className="space-y-2 text-muted-foreground">
        {lines.map((line, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-green-500"
              aria-hidden
            />
            <span>{line.replace(/^[-•*]\s*/, '')}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
      {text}
    </p>
  );
}

/** Affichage programme structuré (modules numérotés) */
function ProgrammeDisplay({ programme }: { programme: string }) {
  const modules = programme
    .split(/\n(?=(?:Module|Chapitre|\d+[\.\)])\s)/i)
    .map((m) => m.trim())
    .filter(Boolean);

  if (modules.length <= 1) {
    return (
      <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
        {programme}
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {modules.map((mod, i) => {
        const [title, ...rest] = mod.split('\n');
        const content = rest.join('\n').trim();
        return (
          <li key={i} className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-bold text-white shadow-sm">
              {i + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">{title}</p>
              {content && (
                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                  {content}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function FormateursList({ formateurs }: { formateurs: any[] }) {
  if (!formateurs?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Users className="mx-auto mb-3 h-10 w-10 opacity-40" aria-hidden />
          <p>Formateurs à venir.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {formateurs.map((f) => (
        <Card
          key={f.id}
          className="transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md dark:hover:border-orange-900"
        >
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 ring-2 ring-orange-200 dark:bg-orange-950/40 dark:ring-orange-900">
              {f.photoUrl ? (
                <Image
                  src={getMediaUrl(f.photoUrl) ?? ''}
                  alt={`${f.prenom} ${f.nom}`}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <Users className="h-7 w-7 text-orange-500" aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">
                {f.prenom} {f.nom}
              </p>
              {f.specialite && (
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                  {f.specialite}
                </p>
              )}
              {f.bio && (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {f.bio}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}