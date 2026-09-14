import { lazy, ComponentType } from 'react';

// ============================================================================
//  LAZY LOADING AVEC SUSPENSE
// ============================================================================

/**
 * Créer un composant lazy avec un délai minimum pour éviter les flashs
 */
export function lazyWithDelay<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  delay = 300
): React.LazyExoticComponent<T> {
  return lazy(() =>
    Promise.all([
      importFn(),
      new Promise((resolve) => setTimeout(resolve, delay)),
    ]).then(([module]) => module)
  );
}

/**
 * Lazy avec retry en cas d'échec (utile si le chunk fail)
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  maxRetries = 3
): React.LazyExoticComponent<T> {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      let attempts = 0;

      const tryImport = () => {
        importFn()
          .then(resolve)
          .catch((error) => {
            attempts++;
            if (attempts < maxRetries) {
              setTimeout(tryImport, 1000 * attempts);
            } else {
              reject(error);
            }
          });
      };

      tryImport();
    });
  });
}

// ============================================================================
//  PRELOAD HELPERS
// ============================================================================

const preloadedModules = new Set<string>();

/**
 * Précharger un composant lazy
 */
export function preloadComponent(key: string, importFn: () => Promise<any>): void {
  if (preloadedModules.has(key)) return;

  preloadedModules.add(key);
  importFn().catch(() => {
    preloadedModules.delete(key);
  });
}

/**
 * Précharger plusieurs composants
 */
export function preloadComponents(components: Array<{ key: string; importFn: () => Promise<any> }>): void {
  components.forEach(({ key, importFn }) => preloadComponent(key, importFn));
}

// ============================================================================
//  ROUTE PREFETCHING
// ============================================================================

/**
 * Précharger une route au survol d'un lien
 */
export function prefetchOnHover(importFn: () => Promise<any>) {
  return {
    onMouseEnter: () => importFn().catch(() => {}),
    onFocus: () => importFn().catch(() => {}),
  };
}

export default {
  lazyWithDelay,
  lazyWithRetry,
  preloadComponent,
  preloadComponents,
  prefetchOnHover,
};