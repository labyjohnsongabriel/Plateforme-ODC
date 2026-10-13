'use client';

import { useQuery } from '@tanstack/react-query';
import {
  QrCode, Calendar, MapPin, CheckCircle2, XCircle, Clock, Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/formatters';

const STATUT_COLORS: Record<string, string> = {
  PRESENT: 'bg-odc-success-bg text-odc-success',
  ABSENT: 'bg-odc-error-bg text-odc-error',
  RETARD: 'bg-odc-warning-bg text-odc-warning',
  EXCUSE: 'bg-odc-surface-alt text-odc-muted',
};

const STATUT_LABELS: Record<string, string> = {
  PRESENT: 'Présent',
  ABSENT: 'Absent',
  RETARD: 'Retard',
  EXCUSE: 'Excusé',
};

export function MyPresencesList() {
  const { data, isLoading } = useQuery({
    queryKey: ['participant', 'presences'],
    queryFn: async () => {
      const { data } = await api.get('/participant/presences');
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const presences = data ?? [];

  if (!presences.length) {
    return (
      <Card>
        <EmptyState
          icon={QrCode}
          title="Aucune présence"
          description="Vous n'avez encore assisté à aucune session."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {presences.map((p: any) => (
        <Card key={p.id} className="hover:shadow-odc-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-[240px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_COLORS[p.statut]}`}>
                    {p.statut === 'PRESENT' ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : p.statut === 'ABSENT' ? (
                      <XCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {STATUT_LABELS[p.statut]}
                  </span>
                  <span className="text-xs text-odc-muted font-mono">
                    {p.session?.codeSession}
                  </span>
                </div>

                <h3 className="font-display font-semibold mb-2">
                  {p.session?.formation?.titre}
                </h3>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-odc-muted">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-odc-primary" />
                    {formatDate(p.datePresence)}
                  </span>
                  {p.session?.lieu && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-odc-primary" />
                      {p.session.lieu}
                    </span>
                  )}
                  {p.scanneLe && (
                    <span className="flex items-center gap-1.5 text-xs">
                      <Clock className="h-3 w-3" />
                      Scanné : {formatDateTime(p.scanneLe)}
                    </span>
                  )}
                </div>
              </div>

              <Badge variant="outline" className="text-xs shrink-0">
                {p.methode === 'QR_CODE' ? '📷 QR Code' : '✍️ Manuel'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}