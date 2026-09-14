import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/utils/cn';

export interface LineChartSeries {
  dataKey: string;
  name: string;
  color?: string;
}

export interface LineChartProps {
  data: any[];
  series: LineChartSeries[];
  xAxisKey?: string;
  title?: string;
  description?: string;
  height?: number;
  className?: string;
  showGrid?: boolean;
  showLegend?: boolean;
}

const DEFAULT_COLORS = ['#FF7900', '#0277BD', '#2E7D32', '#C62828'];

export function LineChart({
  data,
  series,
  xAxisKey = 'name',
  title,
  description,
  height = 320,
  className,
  showGrid = true,
  showLegend = false,
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={cn('bg-white dark:bg-odc-surface-dark rounded-xl border border-odc-border-light dark:border-odc-border-dark p-5', className)}>
        {title && (
          <h3 className="font-heading font-semibold text-sm mb-1">{title}</h3>
        )}
        {description && (
          <p className="text-xs text-odc-text-muted-light mb-4">{description}</p>
        )}
        <div className="flex items-center justify-center h-40 text-sm text-odc-text-muted-light">
          Aucune donnée
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-odc-surface-dark rounded-xl border border-odc-border-light dark:border-odc-border-dark p-5',
        className
      )}
    >
      {title && (
        <h3 className="font-heading font-semibold text-sm text-odc-text-light dark:text-odc-text-dark mb-1">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mb-4">
          {description}
        </p>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <ReLineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
          )}
          <XAxis
            dataKey={xAxisKey}
            stroke="#9E9E9E"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#9E9E9E"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1A1A',
              border: 'none',
              borderRadius: 8,
              color: '#FFF',
              fontSize: 12,
            }}
          />
          {showLegend && (
            <Legend wrapperStyle={{ fontSize: 12, color: '#6B6B6B' }} />
          )}
          {series.map((s, index) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 2 }}
              activeDot={{ r: 5 }}
              animationDuration={500}
            />
          ))}
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChart;