// src/components/charts/ChartTooltip.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface ChartTooltipProps {
  /** Props Recharts injectées automatiquement */
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    dataKey?: string;
    payload?: Record<string, any>;
  }>;
  label?: string | number;

  /** Format des valeurs */
  valueFormatter?: (value: number) => string;
  /** Type d'indicateur */
  indicator?: 'dot' | 'square' | 'line' | 'none';
  /** Afficher le pourcentage */
  showPercentage?: boolean;
  /** Total (pour le calcul du %) */
  total?: number;
  /** Formatter du label */
  labelFormatter?: (label: any) => string;
  /** Classe CSS personnalisée */
  className?: string;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
  indicator = 'dot',
  showPercentage = false,
  total,
  labelFormatter,
  className,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const formatValue =
    valueFormatter ?? ((v: number) => v.toLocaleString('fr-FR'));

  const displayLabel = labelFormatter ? labelFormatter(label) : label;

  return (
    <div
      className={cn(
        'rounded-lg border border-odc-border bg-odc-surface shadow-odc-lg px-3 py-2 text-xs',
        'animate-in fade-in-0 zoom-in-95 duration-150',
        className,
      )}
    >
      {displayLabel !== undefined && displayLabel !== '' && (
        <p className="font-medium text-odc-text-primary mb-1.5">
          {displayLabel}
        </p>
      )}

      <ul className="space-y-1">
        {payload.map((entry, index) => {
          const value = Number(entry.value ?? 0);
          const percentage =
            showPercentage && total && total > 0
              ? ((value / total) * 100).toFixed(1)
              : null;

          return (
            <li
              key={`item-${index}`}
              className="flex items-center gap-2 justify-between"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                {indicator !== 'none' && (
                  <Indicator type={indicator} color={entry.color} />
                )}
                <span className="text-odc-muted truncate">
                  {entry.name ?? entry.dataKey}
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-medium text-odc-text-primary shrink-0">
                <span>{formatValue(value)}</span>
                {percentage !== null && (
                  <span className="text-odc-muted text-[10px]">
                    ({percentage}%)
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
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