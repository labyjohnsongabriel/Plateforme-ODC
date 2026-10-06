import { Lightbulb, Users, Shield, Rocket, Heart, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const VALUES = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'Nous encourageons la créativité et l\'expérimentation pour préparer aux métiers de demain.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-100 dark:bg-yellow-950',
  },
  {
    icon: Users,
    title: 'Inclusion',
    description:
      'Le numérique doit être accessible à tous, sans distinction de genre, d\'origine ou de niveau.',
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-950',
  },
  {
    icon: Shield,
    title: 'Excellence',
    description:
      'Nous visons les plus hauts standards de qualité dans chaque formation dispensée.',
    color: 'text-odc-primary',
    bg: 'bg-odc-primary-soft',
  },
  {
    icon: Rocket,
    title: 'Impact',
    description:
      'Chaque formation doit générer un impact concret : emploi, création d\'entreprise, projets.',
    color: 'text-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-950',
  },
  {
    icon: Heart,
    title: 'Communauté',
    description:
      'Nous créons un réseau solidaire d\'anciens et de nouveaux apprenants pour durer.',
    color: 'text-red-500',
    bg: 'bg-red-100 dark:bg-red-950',
  },
  {
    icon: Target,
    title: 'Engagement',
    description:
      'Nous nous engageons pleinement aux côtés de chaque apprenant jusqu\'à sa réussite.',
    color: 'text-green-500',
    bg: 'bg-green-100 dark:bg-green-950',
  },
];

export function ValuesSection() {
  return (
    <section id="valeurs" aria-labelledby="values-title">
      <div className="text-center mb-12">
        <span className="inline-block rounded-full bg-odc-primary-soft text-odc-primary px-4 py-1.5 text-sm font-medium mb-4">
          Nos valeurs
        </span>
        <h2
          id="values-title"
          className="font-display text-3xl md:text-4xl font-bold mb-4"
        >
          Ce qui nous guide au quotidien
        </h2>
        <p className="text-odc-muted max-w-2xl mx-auto">
          Six valeurs fondamentales qui orientent chacune de nos actions et de
          nos décisions.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {VALUES.map((value, index) => {
          const Icon = value.icon;
          return (
            <Card
              key={value.title}
              className="group hover:-translate-y-1 transition-transform animate-fade-in"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <CardContent className="p-6">
                <div
                  className={`w-14 h-14 rounded-xl ${value.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`h-7 w-7 ${value.color}`} />
                </div>

                <h3 className="font-display text-xl font-semibold mb-2">
                  {value.title}
                </h3>

                <p className="text-sm text-odc-muted leading-relaxed">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}