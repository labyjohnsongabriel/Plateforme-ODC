// src/app/(staff)/staff/presences/[sessionId]/components/PresenceSession.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  QrCode,
  RefreshCw,
  Download,
  Users,
  Power,
  Loader2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';
import { PresencesTable } from './PresencesTable';
import { PresenceStats } from './PresenceStats';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface SessionData {
  id: string;
  codeSession: string;
  dateDebut: string;
  presenceOuverte: boolean;
  formation?: { titre: string } | null;
}

interface Participant {
  id: string;
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
}

interface PresenceData {
  data: Array<{
    id: string;
    participantId: string;
    statut: string;
    methode?: string;
    scanneLe?: string;
    present?: boolean;
    participant?: Participant;
  }>;
  pagination?: { total?: number };
}

interface QrData {
  sessionId: string;
  qrToken: string;
  expiresAt: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function PresenceSession({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [qrData, setQrData] = useState<QrData | null>(null);

  /* ─── Query session ─── */
  const sessionQuery = useQuery<SessionData>({
    queryKey: ['staff', 'session', sessionId],
    queryFn: async () => {
      const { data } = await api.get(`/staff/sessions/${sessionId}`);
      return data.data;
    },
  });

  /* ─── Query participants ─── */
  const participantsQuery = useQuery<Participant[]>({
    queryKey: ['staff', 'session', sessionId, 'participants'],
    queryFn: async () => {
      const { data } = await api.get(`/staff/sessions/${sessionId}/participants`);
      const root = data?.data ?? data;
      if (Array.isArray(root)) return root;
      if (Array.isArray(root?.participants)) return root.participants;
      if (Array.isArray(root?.data)) return root.data;
      return [];
    },
  });

  /* ─── Query présences ─── */
  const presencesQuery = useQuery<PresenceData>({
    queryKey: ['staff', 'presences', sessionId],
    queryFn: async () => {
      const { data } = await api.get(`/staff/presences/session/${sessionId}`, {
        params: { limit: 200 },
      });
      return data;
    },
  });

  /* ─── Mutations ─── */
  const generateQrMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/staff/presences/qr/generer', { sessionId });
      return data.data as QrData;
    },
    onSuccess: (data) => {
      setQrData(data);
      toast.success('QR généré (valide 5 min)');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const togglePresenceMutation = useMutation({
    mutationFn: async (ouverte: boolean) => {
      await api.put(`/staff/sessions/${sessionId}/ouvrir-presence`, { ouverte });
    },
    onSuccess: (_, ouverte) => {
      toast.success(ouverte ? 'Présences ouvertes' : 'Présences fermées');
      if (!ouverte) setQrData(null);
      qc.invalidateQueries({ queryKey: ['staff', 'session', sessionId] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get(`/admin/exports/session/${sessionId}/pdf`, {
        responseType: 'blob',
      });
      return response.data as Blob;
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

  const session = sessionQuery.data;
  const participants = participantsQuery.data ?? [];
  const data = presencesQuery.data;
  const isLoading = presencesQuery.isLoading || participantsQuery.isLoading;

  if (sessionQuery.isError || participantsQuery.isError || presencesQuery.isError) {
    return (
      <QueryErrorState
        onRetry={() =>
          void Promise.all([
            sessionQuery.refetch(),
            participantsQuery.refetch(),
            presencesQuery.refetch(),
          ])
        }
        isRetrying={
          sessionQuery.isFetching ||
          participantsQuery.isFetching ||
          presencesQuery.isFetching
        }
        description="Impossible de charger cette feuille de présence. Vérifiez vos droits et réessayez."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Retour
      </Button>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
            Feuille de présence
          </h1>
          {session && (
            <p className="mt-1 text-muted-foreground">
              {session.formation?.titre} • {formatDate(session.dateDebut)}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => exportMutation.mutate()}
          disabled={exportMutation.isPending}
        >
          {exportMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          Exporter PDF
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* QR CODE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-5 w-5 text-primary" aria-hidden="true" />
              QR Code de présence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            {qrData ? (
              <>
                <div className="flex justify-center rounded-lg bg-white p-4">
                  <QRCodeSVG
                    value={JSON.stringify({
                      sessionId: qrData.sessionId,
                      qrToken: qrData.qrToken,
                    })}
                    size={256}
                    level="H"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Expire à{' '}
                  {new Date(qrData.expiresAt).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => generateQrMutation.mutate()}
                    disabled={generateQrMutation.isPending}
                  >
                    {generateQrMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                    )}
                    Régénérer
                  </Button>
                  <Button
                    variant={session?.presenceOuverte ? 'destructive' : 'default'}
                    onClick={() =>
                      togglePresenceMutation.mutate(!session?.presenceOuverte)
                    }
                    disabled={togglePresenceMutation.isPending}
                    className={
                      !session?.presenceOuverte
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : undefined
                    }
                  >
                    <Power className="mr-2 h-4 w-4" aria-hidden="true" />
                    {session?.presenceOuverte ? 'Fermer' : 'Ouvrir'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-[280px] flex-col items-center justify-center text-muted-foreground">
                  <QrCode className="mb-3 h-16 w-16 opacity-40" aria-hidden="true" />
                  <p className="text-sm">Aucun QR actif</p>
                </div>
                <div className="space-y-2">
                  {!session?.presenceOuverte && (
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => togglePresenceMutation.mutate(true)}
                      disabled={togglePresenceMutation.isPending}
                    >
                      <Power className="mr-2 h-4 w-4" aria-hidden="true" />
                      Ouvrir les présences
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => generateQrMutation.mutate()}
                    disabled={generateQrMutation.isPending || !session?.presenceOuverte}
                  >
                    <QrCode className="mr-2 h-4 w-4" aria-hidden="true" />
                    Générer le QR
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* STATS + TABLE */}
        <div className="space-y-4">
          <PresenceStats
            presences={data?.data ?? []}
            participantsCount={participants.length}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                Participants ({participants.length || data?.pagination?.total || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : (
                <PresencesTable
                  sessionId={sessionId}
                  presences={data?.data ?? []}
                  participants={participants}
                  onRefresh={() =>
                    void Promise.all([
                      qc.invalidateQueries({ queryKey: ['staff', 'presences', sessionId] }),
                      qc.invalidateQueries({ queryKey: ['staff', 'presences', sessionId, 'stats'] }),
                    ])
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