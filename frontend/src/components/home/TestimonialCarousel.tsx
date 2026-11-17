// src/app/(public)/components/TestimonialCarousel.tsx
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
    content: "Grâce à l'ODC, j'ai suivi une formation complète en développement web. Aujourd'hui, je travaille en freelance avec plusieurs clients satisfaits.",
    rating: 5,
    initials: 'RA',
  },
  {
    id: '2',
    name: 'Randria Marie',
    role: 'Data Analyst Junior',
    content: "La qualité des formations et l'accompagnement personnalisé m'ont permis de décrocher mon premier emploi dans la data.",
    rating: 5,
    initials: 'RM',
  },
  {
    id: '3',
    name: 'Jean Baptiste',
    role: 'Designer UX/UI',
    content: "Les formateurs sont passionnés et à l'écoute. J'ai intégré une agence de design à Antananarivo dès la fin de ma formation.",
    rating: 5,
    initials: 'JB',
  },
];

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const next = () => setCurrent((c) => (c + 1) % TESTIMONIALS.length);
  const prev = () => setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const t = TESTIMONIALS[current];

  return (
    <section className="container-page py-20 md:py-28" aria-labelledby="testimonials-title">
      <div className="mb-12 text-center">
        <span className="mb-4 inline-block rounded-full bg-odc-primary-soft px-4 py-1.5 text-sm font-medium text-odc-primary">
          💬 Témoignages
        </span>
        <h2 id="testimonials-title" className="mb-4 font-display text-3xl font-bold md:text-5xl">
          Ils nous font confiance
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-odc-muted">
          Découvrez les parcours inspirants de nos anciens apprenants.
        </p>
      </div>

      <div className="relative mx-auto max-w-4xl">
        <Quote className="absolute -left-6 -top-6 h-20 w-20 rotate-180 text-odc-primary/15" />

        <div className="relative animate-fade-in rounded-3xl border border-odc-border bg-odc-surface p-8 shadow-odc-lg md:p-12">
          <div className="mb-6 flex gap-1">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-odc-primary text-odc-primary" />
            ))}
          </div>

          <blockquote className="mb-8 font-display text-xl italic leading-relaxed md:text-2xl">
            « {t.content} »
          </blockquote>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-odc-500 to-odc-700 font-display font-bold text-white">
              {t.initials}
            </div>
            <div>
              <p className="font-display font-semibold">{t.name}</p>
              <p className="text-sm text-odc-muted">{t.role}</p>
            </div>
          </div>

          <button
            onClick={prev}
            aria-label="Témoignage précédent"
            className="absolute left-0 top-1/2 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-odc-border bg-odc-surface shadow-odc-md transition-colors hover:border-odc-primary hover:bg-odc-primary hover:text-white md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="Témoignage suivant"
            className="absolute right-0 top-1/2 hidden h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-odc-border bg-odc-surface shadow-odc-md transition-colors hover:border-odc-primary hover:bg-odc-primary hover:text-white md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {TESTIMONIALS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              aria-label={`Témoignage ${index + 1}`}
              aria-current={index === current}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                index === current ? 'w-8 bg-odc-primary' : 'w-2 bg-odc-border hover:bg-odc-muted',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}