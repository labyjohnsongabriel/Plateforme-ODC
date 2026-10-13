// src/components/shared/FilterBar.tsx
'use client';

import * as React from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

interface FilterBarProps {
  children: React.ReactNode;
  activeFilters?: ActiveFilter[];
  onRemoveFilter?: (key: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function FilterBar({
  children,
  activeFilters = [],
  onRemoveFilter,
  onClearAll,
  className,
}: FilterBarProps) {
  const hasActive = activeFilters.length > 0;

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-odc-muted" />
          <span className="text-sm font-medium">Filtres</span>
          {hasActive && (
            <Badge variant="secondary" className="text-xs">
              {activeFilters.length}
            </Badge>
          )}
          {hasActive && onClearAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="ml-auto text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {children}
        </div>

        {hasActive && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-odc-border">
            {activeFilters.map((f) => (
              <Badge
                key={f.key}
                variant="secondary"
                className="text-xs gap-1.5 pr-1"
              >
                <span>
                  <span className="text-odc-muted">{f.label} :</span> {f.value}
                </span>
                {onRemoveFilter && (
                  <button
                    onClick={() => onRemoveFilter(f.key)}
                    className="ml-1 rounded-full hover:bg-odc-border/50 p-0.5"
                    aria-label={`Retirer le filtre ${f.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}