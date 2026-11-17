'use client';

import { formatNumber, formatPercent } from '@/lib/chart-theme';
import { cn } from '@/lib/utils';

interface ChartTooltipEntry {
  name?: string | number;
  value?: string | number;
  color?: string;
  dataKey?: string | number;
  payload?: { color?: string } & Record<string, unknown>;
}

export interface ChartTooltipProps {
  /** Injectés par Recharts */
  active?: boolean;
  payload?: ChartTooltipEntry[];
  label?: string | number;
  /** Format des valeurs */
  valueFormatter?: (value: number, name: string) => string;
  /** Forme de la pastille de couleur */
  indicator?: 'dot' | 'square' | 'line' | 'none';
  /** Afficher la part du total */
  showPercentage?: boolean;
  /** Total servant au calcul de la part */
  total?: number;
  labelFormatter?: (label: string) => string;
  className?: string;
}

function Indicator({
  type,
  color,
}: {
  type: 'dot' | 'square' | 'line';
  color: string;
}) {
  const shape =
    type === 'dot'
      ? 'h-2 w-2 rounded-full'
      : type === 'square'
        ? 'h-2.5 w-2.5 rounded-sm'
        : 'h-0.5 w-3';
  return (
    <span
      className={cn('inline-block shrink-0', shape)}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = (value) => formatNumber(value),
  indicator = 'square',
  showPercentage = false,
  total,
  labelFormatter,
  className,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const rawLabel = label !== undefined && label !== '' ? String(label) : undefined;
  const title =
    rawLabel !== undefined
      ? labelFormatter
        ? labelFormatter(rawLabel)
        : rawLabel
      : undefined;

  return (
    <div
      className={cn(
        'pointer-events-none min-w-[160px] max-w-[280px] rounded-lg border border-border bg-popover px-3 py-2.5 text-sm text-popover-foreground shadow-lg',
        className,
      )}
    >
      {title && (
        <p className="mb-1.5 border-b border-border pb-1.5 text-xs font-semibold text-foreground">
          {title}
        </p>
      )}

      <ul className="space-y-1">
        {payload.map((entry, index) => {
          const color = entry.payload?.color ?? entry.color ?? 'hsl(var(--chart-1))';
          const name = String(entry.name ?? entry.dataKey ?? '');
          const numeric = Number(entry.value);
          const share =
            showPercentage && total && total > 0 && Number.isFinite(numeric)
              ? numeric / total
              : null;

          return (
            <li key={`${name}-${index}`} className="flex items-center gap-2">
              {indicator !== 'none' && <Indicator type={indicator} color={color} />}
              <span className="truncate text-muted-foreground">{name}</span>
              <span className="ml-auto flex shrink-0 items-baseline gap-1.5 pl-4 font-semibold tabular-nums text-foreground">
                {Number.isFinite(numeric)
                  ? valueFormatter(numeric, name)
                  : String(entry.value)}
                {share !== null && (
                  <span className="text-xs font-normal text-muted-foreground">
                    ({formatPercent(share)})
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}