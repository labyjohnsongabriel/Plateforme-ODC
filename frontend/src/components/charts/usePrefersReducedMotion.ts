'use client';

import { useEffect, useState } from 'react';

/**
 * Retourne true si l'utilisateur a demandé de réduire les animations.
 * Fichier local au dossier charts : aucun conflit avec un autre hook du projet.
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