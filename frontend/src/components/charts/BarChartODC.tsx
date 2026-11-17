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

export interface BarChartDataItem {
  name: string;
  value: number;
  [key: string]: any;
}

export interface BarChartSeries {
  dataKey: string;
  name: string;
  color: string;
}

export interface BarChartODCProps {
  data: BarChartDataItem[];
  series: BarChartSeries[];
  height?: number;
  layout?: 'horizontal' | 'vertical';
  showGrid?: boolean;
  showLegend?: boolean;
  showLabels?: boolean;
  barRadius?: number;
  barSize?: number;
  barGap?: number;
  axisColor?: string;
  gridColor?: string;
  valueFormatter?: (value: number) => string;
  xAxisFormatter?: (value: any) => string;
  className?: string;
}

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
  axisColor = 'hsl(var(--muted-foreground))',
  gridColor = 'hsl(var(--border))',
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
              strokeDasharray="4 4"
              stroke={gridColor}
              strokeOpacity={0.6}
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
            content={<ChartTooltip valueFormatter={valueFormatter} indicator="square" />}
            cursor={{ fill: 'hsl(var(--accent) / 0.5)' }}
          />

          {showLegend && (
            <Legend content={<ChartLegend />} wrapperStyle={{ paddingTop: 16 }} />
          )}

          {series.map((s) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name}
              fill={s.color}
              radius={
                isVertical
                  ? [0, barRadius, barRadius, 0]
                  : [barRadius, barRadius, 0, 0]
              }
              barSize={barSize}
              maxBarSize={80}
            >
              {showLabels &&
                data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={s.color} />
                ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}