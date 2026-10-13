// src/components/shared/DataTable.tsx
'use client';

import * as React from 'react';
import {
  ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from './EmptyState';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

/* ============================================================================
   TYPES
   ============================================================================ */
export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  render?: (row: T, index: number) => React.ReactNode;
  accessor?: (row: T) => any;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  /** Identifiant unique de chaque ligne (par défaut `id`) */
  getRowId?: (row: T) => string;

  // Sélection
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;

  // Tri
  sortKey?: string;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: (key: string, direction: 'asc' | 'desc' | null) => void;

  // Pagination
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
  };

  // États
  emptyState?: {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
  };

  // Événements
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;

  className?: string;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading,
  getRowId = (row) => row.id,
  selectable,
  selectedIds = [],
  onSelectionChange,
  sortKey,
  sortDirection,
  onSort,
  pagination,
  emptyState,
  onRowClick,
  rowClassName,
  className,
}: DataTableProps<T>) {
  const allSelected =
    data.length > 0 && selectedIds.length === data.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < data.length;

  /* -------------------- Sélection -------------------- */
  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) onSelectionChange([]);
    else onSelectionChange(data.map(getRowId));
  };

  const toggleOne = (id: string) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  };

  /* -------------------- Tri -------------------- */
  const handleSort = (key: string) => {
    if (!onSort) return;
    if (sortKey !== key) return onSort(key, 'asc');
    if (sortDirection === 'asc') return onSort(key, 'desc');
    if (sortDirection === 'desc') return onSort(key, null);
    return onSort(key, 'asc');
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-3.5 w-3.5 text-odc-primary" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-3.5 w-3.5 text-odc-primary" />;
    return <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />;
  };

  /* -------------------- Rendu cellule -------------------- */
  const renderCell = (row: T, col: Column<T>, index: number) => {
    if (col.render) return col.render(row, index);
    const value = col.accessor ? col.accessor(row) : row[col.key];
    return value ?? '—';
  };

  /* -------------------- Rendu -------------------- */
  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-lg border border-odc-border bg-odc-surface overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            icon={emptyState?.icon}
            title={emptyState?.title ?? 'Aucune donnée'}
            description={emptyState?.description}
            action={emptyState?.action}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                      onCheckedChange={toggleAll}
                      aria-label="Tout sélectionner"
                    />
                  </TableHead>
                )}
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      col.headerClassName,
                      col.sortable && 'cursor-pointer select-none hover:text-odc-primary',
                    )}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col.label}
                      {col.sortable && getSortIcon(col.key)}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((row, index) => {
                const id = getRowId(row);
                const selected = selectedIds.includes(id);

                return (
                  <TableRow
                    key={id}
                    data-state={selected ? 'selected' : undefined}
                    className={cn(
                      onRowClick && 'cursor-pointer',
                      rowClassName?.(row),
                    )}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selectable && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleOne(id)}
                          aria-label={`Sélectionner la ligne ${index + 1}`}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {renderCell(row, col, index)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* -------------------- Pagination -------------------- */}
      {pagination && pagination.totalPages > 1 && !loading && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-odc-muted">
            Affichage de{' '}
            <strong>
              {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </strong>{' '}
            sur <strong>{pagination.total}</strong>
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page === 1}
              aria-label="Première page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              aria-label="Page précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-odc-muted px-3">
              Page <strong>{pagination.page}</strong> / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              aria-label="Page suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              aria-label="Dernière page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}