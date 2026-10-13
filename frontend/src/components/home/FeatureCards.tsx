import Link from 'next/link';
import {
  BookOpen, Users, Award, ShieldCheck,
  ArrowRight, Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/* ============================================================================
   FEATURES
   ============================================================================ */
const FEATURES = [
  {
    icon: BookOpen,
    title: 'Catalogue complet',
    description:
      'Explorez notre large éventail de formations dans tous les domaines du numérique : développement, data, design, cybersécurité…',
    color: 'text-odc-primary',
    bg: 'bg-odc-primary-soft',
    href: '/formations',
    linkLabel: 'Découvrir',
  },
  {
    icon: Users,
    title: 'Suivi personnalisé',
    description:
      'Présences par QR code, évaluations, notes et progression en temps réel sur votre espace personnel.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-950',
    href: '/formations',
    linkLabel: 'En savoir plus',
  },
  {
    icon: Award,
    title: 'Attestations numériques',
    description:
      'Recevez vos attestations signées numériquement, vérifiables par QR code, valorisables auprès des recruteurs.',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-950',
    href: '/verifier-attestation',
    linkLabel: 'Vérifier une attestation',
  },
  {
    icon: ShieldCheck,
    title: 'Sécurité & fiabilité',
    description:
      'Vos données sont protégées et vos parcours de formation conservés de manière sécurisée et durable.',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-950',
    href: '/a-propos',
    linkLabel: 'Notre engagement',
  },
] as const;

export function FeatureCards() {
  return (
    <section
      className="container-page py-20 md:py-28"
      aria-labelledby="features-title"
    >
      {/* ---------- EN-TÊTE ---------- */}
      <div className="text-center mb-14">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-odc-primary-soft text-odc-primary px-4 py-1.5 text-sm font-medium mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          Pourquoi nous choisir
        </span>

        <h2
          id="features-title"
          className="font-display text-3xl md:text-5xl font-bold mb-4"
        >
          Une plateforme complète,
          <br className="hidden md:block" />
          pensée pour votre réussite
        </h2>

        <p className="text-odc-muted max-w-2xl mx-auto text-lg">
          De l&apos;inscription à l&apos;attestation, tout est réuni sur un seul
          espace pour vous accompagner dans votre parcours.
        </p>
      </div>

      {/* ---------- GRILLE ---------- */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.title}
              className="group relative overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:shadow-odc-lg animate-fade-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Décoration coin */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-odc-100 dark:from-odc-950 to-transparent rounded-bl-full opacity-50 group-hover:scale-150 transition-transform duration-500" />

              <CardContent className="relative p-6">
                <div
                  className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`h-7 w-7 ${feature.color}`} />
                </div>

                <h3 className="font-display text-lg font-semibold mb-3">
                  {feature.title}
                </h3>

                <p className="text-sm text-odc-muted leading-relaxed mb-4">
                  {feature.description}
                </p>

                <Link
                  href={feature.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-odc-primary hover:gap-2.5 transition-all"
                >
                  {feature.linkLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}