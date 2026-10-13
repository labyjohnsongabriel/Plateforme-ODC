'use client';

import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Rakoto Andry',
    role: 'Développeur Web — Freelance',
    content:
      'Grâce à l\'ODC, j\'ai suivi une formation complète en développement web. Aujourd\'hui, je travaille en freelance et j\'ai déjà plusieurs clients satisfaits.',
    rating: 5,
    initials: 'RA',
  },
  {
    id: '2',
    name: 'Randria Marie',
    role: 'Data Analyst Junior',
    content:
      'La qualité des formations et l\'accompagnement personnalisé m\'ont permis de décrocher mon premier emploi dans la data. Un immense merci à toute l\'équipe !',
    rating: 5,
    initials: 'RM',
  },
  {
    id: '3',
    name: 'Jean Baptiste',
    role: 'Designer UX/UI',
    content:
      'Les formateurs sont passionnés et à l\'écoute. J\'ai pu créer mon portfolio et intégrer une agence de design à Antananarivo dès la fin de ma formation.',
    rating: 5,
    initials: 'JB',
  },
];

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((c) => (c + 1) % TESTIMONIALS.length);
  const prev = () =>
    setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  const t = TESTIMONIALS[current];

  return (
    <section
      className="container-page py-20 md:py-28"
      aria-labelledby="testimonials-title"
    >
      <div className="text-center mb-12">
        <span className="inline-block rounded-full bg-odc-primary-soft text-odc-primary px-4 py-1.5 text-sm font-medium mb-4">
          💬 Témoignages
        </span>
        <h2
          id="testimonials-title"
          className="font-display text-3xl md:text-5xl font-bold mb-4"
        >
          Ils nous font confiance
        </h2>
        <p className="text-odc-muted text-lg max-w-2xl mx-auto">
          Découvrez les parcours inspirants de nos anciens apprenants.
        </p>
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Quote icon */}
        <Quote className="absolute -top-6 -left-6 h-20 w-20 text-odc-primary/15 rotate-180" />

        {/* Card */}
        <div className="relative rounded-3xl border border-odc-border bg-odc-surface p-8 md:p-12 shadow-odc-lg animate-fade-in">
          {/* Étoiles */}
          <div className="flex gap-1 mb-6">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star
                key={i}
                className="h-5 w-5 fill-odc-primary text-odc-primary"
              />
            ))}
          </div>

          {/* Contenu */}
          <blockquote className="font-display text-xl md:text-2xl leading-relaxed mb-8 italic">
            « {t.content} »
          </blockquote>

          {/* Auteur */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-odc-500 to-odc-700 flex items-center justify-center text-white font-display font-bold">
              {t.initials}
            </div>
            <div>
              <p className="font-display font-semibold">{t.name}</p>
              <p className="text-sm text-odc-muted">{t.role}</p>
            </div>
          </div>

          {/* Flèches internes */}
          <button
            onClick={prev}
            aria-label="Témoignage précédent"
            className="hidden md:flex absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-odc-surface border border-odc-border shadow-odc-md hover:bg-odc-primary hover:text-white hover:border-odc-primary transition-colors items-center justify-center"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Témoignage suivant"
            className="hidden md:flex absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-odc-surface border border-odc-border shadow-odc-md hover:bg-odc-primary hover:text-white hover:border-odc-primary transition-colors items-center justify-center"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Points */}
        <div className="flex justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              aria-label={`Témoignage ${index + 1}`}
              aria-current={index === current}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                index === current
                  ? 'w-8 bg-odc-primary'
                  : 'w-2 bg-odc-border hover:bg-odc-border-strong',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}