import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PanelCardProps {
  /** Sans titre ni action, l'en-tête n'est pas rendu. */
  title?: string;
  description?: string;
  icon?: LucideIcon;
  /** Zone à droite de l'en-tête : bouton « Voir tout », chiffres clés, boutons d'action… */
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

/**
 * Carte de panneau unique pour tout le dashboard (listes, graphiques) :
 * même en-tête, mêmes espacements, mêmes états → cohérence visuelle garantie.
 */
export function PanelCard({
  title,
  description,
  icon: Icon,
  action,
  className,
  contentClassName,
  children,
}: PanelCardProps) {
  const hasHeader = Boolean(title || action);

  return (
    <Card className={cn('flex flex-col overflow-hidden border-odc-border bg-odc-surface', className)}>
      {hasHeader && (
        <CardHeader className="flex flex-col gap-3 space-y-0 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            {Icon && (
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-odc-primary-soft text-odc-primary-text"
                aria-hidden="true"
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
            )}
            {title && (
              <div className="min-w-0 space-y-0.5">
                <CardTitle className="text-base font-semibold leading-tight">{title}</CardTitle>
                {description && (
                  <CardDescription className="text-sm text-odc-muted">{description}</CardDescription>
                )}
              </div>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </CardHeader>
      )}

      <CardContent className={cn('flex-1', !hasHeader && 'pt-5', contentClassName)}>{children}</CardContent>
    </Card>
  );
}

/** Squelette de liste (avatar/rang + 2 lignes + badge) — mêmes proportions que les vraies lignes. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement en cours">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}