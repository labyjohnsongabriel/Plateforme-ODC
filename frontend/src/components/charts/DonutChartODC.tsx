'use client';

import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import {
  buildChartSummary,
  formatNumber,
  formatPercent,
  getCategoricalColor,
} from '@/lib/chart-theme';
import { cn } from '@/lib/utils';
import { ChartEmpty } from './ChartEmpty';

export interface DonutDatum {
  name: string;
  value: number;
  color?: string;
}

export interface DonutChartODCProps {
  data: DonutDatum[];
  height?: number;
  /** Rayon intérieur en % du rayon extérieur. 0 = camembert plein. */
  innerRadius?: number;
  paddingAngle?: number;
  showCenter?: boolean;
  centerLabel?: string;
  centerValueFormatter?: (value: number) => string;
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  showPercentage?: boolean;
  legendPosition?: 'right' | 'bottom';
  ariaLabel?: string;
  className?: string;
}

export function DonutChartODC({
  data,
  height = 280,
  innerRadius = 70,
  paddingAngle = 2,
  showCenter = true,
  centerLabel = 'Total',
  centerValueFormatter,
  valueFormatter = formatNumber,
  showLegend = true,
  showPercentage = true,
  legendPosition = 'right',
  ariaLabel = 'Répartition',
  className,
}: DonutChartODCProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState<number | null>(null);

  // Couleur attribuée AVANT le tri : elle reste stable quand l'ordre change.
  const items = data
    .map((d, index) => ({ ...d, color: d.color ?? getCategoricalColor(index) }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) return <ChartEmpty height={height} />;

  const isPie = innerRadius <= 0;
  const size = Math.min(height, 240);
  const activeItem = active !== null ? items[active] : undefined;
  const formatCenter = centerValueFormatter ?? valueFormatter;
  // Marge du texte central : il doit rester dans le trou du donut.
  const centerInset = Math.round((size * (1 - innerRadius / 100)) / 2 + 8);

  return (
    <div
      className={cn(
        'flex items-center gap-6',
        legendPosition === 'bottom' ? 'flex-col' : 'flex-col sm:flex-row',
        !showLegend && 'justify-center',
        className,
      )}
      style={{ minHeight: height }}
    >
      <div
        role="img"
        aria-label={buildChartSummary(ariaLabel, items)}
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              dataKey="value"
              nameKey="name"
              innerRadius={`${Math.max(innerRadius, 0)}%`}
              outerRadius="100%"
              paddingAngle={items.length > 1 ? paddingAngle : 0}
              cornerRadius={isPie ? 0 : 4}
              startAngle={90}
              endAngle={-270}
              // ✅ Séparateur d'arcs = fond de la Card (token shadcn)
              stroke="hsl(var(--card))"
              strokeWidth={2}
              isAnimationActive={!reducedMotion}
              animationDuration={700}
              onMouseEnter={(_, index) => setActive(index)}
              onMouseLeave={() => setActive(null)}
            >
              {items.map((item, index) => (
                <Cell
                  key={item.name}
                  fill={item.color}
                  fillOpacity={active === null || active === index ? 1 : 0.35}
                  style={{ transition: 'fill-opacity 150ms ease' }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Le centre fait office d'infobulle : total par défaut, détail au survol */}
        {showCenter && !isPie && (
          <div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
            style={{ paddingInline: centerInset }}
          >
            <span className="font-display text-3xl font-bold tabular-nums text-foreground">
              {formatCenter(activeItem?.value ?? total)}
            </span>
            <span className="mt-0.5 max-w-full truncate text-xs text-muted-foreground">
              {activeItem?.name ?? centerLabel}
            </span>
          </div>
        )}
      </div>

      {showLegend && (
        <ul className="w-full min-w-0 flex-1 divide-y divide-border">
          {items.map((item, index) => (
            <li
              key={item.name}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              className={cn(
                'flex items-center gap-3 py-2.5 text-sm transition-opacity',
                active !== null && active !== index && 'opacity-50',
              )}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-background"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {item.name}
              </span>
              <span className="font-semibold tabular-nums text-foreground">
                {valueFormatter(item.value)}
              </span>
              {showPercentage && (
                <span className="w-14 text-right text-xs tabular-nums text-muted-foreground">
                  {formatPercent(item.value / total)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}