// src/app/(public)/a-propos/components/ValuesSection.tsx
import {
  Lightbulb, Users, Shield, Rocket, Heart, Target,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const VALUES = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      "Nous encourageons la créativité et l'expérimentation pour préparer aux métiers de demain.",
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-950/40 dark:to-yellow-900/20',
    ring: 'ring-yellow-200 dark:ring-yellow-900',
  },
  {
    icon: Users,
    title: 'Inclusion',
    description:
      "Le numérique doit être accessible à tous, sans distinction de genre, d'origine ou de niveau.",
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950/40 dark:to-blue-900/20',
    ring: 'ring-blue-200 dark:ring-blue-900',
  },
  {
    icon: Shield,
    title: 'Excellence',
    description:
      'Nous visons les plus hauts standards de qualité dans chaque formation dispensée.',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-950/40 dark:to-orange-900/20',
    ring: 'ring-orange-200 dark:ring-orange-900',
  },
  {
    icon: Rocket,
    title: 'Impact',
    description:
      "Chaque formation doit générer un impact concret : emploi, création d'entreprise, projets.",
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-950/40 dark:to-purple-900/20',
    ring: 'ring-purple-200 dark:ring-purple-900',
  },
  {
    icon: Heart,
    title: 'Communauté',
    description:
      "Nous créons un réseau solidaire d'anciens et de nouveaux apprenants pour durer.",
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-gradient-to-br from-red-100 to-red-50 dark:from-red-950/40 dark:to-red-900/20',
    ring: 'ring-red-200 dark:ring-red-900',
  },
  {
    icon: Target,
    title: 'Engagement',
    description:
      "Nous nous engageons pleinement aux côtés de chaque apprenant jusqu'à sa réussite.",
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950/40 dark:to-emerald-900/20',
    ring: 'ring-emerald-200 dark:ring-emerald-900',
  },
];

export function ValuesSection() {
  return (
    <section
      id="valeurs"
      aria-labelledby="values-title"
      className="relative py-16 md:py-24 bg-muted/30"
    >
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 px-4 py-1.5 text-sm font-semibold mb-4 ring-1 ring-orange-200 dark:ring-orange-900">
            <Heart className="h-4 w-4" aria-hidden />
            Nos valeurs
          </span>
          <h2
            id="values-title"
            className="font-display text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent"
          >
            Ce qui nous guide au quotidien
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            Six valeurs fondamentales qui orientent chacune de nos actions et de
            nos décisions.
          </p>
        </div>

        {/* Grille de valeurs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VALUES.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card
                key={value.title}
                className="group relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Fond dégradé au hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 via-orange-50/0 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden />

                <CardContent className="relative p-6">
                  {/* Icône */}
                  <div
                    className={`w-16 h-16 rounded-2xl ${value.bg} ring-2 ${value.ring} flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}
                  >
                    <Icon className={`h-8 w-8 ${value.color}`} aria-hidden />
                  </div>

                  {/* Titre */}
                  <h3 className="font-display text-xl font-bold mb-3 text-foreground">
                    {value.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>

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
      </div>
    </section>
  );
}