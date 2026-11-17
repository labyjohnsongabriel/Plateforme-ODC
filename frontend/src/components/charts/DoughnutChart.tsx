'use client';

import { ChartContainer } from './ChartContainer';
import { DonutChartODC, type DonutDatum } from './DonutChartODC';

export type DoughnutChartDataPoint = DonutDatum;

export interface DoughnutChartProps {
  data: DoughnutChartDataPoint[];
  title?: string;
  description?: string;
  height?: number;
  /** Épaisseur de l'anneau (en px, comme avant). */
  thickness?: number;
  className?: string;
  showLegend?: boolean;
  loading?: boolean;
  error?: string;
  centerLabel?: string;
  onRefresh?: () => void;
  onExport?: () => void;
}

/** Ancienne épaisseur en px (rayon ext. 90 px) → rayon intérieur en %. */
function thicknessToInnerRadius(thickness: number): number {
  const percent = 100 - (thickness / 2 / 90) * 100;
  return Math.min(90, Math.max(40, Math.round(percent)));
}

export function DoughnutChart({
  data,
  title,
  description,
  height = 320,
  thickness = 60,
  className,
  showLegend = true,
  loading,
  error,
  centerLabel,
  onRefresh,
  onExport,
}: DoughnutChartProps) {
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
      <DonutChartODC
        data={data}
        height={height}
        innerRadius={thicknessToInnerRadius(thickness)}
        showLegend={showLegend}
        centerLabel={centerLabel}
        ariaLabel={title ?? 'Répartition'}
      />
    </ChartContainer>
  );
}

export default DoughnutChart;