'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, QrCode, RefreshCw, Download, Users,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';
import { PresencesTable } from './PresencesTable';
import { PresenceStats } from './PresenceStats';

export function PresenceSession({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [qrData, setQrData] = useState<{ token: string; expiresAt: string } | null>(null);

  const { data: session } = useQuery({
    queryKey: ['staff', 'session', sessionId],
    queryFn: async () => {
      const { data } = await api.get(`/staff/sessions/${sessionId}`);
      return data.data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['staff', 'presences', sessionId],
    queryFn: async () => {
      const { data } = await api.get(`/staff/presences/session/${sessionId}`, {
        params: { limit: 200 },
      });
      return data;
    },
  });

  const generateQrMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/staff/presences/qr/generer', { sessionId });
      return data.data;
    },
    onSuccess: (data) => {
      setQrData(data);
      toast.success('QR généré (valide 5 min)');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get(
        `/admin/exports/session/${sessionId}/pdf`,
        { responseType: 'blob' },
      );
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
              {session.formation?.titre} • {formatDate(session.dateDebut)}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => exportMutation.mutate()}
          disabled={exportMutation.isPending}
        >
          <Download className="h-4 w-4 mr-2" /> Exporter PDF
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* QR CODE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-5 w-5 text-odc-primary" />
              QR Code de présence
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {qrData ? (
              <>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <QRCodeSVG value={qrData.token} size={256} level="H" />
                </div>
                <p className="text-xs text-odc-muted">
                  Expire à{' '}
                  {new Date(qrData.expiresAt).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => generateQrMutation.mutate()}
                  disabled={generateQrMutation.isPending}
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Régénérer
                </Button>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center h-[280px] text-odc-muted">
                  <QrCode className="h-16 w-16 mb-3 opacity-40" />
                  <p className="text-sm">Aucun QR actif</p>
                </div>
                <Button
                  variant="odc"
                  className="w-full"
                  onClick={() => generateQrMutation.mutate()}
                  disabled={generateQrMutation.isPending}
                >
                  <QrCode className="h-4 w-4 mr-2" /> Générer le QR
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* STATS + TABLE */}
        <div className="space-y-4">
          <PresenceStats presences={data?.data ?? []} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-odc-primary" />
                Participants ({data?.pagination?.total ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : (
                <PresencesTable
                  sessionId={sessionId}
                  presences={data?.data ?? []}
                  onRefresh={() =>
                    qc.invalidateQueries({ queryKey: ['staff', 'presences', sessionId] })
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}