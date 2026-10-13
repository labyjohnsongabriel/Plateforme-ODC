// src/components/shared/BulkActions.tsx
'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BulkAction {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'odc';
  disabled?: boolean;
}

interface BulkActionsProps {
  selectedCount: number;
  actions: BulkAction[];
  onClear?: () => void;
  className?: string;
}

export function BulkActions({
  selectedCount,
  actions,
  onClear,
  className,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'sticky top-0 z-10 flex flex-wrap items-center gap-3 p-3 rounded-lg bg-odc-primary-soft/40 border border-odc-primary/30 shadow-odc-sm animate-slide-down',
        className,
      )}
      role="region"
      aria-label="Actions groupées"
    >
      <span className="text-sm font-medium text-odc-primary">
        {selectedCount} élément{selectedCount > 1 ? 's' : ''} sélectionné
        {selectedCount > 1 ? 's' : ''}
      </span>

      <div className="flex flex-wrap gap-2 ml-auto">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Button
              key={i}
              variant={action.variant ?? 'outline'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {Icon && <Icon className="h-3.5 w-3.5 mr-1.5" />}
              {action.label}
            </Button>
          );
        })}

        {onClear && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-3.5 w-3.5 mr-1.5" />
            Annuler
          </Button>
        )}
      </div>
    </div>
  );
}