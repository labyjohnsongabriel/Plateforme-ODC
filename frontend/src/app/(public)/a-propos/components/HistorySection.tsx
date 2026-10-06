import Image from 'next/image';
import { Calendar, TrendingUp, Users } from 'lucide-react';

const MILESTONES = [
  {
    year: '2020',
    title: 'Création de l\'ODC',
    description:
      'Ouverture du premier Orange Digital Center à Antananarivo, marquant le début de notre engagement pour l\'inclusion numérique à Madagascar.',
    icon: Calendar,
  },
  {
    year: '2022',
    title: 'Expansion régionale',
    description:
      'Déploiement dans 5 régions de Madagascar pour rapprocher les formations numériques des communautés locales.',
    icon: TrendingUp,
  },
  {
    year: '2024',
    title: '10 000 bénéficiaires',
    description:
      'Cap symbolique franchi : plus de 10 000 jeunes formés aux métiers du numérique.',
    icon: Users,
  },
];

export function HistorySection() {
  return (
    <section id="histoire" aria-labelledby="history-title">
      <div className="text-center mb-12">
        <span className="inline-block rounded-full bg-odc-primary-soft text-odc-primary px-4 py-1.5 text-sm font-medium mb-4">
          Notre histoire
        </span>
        <h2
          id="history-title"
          className="font-display text-3xl md:text-4xl font-bold mb-4"
        >
          Un parcours au service du numérique
        </h2>
        <p className="text-odc-muted max-w-2xl mx-auto">
          Depuis 2020, l&apos;Orange Digital Center œuvre pour rendre le numérique
          accessible à tous les Malgaches.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-odc-lg">
          <Image
            src="/images/hero/slide-1.jpg"
            alt="Locaux de l'Orange Digital Center"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="space-y-6">
          <p className="text-odc-secondary leading-relaxed">
            L&apos;Orange Digital Center est bien plus qu&apos;un simple lieu de
            formation. C&apos;est un écosystème complet qui accompagne les
            porteurs de projets, les jeunes diplômés et les professionnels
            dans leur transition numérique.
          </p>
          <p className="text-odc-secondary leading-relaxed">
            Nos programmes couvrent l&apos;ensemble des métiers du numérique :
            développement web, data science, cybersécurité, design,
            entrepreneuriat digital et bien plus encore.
          </p>
          <p className="text-odc-secondary leading-relaxed">
            Nous croyons fermement que l&apos;accès à la formation numérique est
            un levier majeur de développement économique et social pour
            Madagascar.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div
          className="absolute left-0 right-0 top-12 h-0.5 bg-gradient-to-r from-odc-200 via-odc-500 to-odc-200 dark:from-odc-900 dark:via-odc-500 dark:to-odc-900"
          aria-hidden="true"
        />

        <div className="grid md:grid-cols-3 gap-8 relative">
          {MILESTONES.map((milestone, index) => {
            const Icon = milestone.icon;
            return (
              <div
                key={milestone.year}
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-odc-surface border-4 border-odc-primary flex items-center justify-center shadow-odc-lg mb-6 relative z-10">
                    <Icon className="h-10 w-10 text-odc-primary" />
                  </div>

                  <span className="font-display text-3xl font-bold text-odc-primary mb-2">
                    {milestone.year}
                  </span>

                  <h3 className="font-display text-xl font-semibold mb-2">
                    {milestone.title}
                  </h3>

                  <p className="text-sm text-odc-muted leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}