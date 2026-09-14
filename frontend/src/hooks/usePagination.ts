import { useCallback, useMemo, useState } from 'react';

// ============================================================================
//  TYPES
// ============================================================================

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  maxLimit?: number;
  totalItems?: number;
}

interface UsePaginationReturn {
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  skip: number;
  offset: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  reset: () => void;
  goToPage: (page: number) => void;
}

// ============================================================================
//  USE PAGINATION
// ============================================================================

export function usePagination(
  options: UsePaginationOptions = {}
): UsePaginationReturn {
  const {
    initialPage = 1,
    initialLimit = 10,
    maxLimit = 100,
    totalItems = 0,
  } = options;

  const [page, setPage] = useState(Math.max(1, initialPage));
  const [limit, setLimitState] = useState(
    Math.min(maxLimit, Math.max(1, initialLimit))
  );

  // ========================================================================
  // Computed
  // ========================================================================
  const totalPages = useMemo(
    () => (totalItems > 0 ? Math.ceil(totalItems / limit) : 0),
    [totalItems, limit]
  );

  const hasNext = useMemo(
    () => (totalPages > 0 ? page < totalPages : false),
    [page, totalPages]
  );

  const hasPrev = useMemo(() => page > 1, [page]);

  const skip = useMemo(() => (page - 1) * limit, [page, limit]);

  const offset = skip;

  // ========================================================================
  // Actions
  // ========================================================================
  const setPageSafe = useCallback(
    (newPage: number) => {
      const safePage = Math.max(1, newPage);
      setPage(totalPages > 0 ? Math.min(safePage, totalPages) : safePage);
    },
    [totalPages]
  );

  const setLimit = useCallback(
    (newLimit: number) => {
      const safeLimit = Math.min(maxLimit, Math.max(1, newLimit));
      setLimitState(safeLimit);
      setPage(1); // Reset à la première page
    },
    [maxLimit]
  );

  const nextPage = useCallback(() => {
    if (hasNext) setPage((p) => p + 1);
  }, [hasNext]);

  const prevPage = useCallback(() => {
    if (hasPrev) setPage((p) => p - 1);
  }, [hasPrev]);

  const firstPage = useCallback(() => setPage(1), []);

  const lastPage = useCallback(() => {
    if (totalPages > 0) setPage(totalPages);
  }, [totalPages]);

  const reset = useCallback(() => {
    setPage(1);
    setLimitState(initialLimit);
  }, [initialLimit]);

  return {
    page,
    limit,
    totalPages,
    hasNext,
    hasPrev,
    skip,
    offset,
    setPage: setPageSafe,
    setLimit,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    reset,
    goToPage: setPageSafe,
  };
}

// ============================================================================
//  USE PAGINATED DATA
// ============================================================================

interface UsePaginatedDataOptions<T> {
  fetcher: (params: { page: number; limit: number }) => Promise<{
    data: T[];
    pagination: { total: number };
  }>;
  initialLimit?: number;
  immediate?: boolean;
}

export function usePaginatedData<T = any>(options: UsePaginatedDataOptions<T>) {
  const { fetcher, initialLimit = 10, immediate = true } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  const pagination = usePagination({ initialLimit, totalItems });

  const load = useCallback(
    async (page?: number, limit?: number) => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetcher({
          page: page ?? pagination.page,
          limit: limit ?? pagination.limit,
        });

        setData(result.data);
        setTotalItems(result.pagination.total);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    },
    [fetcher, pagination.page, pagination.limit]
  );

  return {
    data,
    loading,
    error,
    totalItems,
    ...pagination,
    load,
    refetch: () => load(),
  };
}

export default usePagination;