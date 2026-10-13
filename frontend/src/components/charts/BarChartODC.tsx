// src/components/charts/BarChartODC.tsx
'use client';

import * as React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import { ChartTooltip } from './ChartTooltip';
import { ChartLegend } from './ChartLegend';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface BarChartDataItem {
  name: string;
  value: number;
  [key: string]: any;
}

export interface BarChartSeries {
  /** Clé des données à afficher */
  dataKey: string;
  /** Nom affiché dans la légende */
  name: string;
  /** Couleur (hex) */
  color: string;
}

export interface BarChartODCProps {
  /** Données à afficher */
  data: BarChartDataItem[];
  /** Configuration des barres */
  series: BarChartSeries[];
  /** Hauteur du graphique */
  height?: number;
  /** Orientation */
  layout?: 'horizontal' | 'vertical';
  /** Afficher la grille */
  showGrid?: boolean;
  /** Afficher la légende */
  showLegend?: boolean;
  /** Afficher les valeurs sur les barres */
  showLabels?: boolean;
  /** Rayon des barres */
  barRadius?: number;
  /** Largeur des barres */
  barSize?: number;
  /** Espacement entre les groupes */
  barGap?: number;
  /** Couleur du texte des axes */
  axisColor?: string;
  /** Couleur de la grille */
  gridColor?: string;
  /** Formateur des valeurs tooltip */
  valueFormatter?: (value: number) => string;
  /** Formateur des labels d'axe X */
  xAxisFormatter?: (value: any) => string;
  /** Classes CSS */
  className?: string;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function BarChartODC({
  data,
  series,
  height = 300,
  layout = 'horizontal',
  showGrid = true,
  showLegend = false,
  showLabels = false,
  barRadius = 6,
  barSize,
  barGap = 4,
  axisColor = 'currentColor',
  gridColor = 'rgba(0, 0, 0, 0.06)',
  valueFormatter,
  xAxisFormatter,
  className,
}: BarChartODCProps) {
  const isVertical = layout === 'vertical';

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={layout}
          margin={{
            top: 10,
            right: 10,
            left: isVertical ? 80 : 0,
            bottom: 0,
          }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridColor}
              vertical={!isVertical}
              horizontal={isVertical}
            />
          )}

          {isVertical ? (
            <>
              <XAxis
                type="number"
                stroke={axisColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={valueFormatter}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke={axisColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={80}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="name"
                stroke={axisColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={xAxisFormatter}
              />
              <YAxis
                stroke={axisColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={valueFormatter}
              />
            </>
          )}

          <Tooltip
            content={
              <ChartTooltip
                valueFormatter={valueFormatter}
                indicator="square"
              />
            }
            cursor={{ fill: 'rgba(255, 121, 0, 0.06)' }}
          />

          {showLegend && (
            <Legend
              content={<ChartLegend />}
              wrapperStyle={{ paddingTop: 16 }}
            />
          )}

          {series.map((s) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name}
              fill={s.color}
              radius={[barRadius, barRadius, 0, 0]}
              barSize={barSize}
              maxBarSize={80}
            >
              {showLabels &&
                data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={s.color} />
                ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}