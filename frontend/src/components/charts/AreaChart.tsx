import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from './ChartContainer';

export interface AreaChartSeries {
  dataKey: string;
  name: string;
  color?: string;
  stacked?: boolean;
}

export interface AreaChartProps {
  title: string;
  description?: string;
  data: any[];
  series: AreaChartSeries[];
  xAxisKey?: string;
  height?: number;
  loading?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
}

const DEFAULT_COLORS = ['#FF7900', '#0277BD', '#2E7D32', '#7B1FA2'];

export function AreaChart({
  title,
  description,
  data,
  series,
  xAxisKey = 'name',
  height = 300,
  loading,
  showLegend = true,
  showGrid = true,
  onRefresh,
  onExport,
}: AreaChartProps) {
  const empty = !data || data.length === 0;

  return (
    <ChartContainer
      title={title}
      description={description}
      loading={loading}
      empty={empty}
      height={height}
      onRefresh={onRefresh}
      onExport={onExport}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            {series.map((s, i) => {
              const color = s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
              return (
                <linearGradient key={s.dataKey} id={`area-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>

          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-odc-border-light dark:text-odc-border-dark"
              opacity={0.4}
            />
          )}

          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-odc-text-muted-light dark:text-odc-text-muted-dark"
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fontSize: 12, fill: 'currentColor' }}
            className="text-odc-text-muted-light dark:text-odc-text-muted-dark"
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{
              background: 'var(--odc-surface)',
              border: '1px solid var(--odc-border)',
              borderRadius: 12,
              padding: '10px 14px',
              boxShadow: '0 4px 20px rgba(255, 121, 0, 0.15)',
              fontSize: 13,
            }}
            cursor={{ stroke: '#FF7900', strokeWidth: 1, strokeDasharray: '4 4' }}
          />

          {showLegend && <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12 }} iconType="circle" />}

          {series.map((s, i) => {
            const color = s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            return (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#area-${s.dataKey})`}
                stackId={s.stacked ? 'stack' : undefined}
                dot={{ fill: color, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: 'white' }}
              />
            );
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}