'use client';

import { useEffect, useState } from 'react';

/**
 * Retourne true si l'utilisateur a demandé de réduire les animations.
 * Sert à désactiver les animations JS de Recharts (le CSS est déjà géré
 * par @media (prefers-reduced-motion) dans globals.css).
 *
 * Fichier volontairement local au dossier charts : aucun conflit possible
 * avec un hook du même nom ailleurs dans le projet.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();

    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}

export default usePrefersReducedMotion;