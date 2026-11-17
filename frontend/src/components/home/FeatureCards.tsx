// src/app/(public)/components/FeatureCards.tsx
import Link from 'next/link';
import {
  BookOpen, Users, Award, ShieldCheck, ArrowRight, Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/* ═══════════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════════ */

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Catalogue complet',
    description:
      'Explorez notre large éventail de formations dans tous les domaines du numérique : développement, data, design, cybersécurité…',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-950/40 dark:to-orange-900/20',
    ring: 'ring-orange-200 dark:ring-orange-900',
    href: '/formations',
    linkLabel: 'Découvrir',
  },
  {
    icon: Users,
    title: 'Suivi personnalisé',
    description:
      'Présences par QR code, évaluations, notes et progression en temps réel sur votre espace personnel.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950/40 dark:to-blue-900/20',
    ring: 'ring-blue-200 dark:ring-blue-900',
    href: '/formations',
    linkLabel: 'En savoir plus',
  },
  {
    icon: Award,
    title: 'Attestations numériques',
    description:
      'Recevez vos attestations signées numériquement, vérifiables par QR code, valorisables auprès des recruteurs.',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-950/40 dark:to-purple-900/20',
    ring: 'ring-purple-200 dark:ring-purple-900',
    href: '/verifier-attestation',
    linkLabel: 'Vérifier une attestation',
  },
  {
    icon: ShieldCheck,
    title: 'Sécurité & fiabilité',
    description:
      'Vos données sont protégées et vos parcours de formation conservés de manière sécurisée et durable.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950/40 dark:to-emerald-900/20',
    ring: 'ring-emerald-200 dark:ring-emerald-900',
    href: '/a-propos',
    linkLabel: 'Notre engagement',
  },
] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function FeatureCards() {
  return (
    <section
      className="container-page py-20 md:py-28"
      aria-labelledby="features-title"
    >
      {/* En-tête */}
      <div className="mb-14 text-center">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-700 ring-1 ring-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:ring-orange-900">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Pourquoi nous choisir
        </span>
        <h2
          id="features-title"
          className="mb-4 font-display text-3xl font-bold text-foreground md:text-5xl"
        >
          Une plateforme complète,
          <br className="hidden md:block" />
          pensée pour votre réussite
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          De l&apos;inscription à l&apos;attestation, tout est réuni sur un seul
          espace pour vous accompagner dans votre parcours.
        </p>
      </div>

      {/* Grille */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.title}
              className="group relative animate-fade-in overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Décoration d'angle */}
              <div
                className={`absolute right-0 top-0 h-24 w-24 rounded-bl-full ${feature.bg} opacity-50 transition-transform duration-500 group-hover:scale-150`}
                aria-hidden
              />

              <CardContent className="relative p-6">
                {/* Icône */}
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} ring-2 ${feature.ring} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}
                >
                  <Icon className={`h-7 w-7 ${feature.color}`} aria-hidden />
                </div>

                {/* Titre */}
                <h3 className="mb-3 font-display text-lg font-bold text-foreground">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>

                {/* Lien */}
                <Link
                  href={feature.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 transition-all hover:gap-2.5 dark:text-orange-400"
                >
                  {feature.linkLabel}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>

                {/* Barre décorative au hover */}
                <div
                  className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500 group-hover:w-full"
                  aria-hidden
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}