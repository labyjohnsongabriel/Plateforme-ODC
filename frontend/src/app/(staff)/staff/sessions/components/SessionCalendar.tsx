// src/app/(staff)/staff/sessions/components/SessionCalendar.tsx
'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Session {
  id: string;
  codeSession: string;
  dateDebut: string;
  dateFin?: string;
  statut?: string;
  formation?: { titre?: string | null } | null;
}

function extractSessions(data: unknown): Session[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Session[];
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['sessions', 'data', 'items']) {
      if (Array.isArray(obj[key])) return obj[key] as Session[];
    }
  }
  return [];
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function SessionCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: sessions, isLoading, isError, refetch, isFetching } = useQuery<Session[]>({
    queryKey: ['staff', 'sessions', 'calendar'],
    queryFn: async () => {
      const response = await api.get('/staff/sessions', { params: { limit: 200 } });
      return extractSessions(response.data?.data ?? response.data);
    },
    staleTime: 60_000,
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = (firstDay.getDay() + 6) % 7; // Lundi = 0
  const daysInMonth = lastDay.getDate();

  const monthLabel = currentDate.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const sessionsByDay = useMemo(() => {
    const map = new Map<number, Session[]>();
    const safe = sessions ?? [];

    safe.forEach((s) => {
      try {
        const debut = new Date(s.dateDebut);
        const fin = s.dateFin ? new Date(s.dateFin) : debut;

        // Pour chaque jour entre debut et fin, ajouter la session
        const start = new Date(debut.getFullYear(), debut.getMonth(), debut.getDate());
        const end = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate());

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (d.getFullYear() === year && d.getMonth() === month) {
            const day = d.getDate();
            const arr = map.get(day) ?? [];
            arr.push(s);
            map.set(day, arr);
          }
        }
      } catch {
        // ignore invalid dates
      }
    });

    return map;
  }, [sessions, year, month]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 42 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <QueryErrorState onRetry={() => void refetch()} isRetrying={isFetching} />
        </CardContent>
      </Card>
    );
  }

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarIcon className="h-5 w-5 text-primary" aria-hidden="true" />
          Planning {monthLabel}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="hidden sm:inline-flex"
          >
            Aujourd&apos;hui
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={prevMonth}
            aria-label="Mois précédent"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            aria-label="Mois suivant"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-semibold text-muted-foreground"
            >
              {d}
            </div>
          ))}

          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} aria-hidden="true" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const daySessions = sessionsByDay.get(day) ?? [];
            const isToday =
              today.getFullYear() === year &&
              today.getMonth() === month &&
              today.getDate() === day;

            return (
              <div
                key={day}
                className={cn(
                  'min-h-[80px] rounded-lg border p-2 transition-colors',
                  isToday
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-border hover:bg-accent/50',
                )}
              >
                <p
                  className={cn(
                    'mb-1 text-xs font-medium tabular-nums',
                    isToday ? 'font-bold text-primary' : 'text-foreground',
                  )}
                >
                  {day}
                </p>
                <div className="space-y-0.5">
                  {daySessions.slice(0, 2).map((s) => (
                    <div
                      key={s.id}
                      className="truncate rounded bg-primary px-1 py-0.5 text-[10px] font-medium text-primary-foreground"
                      title={s.formation?.titre ?? s.codeSession}
                    >
                      {s.codeSession}
                    </div>
                  ))}
                  {daySessions.length > 2 && (
                    <p className="text-[10px] font-medium text-muted-foreground">
                      +{daySessions.length - 2} autre
                      {daySessions.length - 2 > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Légende */}
        <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            Sessions planifiées
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary/30" aria-hidden="true" />
            Aujourd&apos;hui
          </div>
        </div>
      </CardContent>
    </Card>
  );
}