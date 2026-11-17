// src/app/(formateur)/formateur/dashboard/components/WelcomeHeader.tsx
'use client';

import { useEffect, useState } from 'react';
import { Sun } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function WelcomeHeader() {
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const prenom = (user?.prenom ?? '').trim();
  const nom = (user?.nom ?? '').trim();
  const hasName = prenom.length > 0 || nom.length > 0;

  const initials = [prenom[0], nom[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase();

  return (
    <header className="relative overflow-hidden rounded-2xl border border-odc-border bg-gradient-to-br from-white via-white to-odc-surface-alt px-6 py-6 shadow-sm md:px-8 md:py-7 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      {/* Blob décoratif */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-odc-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-odc-primary/5 blur-3xl"
      />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        {/* ═══════════ GAUCHE : TITRE + NOM ═══════════ */}
        <div className="min-w-0 flex-1">
          <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-odc-text-muted">
            <Sun className="h-3.5 w-3.5 text-amber-500" aria-hidden />
            Tableau de bord formateur
          </p>

          <h1 className="font-display text-2xl font-bold leading-tight text-odc-text-primary md:text-3xl lg:text-4xl">
            <span className="text-odc-text-muted/70">Bonjour</span>

            {mounted && hasName && (
              <>
                {' '}
                <span className="name-wrapper">
                  {prenom && (
                    <span className="name-word name-word-prenom">
                      {prenom}
                    </span>
                  )}
                  {prenom && nom && ' '}
                  {nom && (
                    <span className="name-word name-word-nom">{nom}</span>
                  )}
                </span>
              </>
            )}

            <span
              className="ml-1.5 inline-block animate-wave"
              role="img"
              aria-label="salutation"
            >
              👋
            </span>
          </h1>

          <p className="mt-2 text-sm text-odc-text-muted">
            {mounted && hasName
              ? 'Ravi de vous revoir ! Voici un aperçu de votre activité.'
              : 'Bienvenue dans votre espace formateur.'}
          </p>
        </div>

        {/* ═══════════ DROITE : CARTE UTILISATEUR ═══════════ */}
        {mounted && hasName && (
          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-odc-border bg-white/70 px-4 py-3 backdrop-blur-sm dark:bg-slate-900/70">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-odc-500 to-odc-700 text-sm font-bold text-white shadow-md ring-2 ring-white dark:ring-slate-900"
              aria-hidden
            >
              {initials}
            </div>

            <div className="hidden min-w-0 md:block">
              <p className="text-[10px] font-medium uppercase tracking-wider text-odc-text-muted">
                Connecté en tant que
              </p>
              <p className="truncate text-sm font-semibold text-odc-text-primary">
                {[prenom, nom].filter(Boolean).join(' ')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ STYLES ═══════════ */}
      <style jsx>{`
        .name-wrapper {
          display: inline;
          white-space: nowrap;
        }

        .name-word {
          display: inline-block;
          opacity: 0;
          transform: translateY(8px);
          filter: blur(6px);
          animation: name-reveal 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .name-word-prenom {
          background: linear-gradient(
            135deg,
            #ff7900 0%,
            #e65100 60%,
            #ffb74d 100%
          );
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation-delay: 150ms;
          animation-name: name-reveal, gradient-shift;
          animation-duration: 700ms, 4s;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1), ease;
          animation-iteration-count: 1, infinite;
        }

        .name-word-nom {
          background: linear-gradient(
            135deg,
            #1a1a1a 0%,
            #4a4a4a 60%,
            #1a1a1a 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation-delay: 320ms;
        }

        @keyframes name-reveal {
          0% {
            opacity: 0;
            transform: translateY(8px);
            filter: blur(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes wave {
          0% {
            transform: rotate(0deg);
          }
          10% {
            transform: rotate(14deg);
          }
          20% {
            transform: rotate(-8deg);
          }
          30% {
            transform: rotate(14deg);
          }
          40% {
            transform: rotate(-4deg);
          }
          50% {
            transform: rotate(10deg);
          }
          60% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        .animate-wave {
          display: inline-block;
          transform-origin: 70% 70%;
          animation: wave 1.5s ease-in-out 800ms 1;
        }

        @media (prefers-reduced-motion: reduce) {
          .name-word {
            opacity: 1;
            transform: none;
            filter: none;
            animation: none;
            color: inherit;
            background: none;
            -webkit-background-clip: unset;
            background-clip: unset;
          }
          .animate-wave {
            animation: none;
          }
        }
      `}</style>
    </header>
  );
}