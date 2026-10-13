'use client';

import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export function SessionCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['staff', 'sessions', 'calendar'],
    queryFn: async () => {
      const { data } = await api.get('/staff/sessions', { params: { limit: 200 } });
      return data.data as any[];
    },
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

  const getSessionsForDay = (day: number) => {
    const date = new Date(year, month, day);
    return (sessions ?? []).filter((s: any) => {
      const debut = new Date(s.dateDebut);
      const fin = new Date(s.dateFin);
      return date >= new Date(debut.toDateString()) && date <= new Date(fin.toDateString());
    });
  };

  if (isLoading) return <Skeleton className="h-96" />;

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-odc-primary" />
          Planning {monthLabel}
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Mois précédent">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Mois suivant">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-odc-muted py-2">
              {d}
            </div>
          ))}

          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const daySessions = getSessionsForDay(day);
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
                    ? 'border-odc-primary bg-odc-primary-soft/30'
                    : 'border-odc-border hover:bg-odc-surface-alt',
                )}
              >
                <p className={cn('text-xs font-medium mb-1', isToday && 'text-odc-primary')}>
                  {day}
                </p>
                <div className="space-y-0.5">
                  {daySessions.slice(0, 2).map((s: any) => (
                    <div
                      key={s.id}
                      className="text-[10px] truncate px-1 py-0.5 rounded bg-odc-primary text-white"
                      title={s.formation?.titre}
                    >
                      {s.codeSession}
                    </div>
                  ))}
                  {daySessions.length > 2 && (
                    <p className="text-[10px] text-odc-muted">
                      +{daySessions.length - 2} autre(s)
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}