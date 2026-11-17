import { BarChart3 } from 'lucide-react';

interface ChartEmptyProps {
  height?: number;
  title?: string;
  description?: string;
}

export function ChartEmpty({
  height = 280,
  title = 'Aucune donnée disponible',
  description,
}: ChartEmptyProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-4 text-center"
      style={{ minHeight: height }}
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <BarChart3 className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-foreground/80">{title}</p>
      {description && (
        <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}