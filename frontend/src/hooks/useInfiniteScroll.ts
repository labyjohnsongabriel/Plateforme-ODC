import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
//  TYPES
// ============================================================================

interface UseInfiniteScrollOptions<T> {
  fetchFn: (page: number) => Promise<{ data: T[]; hasMore: boolean }>;
  initialPage?: number;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
  onError?: (error: any) => void;
}

interface UseInfiniteScrollReturn<T> {
  data: T[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  loadMore: () => void;
  refresh: () => void;
  reset: () => void;
  sentinelRef: (node: HTMLElement | null) => void;
}

// ============================================================================
//  USE INFINITE SCROLL
// ============================================================================

export function useInfiniteScroll<T = any>(
  options: UseInfiniteScrollOptions<T>
): UseInfiniteScrollReturn<T> {
  const {
    fetchFn,
    initialPage = 1,
    threshold = 100,
    rootMargin = '100px',
    enabled = true,
    onError,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);

  const sentinelRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);

  // ========================================================================
  // Load data
  // ========================================================================
  const loadData = useCallback(
    async (targetPage: number, append = false) => {
      if (loadingRef.current) return;

      loadingRef.current = true;

      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        setError(null);

        const result = await fetchFn(targetPage);

        if (append) {
          setData((prev) => [...prev, ...result.data]);
        } else {
          setData(result.data);
        }

        setHasMore(result.hasMore);
        setPage(targetPage);
      } catch (err: any) {
        const message = err.response?.data?.message || 'Erreur de chargement';
        setError(message);
        onError?.(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        loadingRef.current = false;
      }
    },
    [fetchFn, onError]
  );

  // ========================================================================
  // Initial load
  // ========================================================================
  useEffect(() => {
    if (enabled) {
      loadData(initialPage, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // ========================================================================
  // Intersection Observer
  // ========================================================================
  useEffect(() => {
    if (!enabled || !hasMore || loadingRef.current) return;

    const currentSentinel = sentinelRef.current;
    if (!currentSentinel) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loadingRef.current) {
        loadData(page + 1, true);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold: 0,
    });

    observerRef.current.observe(currentSentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, hasMore, page, loadData, rootMargin]);

  // ========================================================================
  // Actions
  // ========================================================================
  const loadMore = useCallback(() => {
    if (!hasMore || loadingRef.current) return;
    loadData(page + 1, true);
  }, [hasMore, page, loadData]);

  const refresh = useCallback(() => {
    setData([]);
    setHasMore(true);
    setPage(initialPage);
    loadData(initialPage, false);
  }, [initialPage, loadData]);

  const reset = useCallback(() => {
    setData([]);
    setHasMore(true);
    setPage(initialPage);
    setError(null);
  }, [initialPage]);

  const setSentinelRef = useCallback((node: HTMLElement | null) => {
    sentinelRef.current = node;
  }, []);

  return {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    page,
    loadMore,
    refresh,
    reset,
    sentinelRef: setSentinelRef,
  };
}

// ============================================================================
//  USE SCROLL POSITION
// ============================================================================

export function useScrollPosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = () => {
      setPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    handler();
    window.addEventListener('scroll', handler, { passive: true });

    return () => window.removeEventListener('scroll', handler);
  }, []);

  return position;
}

// ============================================================================
//  USE SCROLL DIRECTION
// ============================================================================

export function useScrollDirection() {
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handler = () => {
      const scrollY = window.scrollY;
      if (scrollY > lastScrollY.current + 10) {
        setDirection('down');
      } else if (scrollY < lastScrollY.current - 10) {
        setDirection('up');
      }
      lastScrollY.current = scrollY;
    };

    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return direction;
}

export default useInfiniteScroll;