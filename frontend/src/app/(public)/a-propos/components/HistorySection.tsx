// src/app/(public)/a-propos/components/HistorySection.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  TrendingUp,
  Users,
  Award,
  MapPin,
  Sparkles,
  Building2,
  Target,
  Rocket,
  Cpu,
  GraduationCap,
  Network,
  CheckCircle2,
} from 'lucide-react';
import { ODC_SITES, VILLES_LABEL } from '@/lib/sites';

/* ═══════════════════════════════════════════════════════════════════════════
   ⭐ IMAGES — logo ODC local + externes
   ═══════════════════════════════════════════════════════════════════════════ */

const IMAGES = {
  /** Logo Orange (SVG officiel — Wikimedia) */
  orangeLogo:
    'https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg',

  /** ⭐ Logo ODC — fichier LOCAL */
  odcLogo: '/images/brand/logo-odc.png',

  /** Photo hero — Unsplash */
  heroPhoto:
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',

  /** Photo équipe — Unsplash */
  teamPhoto:
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop&q=80',
} as const;

/* ═══════════════════════════════════════════════════════════════════════════
   JALONS 2020 → 2026
   ═══════════════════════════════════════════════════════════════════════════ */

const MILESTONES = [
  {
    year: '2020',
    title: "Création de l'ODC",
    description:
      "Ouverture du premier Orange Digital Center à Antananarivo, marquant le début de notre engagement pour l'inclusion numérique à Madagascar.",
    icon: Calendar,
    color: 'from-orange-500 to-orange-400',
  },
  {
    year: '2022',
    title: 'Expansion régionale',
    description:
      'Déploiement dans 5 régions de Madagascar, dont Fianarantsoa, pour rapprocher les formations numériques des communautés locales.',
    icon: TrendingUp,
    color: 'from-amber-500 to-orange-400',
  },
  {
    year: '2024',
    title: '10 000 bénéficiaires',
    description:
      'Cap symbolique franchi : plus de 10 000 jeunes formés aux métiers du numérique à travers nos 2 sites.',
    icon: Users,
    color: 'from-orange-600 to-amber-400',
  },
  {
    year: '2025',
    title: 'Lancement du programme IA',
    description:
      "Introduction des formations en intelligence artificielle, data science avancée et cybersécurité dans nos centres d'Antananarivo et Fianarantsoa.",
    icon: Cpu,
    color: 'from-orange-500 to-amber-500',
  },
  {
    year: '2026',
    title: 'Nouvelle ère numérique',
    description:
      "Renforcement de l'écosystème ODC : partenariats internationaux, certifications reconnues et ouverture de nouveaux espaces d'innovation.",
    icon: Rocket,
    color: 'from-orange-600 to-orange-500',
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   STATISTIQUES
   ═══════════════════════════════════════════════════════════════════════════ */

const STATS = [
  { value: '6+', label: 'Années', icon: Calendar },
  { value: '25k+', label: 'Formés', icon: GraduationCap },
  { value: '2', label: 'Sites', icon: Building2 },
];

/* ═══════════════════════════════════════════════════════════════════════════
   LOGO ODC — fichier local
   ═══════════════════════════════════════════════════════════════════════════ */

function OdcLogo({ size = 40 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-orange-200/40"
    >
      <Image
        src={IMAGES.odcLogo}
        alt="Orange Digital Center"
        fill
        sizes={`${size}px`}
        className="object-contain p-1"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOGO ORANGE — URL externe
   ═══════════════════════════════════════════════════════════════════════════ */

function OrangeLogo({
  width = 96,
  height = 32,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <div style={{ width, height }} className="relative">
      <Image
        src={IMAGES.orangeLogo}
        alt="Orange"
        fill
        sizes={`${width}px`}
        className="object-contain"
        unoptimized
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   IMAGE HERO — photo Unsplash + logo local superposé
   ═══════════════════════════════════════════════════════════════════════════ */

function HeroImage() {
  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden">
      <Image
        src={IMAGES.heroPhoto}
        alt="Locaux de l'Orange Digital Center"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 hover:scale-105"
        unoptimized
      />

      {/* Overlay dégradé orange */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-orange-900/95 via-orange-900/40 to-transparent"
        aria-hidden
      />

      {/* Contenu superposé */}
      <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center">
        {/* Logo ODC — fichier local */}
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/95 backdrop-blur-sm p-2 shadow-xl ring-1 ring-white/40">
          <div className="relative h-full w-full">
            <Image
              src={IMAGES.odcLogo}
              alt="Logo ODC"
              fill
              sizes="64px"
              className="object-contain"
            />
          </div>
        </div>

        {/* Titre */}
        <p className="font-display text-2xl md:text-3xl font-black text-white drop-shadow-lg">
          Orange Digital Center
        </p>

        {/* Villes */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {ODC_SITES.map((site) => (
            <span
              key={site.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/25 backdrop-blur-sm px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/30"
            >
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {site.ville}
            </span>
          ))}
        </div>

        {/* Badges */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
            <Target className="h-3 w-3" aria-hidden />
            Innovation
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
            <Sparkles className="h-3 w-3" aria-hidden />
            Excellence
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
            <Network className="h-3 w-3" aria-hidden />
            Réseau
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */

export function HistorySection() {
  return (
    <section
      id="histoire"
      aria-labelledby="history-title"
      className="relative overflow-hidden bg-gradient-to-b from-background via-orange-50/30 to-background dark:from-background dark:via-orange-950/10 dark:to-background py-16 md:py-24"
    >
      {/* Décoration de fond */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, #FF7900 0%, transparent 50%), radial-gradient(circle at 75% 75%, #E65100 0%, transparent 50%)',
        }}
      />

      {/* Filigrane logo ODC — fichier local */}
      <div
        className="pointer-events-none absolute -right-16 top-16 h-64 w-64 opacity-[0.04] dark:opacity-[0.06]"
        aria-hidden
      >
        <Image
          src={IMAGES.odcLogo}
          alt=""
          fill
          sizes="256px"
          className="object-contain"
        />
      </div>

      <div className="relative container mx-auto px-4">
        {/* ═══════ En-tête ═══════ */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 rounded-2xl bg-white/80 dark:bg-black/40 backdrop-blur-sm px-5 py-3 shadow-lg ring-1 ring-orange-200/60 dark:ring-orange-900/60 transition-transform hover:scale-105"
              aria-label="Retour à l'accueil"
            >
              <OdcLogo size={40} />
              <div className="flex flex-col leading-tight text-left">
                <span className="font-display text-sm font-bold text-foreground">
                  Orange Digital Center
                </span>
                <span className="text-[11px] font-medium tracking-wide text-orange-600 dark:text-orange-400">
                  Madagascar
                </span>
              </div>
            </Link>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 px-4 py-1.5 text-sm font-semibold mb-4 ring-1 ring-orange-200 dark:ring-orange-900">
            <Award className="h-4 w-4" aria-hidden />
            Notre histoire
          </span>

          <h2
            id="history-title"
            className="font-display text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent"
          >
            Un parcours au service du numérique
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            Depuis 2020 jusqu&apos;en 2026, l&apos;Orange Digital Center œuvre
            pour rendre le numérique accessible à tous les Malgaches — à{' '}
            <strong className="text-orange-600 dark:text-orange-400">
              {VILLES_LABEL}
            </strong>
            .
          </p>
        </div>

        {/* ═══════ Bloc image + texte ═══════ */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-20">
          <div className="relative group">
            <div
              className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-orange-300 rounded-2xl opacity-30 blur-xl group-hover:opacity-50 transition-opacity duration-500"
              aria-hidden
            />

            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-orange-500/20">
              <HeroImage />

              {/* Badge multi-villes */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                {ODC_SITES.map((site) => (
                  <div
                    key={site.id}
                    className="bg-white/95 dark:bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-lg"
                  >
                    <MapPin className="h-3.5 w-3.5 text-orange-500" aria-hidden />
                    <span className="text-xs font-semibold text-foreground">
                      {site.ville}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-foreground/80 leading-relaxed text-base md:text-lg">
              L&apos;Orange Digital Center est bien plus qu&apos;un simple lieu
              de formation. C&apos;est un écosystème complet qui accompagne les
              porteurs de projets, les jeunes diplômés et les professionnels
              dans leur transition numérique.
            </p>
            <p className="text-foreground/80 leading-relaxed text-base md:text-lg">
              Nos programmes couvrent l&apos;ensemble des métiers du numérique :
              développement web, data science, intelligence artificielle,
              cybersécurité, design, entrepreneuriat digital et bien plus
              encore — dans nos centres d&apos;
              <strong className="text-orange-600 dark:text-orange-400">
                {VILLES_LABEL}
              </strong>
              .
            </p>
            <p className="text-foreground/80 leading-relaxed text-base md:text-lg">
              Nous croyons fermement que l&apos;accès à la formation numérique
              est un levier majeur de développement économique et social pour
              Madagascar.
            </p>

            {/* Chiffres clés */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-orange-200/40 dark:border-orange-900/40">
              {STATS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center">
                    <Icon
                      className="mx-auto mb-2 h-5 w-5 text-orange-500"
                      aria-hidden
                    />
                    <p className="font-display text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══════ Timeline 2020 → 2026 ═══════ */}
        <div className="relative">
          <div
            className="absolute left-0 right-0 top-12 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full"
            aria-hidden
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 md:gap-10 relative">
            {MILESTONES.map((milestone, index) => {
              const Icon = milestone.icon;
              const isLast = index === MILESTONES.length - 1;
              const isFirst = index === 0;

              return (
                <div
                  key={milestone.year}
                  className="relative animate-fade-in"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${milestone.color} rounded-full blur-lg opacity-40`}
                        aria-hidden
                      />
                      <div
                        className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${milestone.color} flex items-center justify-center shadow-xl ring-4 ring-background`}
                      >
                        <Icon className="h-10 w-10 text-white" aria-hidden />
                      </div>

                      {(isFirst || isLast) && (
                        <Sparkles
                          className={`absolute -top-2 -right-2 h-5 w-5 text-orange-400 ${
                            isLast ? 'animate-pulse' : ''
                          }`}
                          aria-hidden
                        />
                      )}
                    </div>

                    <span className="inline-block font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent mb-2">
                      {milestone.year}
                    </span>

                    <h3 className="font-display text-lg md:text-xl font-semibold mb-3 text-foreground">
                      {milestone.title}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════ Sites en bas ═══════ */}
        <div className="mt-16">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
            Nos sites à Madagascar
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {ODC_SITES.map((site) => (
              <div
                key={site.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/40">
                  <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-bold text-foreground">
                    {site.ville}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {site.region}
                  </p>
                  <p className="text-xs text-foreground/70 mt-1">
                    {site.adresse}
                  </p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" aria-hidden />
              </div>
            ))}
          </div>
        </div>

        {/* ═══════ Logos en bas ═══════ */}
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Une initiative
          </p>
          <div className="flex items-center gap-8">
            {/* Logo Orange */}
            <OrangeLogo width={96} height={32} />

            <div className="h-8 w-px bg-border" aria-hidden />

            {/* Logo ODC — fichier local */}
            <div className="flex items-center gap-2">
              <OdcLogo size={40} />
              <span className="font-display text-base font-bold text-foreground">
                ODC
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}