'use client';

import type { ReactNode } from 'react';
import { AlertCircle, Download, RefreshCw, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PanelCard } from '@/components/dashboard/PanelCard';
import { cn } from '@/lib/utils';
import { ChartEmpty } from './ChartEmpty';

export interface ChartContainerProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  loading?: boolean;
  refreshing?: boolean;
  error?: string;
  empty?: boolean;
  emptyMessage?: string;
  height?: number;
  actions?: ReactNode;
  footer?: ReactNode;
  onRefresh?: () => void;
  onExport?: () => void;
  className?: string;
}

export function ChartContainer({
  title,
  description,
  icon,
  children,
  loading,
  refreshing,
  error,
  empty,
  emptyMessage = 'Aucune donnée disponible',
  height = 300,
  actions,
  footer,
  onRefresh,
  onExport,
  className,
}: ChartContainerProps) {
  const toolbar =
    actions || onRefresh || onExport ? (
      <div className="flex items-center gap-1">
        {actions}
        {onRefresh && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
            onClick={onRefresh}
            aria-label="Actualiser les données"
            title="Actualiser"
          >
            <RefreshCw
              className={cn(
                'h-4 w-4',
                refreshing && 'animate-spin motion-reduce:animate-none',
              )}
              aria-hidden="true"
            />
          </Button>
        )}
        {onExport && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
            onClick={onExport}
            aria-label="Exporter les données"
            title="Exporter"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    ) : undefined;

  let body: ReactNode;

  if (loading) {
    body = (
      <div aria-busy="true" aria-label="Chargement du graphique">
        <Skeleton className="w-full rounded-lg" style={{ height }} />
      </div>
    );
  } else if (error) {
    body = (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-4 text-center"
        style={{ minHeight: height }}
      >
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive dark:bg-destructive/15 dark:text-destructive-foreground"
          aria-hidden="true"
        >
          <AlertCircle className="h-5 w-5" />
        </span>
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            Impossible de charger le graphique
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">{error}</p>
        </div>
        {onRefresh && (
          <Button type="button" variant="outline" size="sm" onClick={onRefresh}>
            Réessayer
          </Button>
        )}
      </div>
    );
  } else if (empty) {
    body = <ChartEmpty height={height} title={emptyMessage} />;
  } else {
    body = children;
  }

  return (
    <PanelCard
      title={title}
      description={description}
      icon={icon}
      action={toolbar}
      className={className}
    >
      {body}
      {footer && !loading && !error && !empty && (
        <div className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
          {footer}
        </div>
      )}
    </PanelCard>
  );
}