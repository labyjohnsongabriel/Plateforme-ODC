// src/components/charts/ChartLegend.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface ChartLegendProps {
  /** Props Recharts injectées automatiquement */
  payload?: Array<{
    value?: string;
    color?: string;
    dataKey?: string;
    type?: string;
  }>;

  /** Alignement */
  align?: 'left' | 'center' | 'right';
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Type d'indicateur */
  indicator?: 'dot' | 'square' | 'line';
  /** Classe CSS personnalisée */
  className?: string;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function ChartLegend({
  payload,
  align = 'center',
  orientation = 'horizontal',
  indicator = 'dot',
  className,
}: ChartLegendProps) {
  if (!payload || payload.length === 0) return null;

  const alignClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[align];

  const orientationClass =
    orientation === 'horizontal' ? 'flex-row flex-wrap gap-x-4 gap-y-1' : 'flex-col gap-1.5';

  return (
    <ul
      className={cn(
        'flex items-center text-xs',
        orientationClass,
        alignClass,
        className,
      )}
    >
      {payload.map((entry, index) => (
        <li
          key={`legend-${index}`}
          className="flex items-center gap-1.5 text-odc-muted"
        >
          <Indicator type={indicator} color={entry.color} />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}

/* ============================================================================
   INDICATEUR
   ============================================================================ */

function Indicator({
  type,
  color,
}: {
  type: 'dot' | 'square' | 'line';
  color?: string;
}) {
  const baseColor = color ?? '#FF7900';

  if (type === 'dot') {
    return (
      <span
        className="inline-block w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: baseColor }}
      />
    );
  }

  if (type === 'square') {
    return (
      <span
        className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
        style={{ backgroundColor: baseColor }}
      />
    );
  }

  return (
    <span
      className="inline-block w-3 h-0.5 shrink-0"
      style={{ backgroundColor: baseColor }}
    />
  );
}