'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode, RefreshCw, Clock, Power, Copy, Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { copyToClipboard } from '@/lib/utils';

interface Props {
  sessionId: string;
  session?: any;
}

export function QrGenerator({ sessionId, session }: Props) {
  const qc = useQueryClient();
  const [qrData, setQrData] = useState<{ token: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/formateur/presences/qr/generer', {
        sessionId,
      });
      return data.data;
    },
    onSuccess: (data) => {
      setQrData(data);
      toast.success('QR code généré (valide 5 minutes)');
      qc.invalidateQueries({ queryKey: ['formateur', 'session', sessionId] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const togglePresenceMutation = useMutation({
    mutationFn: async (ouverte: boolean) => {
      await api.put(`/staff/sessions/${sessionId}/ouvrir-presence`, { ouverte });
    },
    onSuccess: (_, ouverte) => {
      toast.success(ouverte ? 'Présence ouverte' : 'Présence fermée');
      qc.invalidateQueries({ queryKey: ['formateur', 'session', sessionId] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const copyToken = async () => {
    if (!qrData) return;
    const ok = await copyToClipboard(qrData.token);
    if (ok) {
      setCopied(true);
      toast.success('Token copié');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const expireTime = qrData
    ? new Date(qrData.expiresAt).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <QrCode className="h-5 w-5 text-odc-primary" />
            QR Code de présence
          </CardTitle>
          {session?.presenceOuverte && (
            <Badge className="bg-odc-success-bg text-odc-success">
              Ouverte
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {qrData ? (
          <>
            {/* QR Code */}
            <div className="flex justify-center p-4 bg-white rounded-lg border-2 border-odc-primary">
              <QRCodeSVG value={qrData.token} size={256} level="H" />
            </div>

            {/* Expiration */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-odc-muted">
              <Clock className="h-3.5 w-3.5" />
              Expire à <strong>{expireTime}</strong>
            </div>

            {/* Token + Copie */}
            <div className="flex items-center gap-2 bg-odc-surface-alt rounded-lg p-2">
              <code className="flex-1 text-xs truncate font-mono text-left px-2">
                {qrData.token}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToken}
                className="h-8 w-8 shrink-0"
                aria-label="Copier le token"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-odc-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Régénérer
              </Button>
              <Button
                variant={session?.presenceOuverte ? 'destructive' : 'odc'}
                onClick={() =>
                  togglePresenceMutation.mutate(!session?.presenceOuverte)
                }
                disabled={togglePresenceMutation.isPending}
              >
                <Power className="h-4 w-4 mr-2" />
                {session?.presenceOuverte ? 'Fermer' : 'Ouvrir'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center h-[280px] text-odc-muted">
              <QrCode className="h-16 w-16 mb-3 opacity-40" />
              <p className="text-sm">Aucun QR actif</p>
              <p className="text-xs mt-1">
                Cliquez sur « Générer le QR » ci-dessous
              </p>
            </div>
            <Button
              variant="odc"
              className="w-full"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              <QrCode className="h-4 w-4 mr-2" /> Générer le QR
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}