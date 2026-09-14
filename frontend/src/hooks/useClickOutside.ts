import { useEffect, useRef, RefObject } from 'react';

// ============================================================================
//  USE CLICK OUTSIDE
// ============================================================================

type Handler = (event: MouseEvent | TouchEvent) => void;

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: Handler,
  options: {
    enabled?: boolean;
    events?: Array<'mousedown' | 'mouseup' | 'click' | 'touchstart' | 'touchend'>;
    excludeRefs?: RefObject<HTMLElement>[];
  } = {}
): RefObject<T> {
  const { enabled = true, events = ['mousedown', 'touchstart'], excludeRefs = [] } = options;
  const ref = useRef<T>(null);
  const handlerRef = useRef(handler);

  // Toujours avoir la dernière handler
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) return;

      // Vérifier les refs exclus
      const isExcluded = excludeRefs.some((excludeRef) => {
        const excludeEl = excludeRef.current;
        return excludeEl && excludeEl.contains(event.target as Node);
      });

      if (isExcluded) return;

      handlerRef.current(event);
    };

    events.forEach((eventName) => {
      document.addEventListener(eventName, listener as EventListener);
    });

    return () => {
      events.forEach((eventName) => {
        document.removeEventListener(eventName, listener as EventListener);
      });
    };
  }, [enabled, events, excludeRefs]);

  return ref;
}

// ============================================================================
//  USE CLICK OUTSIDE MULTIPLE
// ============================================================================

export function useClickOutsideMultiple<T extends HTMLElement = HTMLElement>(
  handler: Handler,
  enabled = true
) {
  const refs = useRef<Array<RefObject<T>>>([]);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const clickedInside = refs.current.some((ref) => {
        const el = ref.current;
        return el && el.contains(event.target as Node);
      });

      if (!clickedInside) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [enabled, handler]);

  const registerRef = (ref: RefObject<T>) => {
    if (!refs.current.includes(ref)) {
      refs.current.push(ref);
    }
  };

  return { registerRef };
}

// ============================================================================
//  USE ESCAPE KEY
// ============================================================================

export function useEscapeKey(handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handler();
      }
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [handler, enabled]);
}

// ============================================================================
//  USE ENTER KEY
// ============================================================================

export function useEnterKey(handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        handler();
      }
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [handler, enabled]);
}

// ============================================================================
//  USE KEY PRESS
// ============================================================================

export function useKeyPress(
  targetKey: string | string[],
  handler: () => void,
  options: { enabled?: boolean; ctrl?: boolean; shift?: boolean; alt?: boolean } = {}
) {
  const { enabled = true, ctrl = false, shift = false, alt = false } = options;

  useEffect(() => {
    if (!enabled) return;

    const keys = Array.isArray(targetKey) ? targetKey : [targetKey];

    const listener = (event: KeyboardEvent) => {
      const keyMatches = keys.some(
        (k) => event.key.toLowerCase() === k.toLowerCase() || event.code === k
      );

      if (!keyMatches) return;
      if (ctrl && !event.ctrlKey) return;
      if (shift && !event.shiftKey) return;
      if (alt && !event.altKey) return;

      event.preventDefault();
      handler();
    };

    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [targetKey, handler, enabled, ctrl, shift, alt]);
}

export default useClickOutside;