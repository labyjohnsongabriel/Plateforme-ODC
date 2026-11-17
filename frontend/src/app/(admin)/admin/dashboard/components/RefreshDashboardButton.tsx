// src/app/(admin)/admin/dashboard/components/RefreshDashboardButton.tsx
'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'refreshing' | 'done';

export function RefreshDashboardButton() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>('idle');

  const refreshDashboard = async () => {
    if (status === 'refreshing') return;
    setStatus('refreshing');

    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] }),
      ]);
      setStatus('done');
      // Retour visuel 1,2 s, puis état neutre
      window.setTimeout(() => setStatus('idle'), 1200);
    } catch {
      setStatus('idle');
    }
  };

  const isRefreshing = status === 'refreshing';
  const isDone = status === 'done';

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => { void refreshDashboard(); }}
      disabled={isRefreshing}
      aria-label={isRefreshing ? 'Actualisation en cours' : 'Actualiser le tableau de bord'}
      aria-live="polite"
      className={cn(
        'group gap-2 transition-all',
        'hover:border-primary/40 hover:bg-accent/50',
        isDone && 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-50',
        isDone && 'dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/10',
      )}
    >
      {isDone ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <RefreshCw
          className={cn('h-4 w-4 transition-transform', isRefreshing && 'animate-spin')}
          aria-hidden="true"
        />
      )}
      <span>{isDone ? 'À jour' : isRefreshing ? 'Actualisation…' : 'Actualiser'}</span>
    </Button>
  );
}