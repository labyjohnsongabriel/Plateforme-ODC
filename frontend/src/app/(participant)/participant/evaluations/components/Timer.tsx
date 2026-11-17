'use client';

import { useEffect, useRef, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface Props {
  minutes: number;
  onTimeUp?: () => void;
  /** ISO date de début (optionnel). Sinon démarre maintenant. */
  startedAt?: string;
}

export function Timer({ minutes, onTimeUp, startedAt }: Props) {
  const totalSec = minutes * 60;
  const started = useRef(startedAt ? new Date(startedAt).getTime() : Date.now());
  const [remaining, setRemaining] = useState(() => {
    const elapsed = Math.floor((Date.now() - started.current) / 1000);
    return Math.max(0, totalSec - elapsed);
  });

  useEffect(() => {
    if (remaining <= 0) {
      onTimeUp?.();
      return;
    }
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - started.current) / 1000);
      const left = Math.max(0, totalSec - elapsed);
      setRemaining(left);
      if (left === 0) onTimeUp?.();
    }, 1000);
    return () => clearInterval(id);
  }, [totalSec, onTimeUp, remaining]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const critical = remaining <= 60;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-mono font-semibold ${
        critical
          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse'
          : 'bg-odc-surface-alt text-odc-secondary'
      }`}
    >
      {critical ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <Clock className="h-4 w-4" />
      )}
      {mm}:{ss}
    </div>
  );
}