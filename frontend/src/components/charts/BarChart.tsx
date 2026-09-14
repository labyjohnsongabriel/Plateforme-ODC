import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartContainer } from './ChartContainer';

export interface BarChartProps {
  title: string;
  description?: string;
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  height?: number;
  loading?: boolean;
  color?: string;
  multiColor?: boolean;
  horizontal?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  series?: Array<{ dataKey: string; name: string; color: string }>;
  onRefresh?: () => void;
  onExport?: () => void;
}

const DEFAULT_COLORS = ['#FF7900', '#E65100', '#FFB74D', '#0277BD', '#2E7D32', '#7B1FA2'];

export function BarChart({
  title,
  description,
  data,
  dataKey,
  xAxisKey = 'name',
  height = 300,
  loading,
  color = '#FF7900',
  multiColor = false,
  horizontal = false,
  showLegend = false,
  stacked = false,
  series,
  onRefresh,
  onExport,
}: BarChartProps) {
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
        <RechartsBarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF7900" stopOpacity={1} />
              <stop offset="100%" stopColor="#E65100" stopOpacity={1} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            className="text-odc-border-light dark:text-odc-border-dark"
            opacity={0.4}
            horizontal={!horizontal}
            vertical={horizontal}
          />

          {horizontal ? (
            <>
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-odc-text-muted-light dark:text-odc-text-muted-dark"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey={xAxisKey}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-odc-text-muted-light dark:text-odc-text-muted-dark"
                axisLine={false}
                tickLine={false}
                width={100}
              />
            </>
          ) : (
            <>
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
            </>
          )}

          <Tooltip
            contentStyle={{
              background: 'var(--odc-surface)',
              border: '1px solid var(--odc-border)',
              borderRadius: 12,
              padding: '10px 14px',
              boxShadow: '0 4px 20px rgba(255, 121, 0, 0.15)',
              fontSize: 13,
            }}
            cursor={{ fill: 'rgba(255, 121, 0, 0.05)' }}
          />

          {showLegend && (
            <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12 }} iconType="circle" />
          )}

          {series && series.length > 0 ? (
            series.map((s) => (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name}
                fill={s.color}
                stackId={stacked ? 'stack' : undefined}
                radius={horizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]}
              />
            ))
          ) : (
            <Bar
              dataKey={dataKey}
              fill={multiColor ? 'url(#bar-gradient)' : color}
              radius={horizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]}
              maxBarSize={60}
            >
              {multiColor &&
                data.map((_, i) => (
                  <Cell key={i} fill={DEFAULT_COLORS[i % DEFAULT_COLORS.length]} />
                ))}
            </Bar>
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}