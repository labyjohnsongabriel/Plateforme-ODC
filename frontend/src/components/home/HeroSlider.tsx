// src/app/(public)/components/HeroSlider.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight, ChevronLeft, ChevronRight, Sparkles, Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { getMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';
import type { Formation } from '@/types/formation.types';

const AUTOPLAY_DELAY = 6000;

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { data: formations = [], isError } = useQuery({
    queryKey: ['public', 'formations', 'hero'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Formation[] }>(
        '/public/formations/top',
      );
      return data.data;
    },
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (current >= formations.length) setCurrent(0);
  }, [current, formations.length]);

  useEffect(() => {
    if (isPaused || formations.length < 2) return;
    const timer = window.setTimeout(
      () => setCurrent((index) => (index + 1) % formations.length),
      AUTOPLAY_DELAY,
    );
    return () => window.clearTimeout(timer);
  }, [current, formations.length, isPaused]);

  const formation = formations[current];
  const imageUrl = formation
    ? getMediaUrl(formation.imageCouvertureUrl || formation.imageUrl)
    : undefined;

  const previous = () =>
    setCurrent(
      (index) => (index - 1 + formations.length) % formations.length,
    );
  const next = () =>
    setCurrent((index) => (index + 1) % formations.length);

  return (
    <section
      className="relative flex min-h-[80vh] items-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription={formations.length > 1 ? 'carrousel' : undefined}
      aria-label="Formations mises en avant"
    >
      {/* Image de fond */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
        style={
          imageUrl
            ? {
                backgroundImage: `linear-gradient(90deg, rgba(5,15,35,0.92), rgba(5,15,35,0.40)), url("${imageUrl}")`,
              }
            : {
                backgroundImage:
                  'radial-gradient(circle at 80% 20%, rgba(249,115,22,0.45), transparent 35%), linear-gradient(120deg, #07152e, #172554)',
              }
        }
        aria-hidden
      />

      {/* Overlay orange subtil */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
        aria-hidden
      />

      {/* Contenu */}
      <div className="container-page relative z-10 py-20 text-white md:py-28">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-orange-300" aria-hidden />
            {formation?.domaineRelation?.nom ||
              'Orange Digital Center Madagascar'}
          </div>

          {/* Titre */}
          <h1
            key={formation?.id ?? 'default'}
            className="mb-6 animate-slide-in-up font-display text-4xl font-bold leading-tight md:text-6xl lg:text-7xl"
          >
            {formation?.titre || 'Développez vos compétences numériques'}
          </h1>

          {/* Description */}
          <p className="mb-10 max-w-2xl text-lg text-white/85 md:text-xl">
            {formation?.description ||
              'Découvrez les formations et les prochaines sessions proposées par Orange Digital Center.'}
          </p>

          {isError && (
            <p role="status" className="mb-6 text-sm text-white/75">
              Le catalogue ne peut pas être chargé actuellement.
            </p>
          )}

          {/* CTA */}
          <div className="flex flex-wrap gap-3">
            {formation && (
              <Button variant="odc" size="lg" asChild>
                <Link href={`/formations/${formation.slug}`}>
                  <Play className="mr-2 h-4 w-4" aria-hidden />
                  Découvrir cette formation
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
            >
              <Link href="/formations">Voir toutes les formations</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {formations.length > 1 && (
        <>
          <button
            type="button"
            onClick={previous}
            aria-label="Formation précédente"
            className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 md:left-8"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Formation suivante"
            className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 md:right-8"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>

          {/* Indicateurs */}
          <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {formations.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Afficher ${item.titre}`}
                aria-current={index === current}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  index === current
                    ? 'w-8 bg-orange-400'
                    : 'w-2 bg-white/40 hover:bg-white/60',
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}