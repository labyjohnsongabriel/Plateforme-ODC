// src/hooks/useDataTable.ts
'use client';

import { useMemo, useState, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface UseDataTableOptions<T> {
  data: T[];
  initialSort?: { key: keyof T; direction: SortDirection };
  initialPage?: number;
  initialLimit?: number;
  searchFields?: (keyof T)[];
}

export interface UseDataTableReturn<T> {
  // Données affichées
  rows: T[];
  total: number;
  filteredTotal: number;

  // Recherche
  search: string;
  setSearch: (value: string) => void;

  // Tri
  sortKey: keyof T | null;
  sortDirection: SortDirection;
  toggleSort: (key: keyof T) => void;

  // Pagination
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  totalPages: number;

  // Sélection
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  toggleAllSelection: () => void;
  clearSelection: () => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;

  // Reset
  resetFilters: () => void;

  // Helpers
  getRowId: (row: T) => string;
}

export function useDataTable<T extends Record<string, any>>({
  data,
  initialSort,
  initialPage = 1,
  initialLimit = 10,
  searchFields = [],
}: UseDataTableOptions<T>): UseDataTableReturn<T> {
  const [search, setSearchState] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(
    initialSort?.key ?? null,
  );
  const [sortDir, setSortDir] = useState<SortDirection>(
    initialSort?.direction ?? null,
  );
  const [page, setPage] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const getRowId = useCallback((row: T) => row.id as string, []);

  /* -------------------- Filtre -------------------- */
  const filtered = useMemo(() => {
    if (!search.trim() || !searchFields.length) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      searchFields.some((field) => {
        const val = row[field];
        return String(val ?? '').toLowerCase().includes(q);
      }),
    );
  }, [data, search, searchFields]);

  /* -------------------- Tri -------------------- */
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];

      if (va == null) return 1;
      if (vb == null) return -1;

      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }

      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb), 'fr')
        : String(vb).localeCompare(String(va), 'fr');
    });
  }, [filtered, sortKey, sortDir]);

  /* -------------------- Pagination -------------------- */
  const total = data.length;
  const filteredTotal = sorted.length;
  const totalPages = Math.max(1, Math.ceil(filteredTotal / limit));

  const rows = useMemo(() => {
    const start = (page - 1) * limit;
    return sorted.slice(start, start + limit);
  }, [sorted, page, limit]);

  /* -------------------- Actions -------------------- */
  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const toggleSort = useCallback(
    (key: keyof T) => {
      if (sortKey !== key) {
        setSortKey(key);
        setSortDir('asc');
      } else if (sortDir === 'asc') {
        setSortDir('desc');
      } else if (sortDir === 'desc') {
        setSortDir(null);
        setSortKey(null);
      } else {
        setSortDir('asc');
      }
    },
    [sortKey, sortDir],
  );

  const setLimit = useCallback((l: number) => {
    setLimitState(l);
    setPage(1);
  }, []);

  const toggleSelection = useCallback(
    (id: string) => {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    },
    [],
  );

  const toggleAllSelection = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === rows.length ? [] : rows.map(getRowId),
    );
  }, [rows, getRowId]);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const isAllSelected = rows.length > 0 && selectedIds.length === rows.length;
  const isSomeSelected =
    selectedIds.length > 0 && selectedIds.length < rows.length;

  const resetFilters = useCallback(() => {
    setSearchState('');
    setSortKey(null);
    setSortDir(null);
    setPage(1);
    setSelectedIds([]);
  }, []);

  return {
    rows,
    total,
    filteredTotal,
    search,
    setSearch,
    sortKey,
    sortDirection: sortDir,
    toggleSort,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    selectedIds,
    setSelectedIds,
    toggleSelection,
    toggleAllSelection,
    clearSelection,
    isAllSelected,
    isSomeSelected,
    resetFilters,
    getRowId,
  };
}