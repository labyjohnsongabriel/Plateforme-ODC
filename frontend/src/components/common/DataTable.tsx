import { ReactNode, useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Table, Column } from './Table';
import { Pagination } from './Pagination';
import { cn } from '@/utils/cn';

export interface DataTableColumn<T> extends Omit<Column<T>, 'render'> {
  sortable?: boolean;
  render?: (row: T, index: number) => ReactNode;
  sortKey?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowKey?: (row: T, index: number) => string | number;
  // Pagination
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  // Tri
  onSort?: (column: string, direction: 'ASC' | 'DESC') => void;
  striped?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  emptyMessage,
  onRowClick,
  rowKey,
  pagination,
  onSort,
  striped,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

  const handleSort = (col: DataTableColumn<T>) => {
    if (!col.sortable) return;

    const newDirection: 'ASC' | 'DESC' =
      sortColumn === col.key && sortDirection === 'ASC' ? 'DESC' : 'ASC';

    setSortColumn(col.key);
    setSortDirection(newDirection);
    onSort?.(col.sortKey || col.key, newDirection);
  };

  const tableColumns: Column<T>[] = columns.map((col) => ({
    key: col.key,
    label: col.label,
    width: col.width,
    align: col.align,
    className: col.className,
    headerClassName: cn(
      col.headerClassName,
      col.sortable && 'cursor-pointer hover:text-odc-primary select-none'
    ),
    render: (row, i) => {
      if (col.render) return col.render(row, i);
      return (
        <div className="flex items-center gap-1">
          <span>{(row as any)[col.key]}</span>
          {col.sortable && sortColumn === col.key && (
            <span className="text-odc-primary">
              {sortDirection === 'ASC' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </span>
          )}
        </div>
      );
    },
  }));

  return (
    <div>
      <Table
        columns={tableColumns}
        data={data}
        loading={loading}
        emptyMessage={emptyMessage}
        onRowClick={onRowClick}
        rowKey={rowKey}
        striped={striped}
      />

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-4 px-2">
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
            Page {pagination.currentPage} sur {pagination.totalPages} • {pagination.total} résultats
          </p>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}