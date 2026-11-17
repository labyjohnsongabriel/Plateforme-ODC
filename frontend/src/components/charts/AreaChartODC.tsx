'use client';

import { useId } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import {
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  buildChartSummary,
  formatCompact,
  formatNumber,
  getCategoricalColor,
} from '@/lib/chart-theme';
import { ChartLegend } from './ChartLegend';
import { ChartTooltip } from './ChartTooltip';

export interface AreaSeries {
  dataKey: string;
  name: string;
  color?: string;
  stacked?: boolean;
}

export interface AreaChartODCProps {
  data: ReadonlyArray<Record<string, unknown>>;
  xKey: string;
  series: AreaSeries[];
  height?: number;
  ariaLabel: string;
  filled?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  xTickFormatter?: (value: string) => string;
  tooltipLabelFormatter?: (value: string) => string;
  valueFormatter?: (value: number, name: string) => string;
}

export function AreaChartODC({
  data,
  xKey,
  series,
  height = 320,
  ariaLabel,
  filled = true,
  showGrid = true,
  showLegend,
  xTickFormatter,
  tooltipLabelFormatter,
  valueFormatter,
}: AreaChartODCProps) {
  const reducedMotion = usePrefersReducedMotion();
  const uid = useId().replace(/:/g, '');
  const showDots = data.length <= 14;
  const legendVisible = showLegend ?? series.length > 1;
  const topOpacity = series.length > 1 ? 0.16 : 0.28;

  const formatX = (value: unknown) =>
    xTickFormatter ? xTickFormatter(String(value)) : String(value);

  const summary = buildChartSummary(
    ariaLabel,
    series.flatMap((s) =>
      data.map((row) => ({
        name: series.length > 1 ? `${formatX(row[xKey])} (${s.name})` : formatX(row[xKey]),
        value: Number(row[s.dataKey]),
      })),
    ),
    24,
  );

  return (
    <div role="img" aria-label={summary} className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data as Array<Record<string, unknown>>}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          {filled && (
            <defs>
              {series.map((s, index) => {
                const color = s.color ?? getCategoricalColor(index);
                return (
                  <linearGradient
                    key={s.dataKey}
                    id={`${uid}-${s.dataKey}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" style={{ stopColor: color, stopOpacity: topOpacity }} />
                    <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
                  </linearGradient>
                );
              })}
            </defs>
          )}

          {showGrid && (
            <CartesianGrid
              vertical={false}
              stroke={CHART_GRID_STROKE}
              strokeDasharray="4 4"
            />
          )}

          <XAxis
            dataKey={xKey}
            tick={CHART_AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: CHART_GRID_STROKE }}
            tickMargin={10}
            minTickGap={16}
            tickFormatter={xTickFormatter}
          />
          <YAxis
            tick={CHART_AXIS_TICK}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={40}
            tickFormatter={formatCompact}
          />

          <Tooltip
            cursor={{ stroke: 'var(--border)', strokeDasharray: '4 4' }}
            content={
              <ChartTooltip
                labelFormatter={tooltipLabelFormatter}
                valueFormatter={valueFormatter ?? ((value) => formatNumber(value))}
              />
            }
          />

          {legendVisible && <Legend verticalAlign="top" content={<ChartLegend />} />}

          {series.map((s, index) => {
            const color = s.color ?? getCategoricalColor(index);
            return (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={color}
                strokeWidth={2.5}
                fill={filled ? `url(#${uid}-${s.dataKey})` : 'none'}
                stackId={s.stacked ? 'stack' : undefined}
                dot={
                  showDots
                    ? { r: 3.5, strokeWidth: 2, stroke: color, fill: 'var(--background)' }
                    : false
                }
                activeDot={{
                  r: 5.5,
                  strokeWidth: 2,
                  stroke: 'var(--background)',
                  fill: color,
                }}
                isAnimationActive={!reducedMotion}
                animationDuration={900}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}