import { ReactNode } from 'react';
import { Download, RefreshCw, MoreVertical } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import { IconButton } from '@/components/common/IconButton';
import { Dropdown, DropdownItem } from '@/components/common/Dropdown';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/utils/cn';

export interface ChartContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyMessage?: string;
  height?: number | string;
  actions?: ReactNode;
  onRefresh?: () => void;
  onExport?: () => void;
  className?: string;
}

export function ChartContainer({
  title,
  description,
  children,
  loading,
  error,
  empty,
  emptyMessage = 'Aucune donnée disponible',
  height = 300,
  actions,
  onRefresh,
  onExport,
  className,
}: ChartContainerProps) {
  return (
    <Card className={cn('relative', className)}>
      <CardHeader>
        <div className="flex-1 min-w-0">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>

        <div className="flex items-center gap-1">
          {actions}

          {onRefresh && (
            <IconButton
              icon={<RefreshCw size={16} />}
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              tooltip="Rafraîchir"
            />
          )}

          {onExport && (
            <IconButton
              icon={<Download size={16} />}
              variant="ghost"
              size="sm"
              onClick={onExport}
              tooltip="Exporter"
            />
          )}

          <Dropdown
            trigger={
              <IconButton
                icon={<MoreVertical size={16} />}
                variant="ghost"
                size="sm"
                tooltip="Plus d'options"
              />
            }
          >
            <DropdownItem onClick={onRefresh}>Actualiser</DropdownItem>
            <DropdownItem onClick={onExport}>Exporter en PNG</DropdownItem>
            <DropdownItem onClick={onExport}>Exporter en CSV</DropdownItem>
          </Dropdown>
        </div>
      </CardHeader>

      <CardContent>
        <div style={{ height }} className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-odc-surface-dark/80 backdrop-blur-sm z-10 rounded-lg">
              <Loader size="md" text="Chargement..." />
            </div>
          )}

          {error && !loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <EmptyState
                title="Erreur de chargement"
                description={error}
              />
            </div>
          )}

          {empty && !loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <EmptyState title={emptyMessage} />
            </div>
          )}

          {!loading && !error && !empty && children}
        </div>
      </CardContent>
    </Card>
  );
}