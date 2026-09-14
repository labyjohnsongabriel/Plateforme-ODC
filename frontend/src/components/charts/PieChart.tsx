import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from './ChartContainer';

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
  innerRadius?: number;
  showLegend?: boolean;
  showPercentage?: boolean;
  colors?: string[];
  onRefresh?: () => void;
  onExport?: () => void;
}

const DEFAULT_COLORS = [
  '#FF7900',
  '#E65100',
  '#FFB74D',
  '#0277BD',
  '#2E7D32',
  '#7B1FA2',
  '#F57C00',
  '#00838F',
];

export function PieChart({
  title,
  description,
  data,
  height = 300,
  loading,
  innerRadius = 0,
  showLegend = true,
  showPercentage = true,
  colors = DEFAULT_COLORS,
  onRefresh,
  onExport,
}: PieChartProps) {
  const empty = !data || data.length === 0;
  const total = data?.reduce((sum, d) => sum + d.value, 0) || 0;

  const renderLabel = (entry: any) => {
    if (!showPercentage || total === 0) return '';
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${percent}%`;
  };

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
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius="75%"
            paddingAngle={2}
            dataKey="value"
            label={renderLabel}
            labelLine={false}
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.color || colors[i % colors.length]}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              background: 'var(--odc-surface)',
              border: '1px solid var(--odc-border)',
              borderRadius: 12,
              padding: '10px 14px',
              boxShadow: '0 4px 20px rgba(255, 121, 0, 0.15)',
              fontSize: 13,
            }}
            formatter={(value: any) => [
              `${value} (${((value / total) * 100).toFixed(1)}%)`,
              '',
            ]}
          />

          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: 13, paddingTop: 12 }}
              iconType="circle"
              layout="horizontal"
              verticalAlign="bottom"
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}