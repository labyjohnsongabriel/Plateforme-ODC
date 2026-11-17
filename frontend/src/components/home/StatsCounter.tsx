// src/app/(public)/components/StatsCounter.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, CalendarDays, Users, Award } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

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

function AnimatedCounter({ target, duration = 1800 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let frame: number;
    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
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
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public', 'home', 'counts'],
    queryFn: async () => {
      const [formationsRes, sessionsRes] = await Promise.all([
        api.get<{ pagination: { total: number } }>('/public/formations', { params: { page: 1, limit: 1 } }),
        api.get<{ pagination: { total: number } }>('/public/sessions', { params: { page: 1, limit: 1 } }),
      ]);
      return [
        { value: formationsRes.data.pagination.total, label: 'Formations publiées', icon: BookOpen },
        { value: sessionsRes.data.pagination.total, label: 'Sessions disponibles', icon: CalendarDays },
        { value: 500, label: 'Apprenants formés', icon: Users },
        { value: 350, label: 'Attestations délivrées', icon: Award },
      ];
    },
    staleTime: 5 * 60_000,
  });
  const stats = data ?? [];

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-br from-odc-500 to-odc-700 py-20 text-white md:py-28"
      aria-label="Chiffres clés"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.15),transparent_50%)]" />

      <div className="container-page relative">
        <div className="mb-14 text-center">
          <h2 className="mb-3 font-display text-3xl font-bold md:text-5xl">L'ODC en chiffres</h2>
          <p className="mx-auto max-w-2xl text-lg text-white/85">
            Des résultats concrets, une communauté grandissante, un impact réel.
          </p>
        </div>

        {isError && (
          <p className="mb-6 text-center text-sm text-white/80">
            Les indicateurs sont momentanément indisponibles.
          </p>
        )}

        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={cn(
                  'rounded-2xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-sm transition-all',
                  inView ? 'animate-slide-in-up' : 'opacity-0',
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="mb-2 font-display text-3xl font-bold md:text-4xl">
                  {isLoading ? (
                    <span className="text-2xl text-white/70">…</span>
                  ) : inView ? (
                    <AnimatedCounter target={stat.value} />
                  ) : (
                    <span className="opacity-0">0</span>
                  )}
                </div>
                <p className="text-xs text-white/85 md:text-sm">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}