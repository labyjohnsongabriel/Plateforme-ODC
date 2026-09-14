import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '@/utils/cn';

export interface DoughnutChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface DoughnutChartProps {
  data: DoughnutChartDataPoint[];
  title?: string;
  description?: string;
  height?: number;
  thickness?: number;
  className?: string;
  showLegend?: boolean;
}

const DEFAULT_COLORS = [
  '#FF7900',
  '#E65100',
  '#FFB74D',
  '#0277BD',
  '#2E7D32',
  '#C62828',
  '#6A1B9A',
  '#00838F',
];

export function DoughnutChart({
  data,
  title,
  description,
  height = 320,
  thickness = 60,
  className,
  showLegend = true,
}: DoughnutChartProps) {
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

  // Calcul de la taille du rayon interne selon thickness
  const outerRadius = 90;
  const innerRadius = outerRadius - thickness / 2;

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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            ))}
          </Pie>
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
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: '#6B6B6B' }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DoughnutChart;