'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Loading() {
  const [dots, setDots] = useState('');

  // Animation des points de suspension
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Chargement de la page"
      className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-odc-background px-4"
    >
      {/* ═══════════════════════════════════════════════════════════════════
          DÉCORATIONS DE FOND
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* Halos animés */}
        <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] animate-pulse-soft rounded-full bg-odc-primary/8 blur-3xl" />
        <div
          className="absolute -bottom-32 -right-32 h-[28rem] w-[28rem] animate-pulse-soft rounded-full bg-odc-primary/8 blur-3xl"
          style={{ animationDelay: '1.2s' }}
        />

        {/* Grille subtile */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #FF7900 1px, transparent 1px), linear-gradient(to bottom, #FF7900 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Particules flottantes */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 animate-float rounded-full bg-odc-primary/40"
            style={{
              left: `${10 + i * 11}%`,
              top: `${15 + (i % 4) * 20}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${2.5 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          CONTENU CENTRAL
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo animé */}
        <div className="animate-scale-in">
          <LogoLoader />
        </div>

        {/* Nom de la marque */}
        <div className="animate-fade-in flex flex-col items-center gap-1.5 text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-odc-text-primary sm:text-3xl">
            Orange Digital Center
          </h1>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-odc-text-muted">
            Madagascar
          </p>
        </div>

        {/* Spinner premium */}
        <SpinnerPremium />

        {/* Texte + barre de progression */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm font-medium text-odc-text-secondary">
            Chargement{dots}
          </p>

          {/* Barre de progression indéterminée */}
          <div className="relative h-1 w-64 overflow-hidden rounded-full bg-odc-surface-alt">
            {/* Fond dégradé */}
            <div className="absolute inset-0 bg-gradient-to-r from-odc-primary/0 via-odc-primary/15 to-odc-primary/0" />

            {/* Barre mobile */}
            <div className="absolute inset-y-0 left-0 w-1/3 animate-progress-indeterminate rounded-full bg-gradient-to-r from-odc-400 via-odc-500 to-odc-700 shadow-odc-primary-sm" />
          </div>
        </div>

        {/* Message contextuel */}
        <p className="animate-fade-in max-w-xs text-center text-xs text-odc-text-muted">
          Préparation de votre espace personnel…
        </p>
      </div>

      {/* Accessibilité */}
      <span className="sr-only">
        Veuillez patienter pendant le chargement de la page.
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOGO LOADER — Logo local avec anneaux animés
   ═══════════════════════════════════════════════════════════════════════════ */

function LogoLoader() {
  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      {/* Ripple 1 */}
      <div
        className="absolute inset-0 animate-ripple rounded-full border-2 border-odc-primary/40"
        style={{ animationDelay: '0s' }}
        aria-hidden
      />
      {/* Ripple 2 */}
      <div
        className="absolute inset-0 animate-ripple rounded-full border-2 border-odc-primary/30"
        style={{ animationDelay: '0.5s' }}
        aria-hidden
      />
      {/* Ripple 3 */}
      <div
        className="absolute inset-0 animate-ripple rounded-full border-2 border-odc-primary/20"
        style={{ animationDelay: '1s' }}
        aria-hidden
      />

      {/* Anneau rotatif externe (SVG dégradé) */}
      <svg
        className="absolute inset-0 animate-spin-slow"
        viewBox="0 0 128 128"
        fill="none"
        aria-hidden
      >
        <circle
          cx="64"
          cy="64"
          r="60"
          stroke="url(#gradient-ring-1)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="100 280"
        />
        <defs>
          <linearGradient id="gradient-ring-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7900" stopOpacity="0" />
            <stop offset="50%" stopColor="#FF7900" stopOpacity="1" />
            <stop offset="100%" stopColor="#FF7900" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Anneau rotatif inverse interne */}
      <svg
        className="absolute inset-2 animate-spin-reverse"
        viewBox="0 0 112 112"
        fill="none"
        aria-hidden
      >
        <circle
          cx="56"
          cy="56"
          r="52"
          stroke="url(#gradient-ring-2)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="60 240"
        />
        <defs>
          <linearGradient id="gradient-ring-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EA6A00" stopOpacity="0" />
            <stop offset="50%" stopColor="#EA6A00" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#EA6A00" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Halo central pulsant */}
      <div className="absolute inset-4 animate-pulse-soft rounded-full bg-odc-primary/15 blur-xl" aria-hidden />

      {/* Logo local */}
      <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-odc-lg ring-1 ring-odc-border/60">
        <Image
          src="/images/brand/logo-odc.png"
          alt="Orange Digital Center Madagascar"
          width={80}
          height={80}
          priority
          className="h-full w-full object-contain p-2"
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SPINNER PREMIUM — Anneaux concentriques
   ═══════════════════════════════════════════════════════════════════════════ */

function SpinnerPremium() {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center" aria-hidden>
      {/* Anneau externe statique */}
      <div className="absolute inset-0 rounded-full border-2 border-odc-border/50" />

      {/* Anneau rotatif 1 */}
      <div
        className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-odc-primary border-r-odc-primary/60"
        style={{ animationDuration: '1s' }}
      />

      {/* Anneau rotatif 2 (inverse, plus petit) */}
      <div
        className="absolute inset-2 animate-spin-reverse rounded-full border-2 border-transparent border-b-odc-600 border-l-odc-600/60"
        style={{ animationDuration: '1.4s' }}
      />

      {/* Halo pulsant */}
      <div className="absolute inset-3 animate-pulse-soft rounded-full bg-odc-primary/10" />

      {/* Point central */}
      <div className="relative h-2.5 w-2.5 rounded-full bg-odc-primary shadow-odc-primary-md" />
    </div>
  );
}