// src/components/charts/DonutChartODC.tsx
'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { ChartTooltip } from './ChartTooltip';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface DonutChartDataItem {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

export interface DonutChartODCProps {
  /** Données à afficher */
  data: DonutChartDataItem[];
  /** Hauteur du graphique */
  height?: number;
  /** Épaisseur de l'anneau (en %) */
  innerRadius?: number;
  /** Rayon extérieur (en %) */
  outerRadius?: number;
  /** Afficher le total au centre */
  showCenter?: boolean;
  /** Label du centre */
  centerLabel?: string;
  /** Valeur formatée du centre */
  centerValueFormatter?: (value: number) => string;
  /** Espacement entre les segments (px) */
  paddingAngle?: number;
  /** Formateur des valeurs tooltip */
  valueFormatter?: (value: number) => string;
  /** Classes CSS */
  className?: string;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function DonutChartODC({
  data,
  height = 300,
  innerRadius = 60,
  outerRadius = 85,
  showCenter = true,
  centerLabel = 'Total',
  centerValueFormatter,
  paddingAngle = 3,
  valueFormatter,
  className,
}: DonutChartODCProps) {
  const total = React.useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data],
  );

  const formatCenterValue = centerValueFormatter ?? ((v: number) => v.toLocaleString('fr-FR'));

  return (
    <div className={cn('relative w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={`${innerRadius}%`}
            outerRadius={`${outerRadius}%`}
            paddingAngle={paddingAngle}
            dataKey="value"
            stroke="none"
            animationBegin={0}
            animationDuration={600}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>

          <Tooltip
            content={
              <ChartTooltip
                valueFormatter={valueFormatter}
                indicator="dot"
                showPercentage
                total={total}
              />
            }
          />
        </PieChart>
      </ResponsiveContainer>

      {/* -------------------- Centre du donut -------------------- */}
      {showCenter && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-odc-muted font-medium uppercase tracking-wider">
            {centerLabel}
          </span>
          <span className="text-2xl md:text-3xl font-display font-bold text-odc-text-primary mt-0.5">
            {formatCenterValue(total)}
          </span>
        </div>
      )}
    </div>
  );
}