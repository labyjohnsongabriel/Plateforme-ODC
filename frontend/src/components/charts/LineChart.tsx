'use client';

import { AreaChartODC } from './AreaChartODC';
import { ChartContainer } from './ChartContainer';

export interface LineChartSeries {
  dataKey: string;
  name: string;
  color?: string;
}

export interface LineChartProps {
  data: Array<Record<string, unknown>>;
  series: LineChartSeries[];
  xAxisKey?: string;
  title?: string;
  description?: string;
  height?: number;
  className?: string;
  loading?: boolean;
  error?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  xTickFormatter?: (value: string) => string;
  tooltipLabelFormatter?: (value: string) => string;
  valueFormatter?: (value: number, name: string) => string;
  onRefresh?: () => void;
  onExport?: () => void;
}

export function LineChart({
  data,
  series,
  xAxisKey = 'name',
  title,
  description,
  height = 320,
  className,
  loading,
  error,
  showGrid = true,
  showLegend,
  xTickFormatter,
  tooltipLabelFormatter,
  valueFormatter,
  onRefresh,
  onExport,
}: LineChartProps) {
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
        filled={false}
        data={data}
        xKey={xAxisKey}
        series={series}
        height={height}
        ariaLabel={title ?? 'Graphique en courbes'}
        showGrid={showGrid}
        showLegend={showLegend}
        xTickFormatter={xTickFormatter}
        tooltipLabelFormatter={tooltipLabelFormatter}
        valueFormatter={valueFormatter}
      />
    </ChartContainer>
  );
}

export default LineChart;