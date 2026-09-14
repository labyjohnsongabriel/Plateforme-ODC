import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowKey?: (row: T, index: number) => string | number;
  striped?: boolean;
}

export function Table<T>({
  columns,
  data,
  loading,
  emptyMessage = 'Aucune donnée',
  onRowClick,
  rowKey,
  striped = false,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-odc-text-muted-light dark:text-odc-text-muted-dark">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-odc-primary border-t-transparent rounded-full animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-odc-text-muted-light dark:text-odc-text-muted-dark">
        <div className="text-5xl mb-3">📭</div>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-odc-border-light dark:border-odc-border-dark">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={cn(
                  'px-4 py-3 text-xs font-semibold uppercase tracking-wider',
                  'text-odc-text-muted-light dark:text-odc-text-muted-dark',
                  alignments[col.align || 'left'],
                  col.headerClassName
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={rowKey ? rowKey(row, i) : (row as any).id || i}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'border-b border-odc-border-light dark:border-odc-border-dark last:border-0 transition-colors',
                striped && i % 2 === 1 && 'bg-odc-surface-alt-light/50 dark:bg-odc-surface-alt-dark/30',
                onRowClick && 'cursor-pointer hover:bg-odc-surface-alt-light dark:hover:bg-odc-surface-alt-dark'
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-sm',
                    'text-odc-text-light dark:text-odc-text-dark',
                    alignments[col.align || 'left'],
                    col.className
                  )}
                >
                  {col.render ? col.render(row, i) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}