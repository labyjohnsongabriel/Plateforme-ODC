'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';

interface QueryErrorStateProps {
  onRetry: () => void;
  isRetrying?: boolean;
  description?: string;
}

export function QueryErrorState({
  onRetry,
  isRetrying = false,
  description = "Impossible de charger ces données depuis le serveur. Vérifiez la connexion puis réessayez.",
}: QueryErrorStateProps) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="Chargement impossible"
      description={description}
      size="sm"
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          Réessayer
        </Button>
      }
    />
  );
}
