'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, Users, TrendingUp, Download, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { QrGenerator } from './QrGenerator';
import { PresencesTable } from './PresencesTable';
import { ManualPresence } from './ManualPresence';

interface Props { sessionId: string }

export function PresenceSession({ sessionId }: Props) {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ['formateur', 'session', sessionId],
    queryFn: async () => {
      const { data } = await api.get(`/formateur/sessions/${sessionId}`);
      return data.data;
    },
  });

  const { data: presences, isLoading } = useQuery({
    queryKey: ['formateur', 'presences', sessionId],
    queryFn: async () => {
      const { data } = await api.get(`/formateur/presences/session/${sessionId}`, {
        params: { limit: 200 },
      });
      return data.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['formateur', 'presences', sessionId, 'stats'],
    queryFn: async () => {
      const { data } = await api.get(`/formateur/presences/stats/${sessionId}`);
      return data.data;
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get(`/admin/exports/session/${sessionId}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presences-${session?.codeSession ?? sessionId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export téléchargé');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
      </Button>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Feuille de présence
          </h1>
          {session && (
            <p className="text-odc-muted mt-1">
              {session.codeSession} — {session.formation?.titre}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => qc.invalidateQueries({ queryKey: ['formateur', 'presences', sessionId] })}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Rafraîchir
          </Button>
          <Button
            variant="outline"
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Présents" value={stats?.presents ?? 0} color="success" />
        <StatCard label="Absents" value={stats?.absents ?? 0} color="error" />
        <StatCard label="Retards" value={stats?.retards ?? 0} color="warning" />
        <StatCard
          label="Taux de présence"
          value={`${stats?.tauxPresence ?? 0}%`}
          color="primary"
        />
      </div>

      {/* QR + Table */}
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <div className="space-y-6">
          <QrGenerator sessionId={sessionId} session={session} />
          <ManualPresence sessionId={sessionId} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-odc-primary" />
              Participants ({presences?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : (
              <PresencesTable
                sessionId={sessionId}
                presences={presences ?? []}
                onRefresh={() =>
                  qc.invalidateQueries({ queryKey: ['formateur', 'presences', sessionId] })
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: 'success' | 'error' | 'warning' | 'primary';
}) {
  const colors = {
    success: 'bg-odc-success-bg text-odc-success',
    error: 'bg-odc-error-bg text-odc-error',
    warning: 'bg-odc-warning-bg text-odc-warning',
    primary: 'bg-odc-primary-soft text-odc-primary',
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
          <TrendingUp className="h-5 w-5" />
        </div>
        <p className="text-3xl font-display font-bold">{value}</p>
        <p className="text-sm text-odc-muted mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}