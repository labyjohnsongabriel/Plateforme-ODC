'use client';

import { AreaChartODC, type AreaSeries } from './AreaChartODC';
import { ChartContainer } from './ChartContainer';

export type AreaChartSeries = AreaSeries;

export interface AreaChartProps {
  title: string;
  description?: string;
  data: Array<Record<string, unknown>>;
  series: AreaChartSeries[];
  xAxisKey?: string;
  height?: number;
  loading?: boolean;
  error?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  xTickFormatter?: (value: string) => string;
  tooltipLabelFormatter?: (value: string) => string;
  valueFormatter?: (value: number, name: string) => string;
  onRefresh?: () => void;
  onExport?: () => void;
  className?: string;
}

export function AreaChart({
  title,
  description,
  data,
  series,
  xAxisKey = 'name',
  height = 300,
  loading,
  error,
  showLegend,
  showGrid = true,
  xTickFormatter,
  tooltipLabelFormatter,
  valueFormatter,
  onRefresh,
  onExport,
  className,
}: AreaChartProps) {
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
      <AreaChartODC
        data={data}
        xKey={xAxisKey}
        series={series}
        height={height}
        ariaLabel={title}
        showGrid={showGrid}
        showLegend={showLegend}
        xTickFormatter={xTickFormatter}
        tooltipLabelFormatter={tooltipLabelFormatter}
        valueFormatter={valueFormatter}
      />
    </ChartContainer>
  );
}