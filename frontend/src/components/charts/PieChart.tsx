'use client';

import { getCategoricalColor } from '@/lib/chart-theme';
import { ChartContainer } from './ChartContainer';
import { DonutChartODC } from './DonutChartODC';

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  title: string;
  description?: string;
  data: PieChartData[];
  height?: number;
  loading?: boolean;
  error?: string;
  /** % du rayon extérieur. 0 = camembert plein. */
  innerRadius?: number;
  showLegend?: boolean;
  showPercentage?: boolean;
  /**
   * Palette de repli (sinon palette ODC).
   * ⚠️ Privilégier des tokens CSS (`hsl(var(--chart-1))`) pour un rendu
   * cohérent en dark mode.
   */
  colors?: string[];
  onRefresh?: () => void;
  onExport?: () => void;
  className?: string;
}

export function PieChart({
  title,
  description,
  data,
  height = 300,
  loading,
  error,
  innerRadius = 0,
  showLegend = true,
  showPercentage = true,
  colors,
  onRefresh,
  onExport,
  className,
}: PieChartProps) {
  // Garde-fou dev : signale les couleurs non-token qui cassent le dark mode.
  if (process.env.NODE_ENV !== 'production' && colors) {
    colors.forEach((c) => {
      if (!c.includes('var(--')) {
        console.warn(
          `[PieChart] "${c}" n'est pas un token CSS. ` +
            `Préférez "hsl(var(--chart-N))" pour un rendu dark-compatible.`,
        );
      }
    });
  }

  const items = (data ?? []).map((d, index) => ({
    ...d,
    color:
      d.color ??
      (colors && colors.length > 0
        ? colors[index % colors.length]
        : getCategoricalColor(index)),
  }));

  return (
    <ChartContainer
      title={title}
      description={description}
      loading={loading}
      error={error}
      empty={items.length === 0}
      height={height}
      onRefresh={onRefresh}
      onExport={onExport}
      className={className}
    >
      <DonutChartODC
        data={items}
        height={height}
        innerRadius={innerRadius}
        showLegend={showLegend}
        showPercentage={showPercentage}
        ariaLabel={title}
      />
    </ChartContainer>
  );
}