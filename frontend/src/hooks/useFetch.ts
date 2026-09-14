import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
//  TYPES
// ============================================================================

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFetchOptions {
  immediate?: boolean;
  initialData?: any;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  retryCount?: number;
  retryDelay?: number;
}

interface UseFetchReturn<T> extends UseFetchState<T> {
  refetch: () => Promise<void>;
  setData: (data: T) => void;
  reset: () => void;
}

// ============================================================================
//  HOOK PRINCIPAL
// ============================================================================

export function useFetch<T = any>(
  fetcher: () => Promise<T>,
  deps: any[] = [],
  options: UseFetchOptions = {}
): UseFetchReturn<T> {
  const {
    immediate = true,
    initialData = null,
    onSuccess,
    onError,
    retryCount = 0,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<UseFetchState<T>>({
    data: (initialData as T) || null,
    loading: immediate,
    error: null,
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ========================================================================
  // Fetch function
  // ========================================================================
  const executeFetch = useCallback(async () => {
    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (!isMountedRef.current) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= retryCount) {
      try {
        const result = await fetcher();

        if (!isMountedRef.current) return;

        setState({ data: result, loading: false, error: null });
        onSuccess?.(result);
        return;
      } catch (err: any) {
        lastError = err;

        if (attempt < retryCount) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          attempt++;
        } else {
          break;
        }
      }
    }

    if (!isMountedRef.current) return;

    const errorMessage =
      lastError?.response?.data?.message ||
      (lastError as any)?.message ||
      'Une erreur est survenue';

    setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
    onError?.(errorMessage);
  }, [...deps, refreshKey]);

  // ========================================================================
  // Effects
  // ========================================================================
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (immediate) {
      executeFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executeFetch]);

  // ========================================================================
  // Actions
  // ========================================================================
  const refetch = useCallback(async () => {
    setRefreshKey((k) => k + 1);
  }, []);

  const setData = useCallback((data: T) => {
    setState({ data, loading: false, error: null });
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    refetch,
    setData,
    reset,
  };
}

export default useFetch;