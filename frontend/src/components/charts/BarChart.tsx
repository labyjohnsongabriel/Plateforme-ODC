'use client';

import { BarChartODC } from './BarChartODC';
import { ChartContainer } from './ChartContainer';

export interface BarChartProps {
  title: string;
  description?: string;
  data: Array<Record<string, unknown>>;
  dataKey: string;
  xAxisKey?: string;
  height?: number;
  loading?: boolean;
  error?: string;
  color?: string;
  multiColor?: boolean;
  horizontal?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  series?: Array<{ dataKey: string; name: string; color?: string }>;
  valueFormatter?: (value: number, name: string) => string;
  onRefresh?: () => void;
  onExport?: () => void;
  className?: string;
}

export function BarChart({
  title,
  description,
  data,
  dataKey,
  xAxisKey = 'name',
  height = 300,
  loading,
  error,
  color,
  multiColor = false,
  horizontal = false,
  showLegend,
  stacked = false,
  series,
  valueFormatter,
  onRefresh,
  onExport,
  className,
}: BarChartProps) {
  const resolvedSeries =
    series && series.length > 0
      ? series
      : [{ dataKey, name: title, color: color ?? 'hsl(var(--chart-1))' }];

  return (
    <ChartContainer
      title={title}
      description={description}
      loading={loading}
      error={error}
      empty={!data || data.length === 0}
      height={height}
      onRefresh={onRefresh}
      onExport={onExport}
      className={className}
    >
      <BarChartODC
        data={data}
        series={resolvedSeries}
        categoryKey={xAxisKey}
        layout={horizontal ? 'vertical' : 'horizontal'}
        height={height}
        barRadius={6}
        stacked={stacked}
        colorByCategory={multiColor}
        showLegend={showLegend}
        valueFormatter={valueFormatter}
        ariaLabel={title}
      />
    </ChartContainer>
  );
}