// src/components/messagerie/DateSeparator.tsx
'use client';

import { cn } from '@/lib/utils';

interface Props {
  date: string | Date;
}

function formatDateLabel(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (sameDay(d, today)) return "Aujourd'hui";
  if (sameDay(d, yesterday)) return 'Hier';

  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

export function DateSeparator({ date }: Props) {
  return (
    <div className="my-4 flex items-center gap-3" role="separator">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-700" />
      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
        {formatDateLabel(date)}
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-700" />
    </div>
  );
}