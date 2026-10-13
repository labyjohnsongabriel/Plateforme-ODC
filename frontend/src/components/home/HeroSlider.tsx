'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* ============================================================================
   SLIDES
   ============================================================================ */
const SLIDES = [
  {
    id: 1,
    badge: '🚀 Nouvelle session ouverte',
    title: 'Formez-vous aux',
    titleHighlight: 'métiers du numérique',
    description:
      'Orange Digital Center vous accompagne dans votre parcours de formation. Inscriptions en ligne, suivi personnalisé, attestations numériques.',
    image: '/images/hero/slide-1.jpg',
    primaryCta: { label: 'Voir les formations', href: '/formations' },
    secondaryCta: { label: 'En savoir plus', href: '/a-propos' },
  },
  {
    id: 2,
    badge: '💡 Innovation & Entrepreneuriat',
    title: 'Devenez acteur de la',
    titleHighlight: 'transformation digitale',
    description:
      'Développement web, data science, cybersécurité, design — maîtrisez les compétences les plus recherchées du marché.',
    image: '/images/hero/slide-2.jpg',
    primaryCta: { label: 'Explorer le catalogue', href: '/formations' },
    secondaryCta: { label: 'Voir les sessions', href: '/sessions' },
  },
  {
    id: 3,
    badge: '🌱 Communauté Y2C',
    title: 'Rejoignez une communauté',
    titleHighlight: 'engagée et solidaire',
    description:
      'Réseau d\'anciens et de nouveaux apprenants, événements, ateliers, opportunités professionnelles.',
    image: '/images/hero/slide-3.jpg',
    primaryCta: { label: 'Découvrir Y2C', href: '/communaute-y2c' },
    secondaryCta: { label: 'Nous contacter', href: '/contact' },
  },
] as const;

const AUTOPLAY_DELAY = 6000;

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  /* Autoplay */
  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(next, AUTOPLAY_DELAY);
    return () => clearTimeout(timer);
  }, [current, isPaused, next]);

  const slide = SLIDES[current];

  return (
    <section
      className="relative min-h-[85vh] flex items-center overflow-hidden bg-odc-surface-alt"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carrousel"
      aria-label="Présentation de l'ODC"
    >
      {/* ---------- IMAGES DE FOND ---------- */}
      {SLIDES.map((s, index) => (
        <div
          key={s.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000',
            index === current ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden={index !== current}
        >
          <Image
            src={s.image}
            alt=""
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        </div>
      ))}

      {/* ---------- CONTENU ---------- */}
      <div className="container-page relative z-10 py-20">
        <div className="max-w-3xl text-white">
          {/* Badge */}
          <div
            key={`badge-${current}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm font-medium mb-6 animate-slide-in-up"
          >
            <Sparkles className="h-4 w-4 text-odc-300" />
            {slide.badge}
          </div>

          {/* Titre */}
          <h1
            key={`title-${current}`}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-slide-in-up"
          >
            {slide.title}{' '}
            <span className="bg-gradient-to-r from-odc-300 to-odc-500 bg-clip-text text-transparent">
              {slide.titleHighlight}
            </span>
          </h1>

          {/* Description */}
          <p
            key={`desc-${current}`}
            className="text-lg md:text-xl text-white/85 mb-10 max-w-2xl animate-slide-in-up"
          >
            {slide.description}
          </p>

          {/* CTA */}
          <div
            key={`cta-${current}`}
            className="flex flex-wrap gap-3 animate-slide-in-up"
          >
            <Button variant="odc" size="lg" asChild>
              <Link href={slide.primaryCta.href}>
                {slide.primaryCta.label}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href={slide.secondaryCta.href}>
                {slide.secondaryCta.label}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ---------- FLÈCHES ---------- */}
      <button
        onClick={prev}
        aria-label="Slide précédent"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label="Slide suivant"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* ---------- POINTS ---------- */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((s, index) => (
          <button
            key={s.id}
            onClick={() => setCurrent(index)}
            aria-label={`Aller au slide ${index + 1}`}
            aria-current={index === current}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              index === current
                ? 'w-8 bg-odc-500'
                : 'w-2 bg-white/40 hover:bg-white/60',
            )}
          />
        ))}
      </div>
    </section>
  );
}