'use client';

import { cn } from '@/lib/utils';

interface LegendEntry {
  value?: string | number;
  color?: string;
  dataKey?: string | number;
}

export interface ChartLegendProps {
  /** Injecté par Recharts */
  payload?: LegendEntry[];
  align?: 'left' | 'center' | 'right';
  orientation?: 'horizontal' | 'vertical';
  indicator?: 'dot' | 'square' | 'line';
  className?: string;
}

const ALIGN = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const;

export function ChartLegend({
  payload,
  align = 'center',
  orientation = 'horizontal',
  indicator = 'square',
  className,
}: ChartLegendProps) {
  if (!payload?.length) return null;

  const shape =
    indicator === 'dot'
      ? 'h-2 w-2 rounded-full'
      : indicator === 'square'
        ? 'h-2.5 w-2.5 rounded-sm'
        : 'h-0.5 w-3';

  return (
    <ul
      className={cn(
        'flex pt-3 text-xs text-muted-foreground',
        orientation === 'horizontal'
          ? 'flex-row flex-wrap items-center gap-x-5 gap-y-1.5'
          : 'flex-col gap-1.5',
        ALIGN[align],
        className,
      )}
    >
      {payload.map((entry, index) => (
        <li
          key={`${String(entry.dataKey ?? entry.value)}-${index}`}
          className="flex items-center gap-1.5"
        >
          <span
            className={cn('inline-block shrink-0 ring-2 ring-background', shape)}
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}