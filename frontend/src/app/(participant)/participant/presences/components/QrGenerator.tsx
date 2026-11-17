'use client';

import * as React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  RefreshCw,
  Download,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

/* ============================================================================
   TYPES
   ============================================================================ */

interface QrTokenResponse {
  token: string;
  sessionId: string;
  expiresAt: number;
  expiresIn: number;
}

interface QrGeneratorProps {
  sessionId: string;
  sessionCode: string;
  initialToken?: QrTokenResponse;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function QrGenerator({
  sessionId,
  sessionCode,
  initialToken,
}: QrGeneratorProps) {
  const [tokenData, setTokenData] = React.useState<QrTokenResponse | null>(
    initialToken ?? null,
  );
  const [timeLeft, setTimeLeft] = React.useState(initialToken?.expiresIn ?? 0);
  const [loading, setLoading] = React.useState(!initialToken);
  const [error, setError] = React.useState<string | null>(null);

  const fetchTokenRef = React.useRef<() => Promise<void>>(async () => {});

  /* ─── Fetch token ─── */
  const fetchToken = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<QrTokenResponse>(
        `/sessions/${sessionId}/qr-token`,
      );
      setTokenData(data);
      setTimeLeft(data.expiresIn);
    } catch (e) {
      setError('Impossible de générer le QR code. Réessayez.');
      console.error('[QR Generator]', e);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  fetchTokenRef.current = fetchToken;

  /* ─── Chargement initial ─── */
  React.useEffect(() => {
    if (!initialToken) {
      void fetchToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  /* ─── Timer ─── */
  React.useEffect(() => {
    if (!tokenData) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          void fetchTokenRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tokenData]);

  /* ─── QR data (mémorisé) ─── */
  const qrData = React.useMemo(() => {
    if (!tokenData) return '';
    return JSON.stringify({
      sessionId,
      qrToken: tokenData.token,
    });
  }, [tokenData, sessionId]);

  /* ─── Téléchargement ─── */
  const handleDownload = React.useCallback(() => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg || !tokenData) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${sessionCode}-${tokenData.expiresAt}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessionCode, tokenData]);

  /* ─── Format ─── */
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const isExpired = timeLeft === 0 && !loading && !!tokenData;
  const isUrgent = timeLeft <= 30 && timeLeft > 0;

  /* ==========================================================================
     RENDU
     ========================================================================== */
  return (
    <Card variant="elevated" padding="lg" className="overflow-hidden">
      <span
        aria-hidden="true"
        className="from-odc-500 via-odc-600 to-odc-700 absolute inset-x-0 top-0 h-1 bg-gradient-to-r"
      />

      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="bg-odc-primary/10 text-odc-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-odc-primary/20">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-base font-semibold tracking-tight">
              QR Code de présence
            </h3>
            <p className="text-odc-muted mt-0.5 flex items-center gap-1 text-xs">
              <ShieldCheck className="h-3 w-3" />
              Token signé — valide {formatTime(tokenData?.expiresIn ?? 300)}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 font-mono text-[11px]">
          {sessionCode}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* QR Code */}
        <div
          className={cn(
            'relative flex justify-center rounded-2xl bg-white p-6 shadow-inner transition-opacity duration-300',
            (loading || isExpired) && 'opacity-40',
          )}
        >
          {loading ? (
            <Skeleton className="h-[280px] w-[280px] rounded-xl" />
          ) : tokenData && qrData ? (
            <QRCodeSVG
              id="qr-code-svg"
              value={qrData}
              size={280}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#111827"
              includeMargin={false}
            />
          ) : (
            <div className="text-odc-muted flex h-[280px] w-[280px] items-center justify-center text-sm">
              Aucun token
            </div>
          )}

          {isExpired && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/80 backdrop-blur-sm">
              <AlertCircle className="text-odc-warning h-8 w-8" />
              <p className="text-odc-text-primary text-sm font-semibold">
                Token expiré
              </p>
            </div>
          )}
        </div>

        {/* Code manuel */}
        {tokenData && (
          <div className="border-odc-border bg-odc-surface-alt/50 rounded-xl border p-4 text-center">
            <p className="text-odc-muted text-[10px] font-semibold uppercase tracking-wider">
              Code manuel
            </p>
            <p className="text-odc-primary mt-1.5 break-all font-mono text-sm font-bold tracking-wider">
              {tokenData.token}
            </p>
            <p className="text-odc-muted mt-1.5 text-[11px]">
              Les participants peuvent aussi saisir ce code manuellement
            </p>
          </div>
        )}

        {/* Timer */}
        <div
          className={cn(
            'flex items-center justify-between rounded-xl p-3 transition-colors',
            isUrgent
              ? 'bg-odc-warning/10 ring-1 ring-odc-warning/30'
              : 'bg-odc-info/5 ring-1 ring-odc-info/20',
          )}
        >
          <span
            className={cn(
              'flex items-center gap-2 text-xs font-semibold',
              isUrgent ? 'text-odc-warning' : 'text-odc-info',
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            {isExpired ? 'Renouvellement…' : 'Renouvellement dans'}
          </span>
          <span
            className={cn(
              'font-mono text-sm font-bold tabular-nums',
              isUrgent ? 'text-odc-warning' : 'text-odc-info',
            )}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-odc-error/10 text-odc-error rounded-xl p-3 text-xs">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => void fetchToken()}
            loading={loading}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Régénérer
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={!tokenData || isExpired || loading}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Télécharger
          </Button>
        </div>
      </div>
    </Card>
  );
}