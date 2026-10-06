'use client';

import { useEffect, useRef, useState } from 'react';
import { Users, BookOpen, Award, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ============================================================================
   STATS
   ============================================================================ */
const STATS = [
  {
    value: 10000,
    suffix: '+',
    label: 'Bénéficiaires formés',
    icon: Users,
  },
  {
    value: 120,
    suffix: '+',
    label: 'Formations au catalogue',
    icon: BookOpen,
  },
  {
    value: 8500,
    suffix: '+',
    label: 'Attestations délivrées',
    icon: Award,
  },
  {
    value: 45,
    suffix: '+',
    label: 'Partenaires actifs',
    icon: Building2,
  },
] as const;

/* ============================================================================
   HOOK — Détecte l'entrée dans le viewport
   ============================================================================ */
function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, ...options },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}

/* ============================================================================
   COMPTEUR ANIMÉ
   ============================================================================ */
function AnimatedCounter({ target, duration = 1800 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let frame: number;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return <>{count.toLocaleString('fr-FR')}</>;
}

export function StatsCounter() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section
      ref={ref}
      className="relative py-20 md:py-28 bg-gradient-to-br from-odc-500 to-odc-700 text-white overflow-hidden"
      aria-label="Chiffres clés"
    >
      {/* Décoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.15),transparent_50%)]" />

      <div className="container-page relative">
        {/* En-tête */}
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-3">
            L&apos;ODC en chiffres
          </h2>
          <p className="text-white/85 text-lg max-w-2xl mx-auto">
            Des résultats concrets, une communauté grandissante, un impact réel.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={cn(
                  'text-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-6 md:p-8 transition-all',
                  inView ? 'animate-slide-in-up' : 'opacity-0',
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-7 w-7 text-white" />
                </div>

                <div className="font-display text-4xl md:text-5xl font-bold mb-2">
                  {inView ? (
                    <>
                      <AnimatedCounter target={stat.value} />
                      <span className="text-odc-200">{stat.suffix}</span>
                    </>
                  ) : (
                    <span className="opacity-0">0</span>
                  )}
                </div>

                <p className="text-white/85 text-sm md:text-base">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}