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
  Copy,
  Check,
  Lock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { copyToClipboard } from '@/lib/utils';
import { toast } from 'sonner';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface QrTokenResponse {
  token: string;
  sessionId: string;
  expiresAt: number;
  expiresIn: number;
}

interface QrGeneratorProps {
  sessionId: string;
  sessionCode: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function QrGenerator({ sessionId, sessionCode }: QrGeneratorProps) {
  const [token, setToken] = React.useState<QrTokenResponse | null>(null);
  const [timeLeft, setTimeLeft] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  /* ⭐ Ref pour éviter les fuites mémoire */
  const fetchTokenRef = React.useRef<() => Promise<void>>(async () => {});

  /* ─── Chargement token ─── */
  const fetchToken = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<QrTokenResponse>(
        `/sessions/${sessionId}/qr-token`,
      );
      setToken(data);
      setTimeLeft(data.expiresIn);
    } catch (e) {
      setError('Impossible de générer le QR code. Réessayez.');
      console.error('[QrGenerator] Erreur:', e);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  fetchTokenRef.current = fetchToken;

  /* ─── Chargement initial ─── */
  React.useEffect(() => {
    void fetchToken();
  }, [fetchToken]);

  /* ─── Timer ─── */
  React.useEffect(() => {
    if (!token) return;

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
  }, [token]);

  /* ─── QR data ─── */
  const qrData = React.useMemo(() => {
    if (!token) return '';
    return JSON.stringify({
      sessionId,
      qrToken: token.token,
    });
  }, [token, sessionId]);

  /* ─── Téléchargement ─── */
  const handleDownload = React.useCallback(() => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg || !token) return;

    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${sessionCode}-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('QR code téléchargé');
    } catch {
      toast.error('Erreur lors du téléchargement');
    }
  }, [sessionCode, token]);

  /* ─── Copie du token ─── */
  const handleCopyToken = React.useCallback(async () => {
    if (!token) return;
    const ok = await copyToClipboard(token.token);
    if (ok) {
      setCopied(true);
      toast.success('Token copié');
      setTimeout(() => setCopied(false), 2000);
    }
  }, [token]);

  /* ─── Formatage ─── */
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const isExpired = timeLeft === 0 && !loading && !!token;
  const isUrgent = timeLeft <= 30 && timeLeft > 0;
  const progressPercent = token
    ? (timeLeft / token.expiresIn) * 100
    : 100;

  /* ══════════════════════════════════════════════════════════════════════════
     RENDU
     ══════════════════════════════════════════════════════════════════════════ */
  return (
    <Card variant="elevated" padding="lg" className="overflow-hidden">
      {/* Bandeau gradient top */}
      <span
        aria-hidden="true"
        className="from-odc-500 via-odc-600 to-odc-700 absolute inset-x-0 top-0 h-1 bg-gradient-to-r"
      />

      {/* ═══════════════════ HEADER ═══════════════════ */}
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
              Token signé HMAC — inviolable
            </p>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 font-mono text-[11px]">
          {sessionCode}
        </Badge>
      </div>

      <div className="space-y-4">
        {/* ═══════════════════ QR CODE ═══════════════════ */}
        <div
          className={cn(
            'relative flex justify-center rounded-2xl bg-white p-6 shadow-inner transition-opacity duration-300',
            (loading || isExpired) && 'opacity-40',
          )}
        >
          {loading ? (
            <Skeleton className="h-[280px] w-[280px] rounded-xl" />
          ) : token && qrData ? (
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

          {/* Overlay expiré */}
          {isExpired && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/80 backdrop-blur-sm">
              <AlertCircle className="text-odc-warning h-8 w-8" />
              <p className="text-odc-text-primary text-sm font-semibold">
                Token expiré
              </p>
              <p className="text-odc-muted text-xs">
                Renouvellement en cours…
              </p>
            </div>
          )}
        </div>

        {/* ═══════════════════ CODE MANUEL ═══════════════════ */}
        <div className="border-odc-border bg-odc-surface-alt/50 rounded-xl border p-4">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-odc-muted flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider">
              <Lock className="h-2.5 w-2.5" />
              Code manuel
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyToken}
              disabled={!token || isExpired}
              className="h-7 w-7"
              aria-label="Copier le token"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          <p className="text-odc-primary break-all font-mono text-sm font-bold tracking-wider">
            {token?.token ?? '—'}
          </p>
          <p className="text-odc-muted mt-1.5 text-[11px]">
            Les participants peuvent saisir ce code manuellement
          </p>
        </div>

        {/* ═══════════════════ TIMER ═══════════════════ */}
        <div
          className={cn(
            'rounded-xl p-3 transition-colors',
            isExpired
              ? 'bg-odc-error/5 ring-1 ring-odc-error/20'
              : isUrgent
                ? 'bg-odc-warning/10 ring-1 ring-odc-warning/30'
                : 'bg-odc-info/5 ring-1 ring-odc-info/20',
          )}
        >
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'flex items-center gap-2 text-xs font-semibold',
                isExpired
                  ? 'text-odc-error'
                  : isUrgent
                    ? 'text-odc-warning'
                    : 'text-odc-info',
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              {isExpired ? 'Renouvellement…' : 'Expire dans'}
            </span>
            <span
              className={cn(
                'font-mono text-sm font-bold tabular-nums',
                isExpired
                  ? 'text-odc-error'
                  : isUrgent
                    ? 'text-odc-warning'
                    : 'text-odc-info',
              )}
            >
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Barre de progression */}
          {token && !isExpired && (
            <div className="bg-odc-border/40 mt-2 h-1 overflow-hidden rounded-full">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-1000',
                  isUrgent
                    ? 'bg-odc-warning'
                    : 'bg-gradient-to-r from-odc-500 to-odc-700',
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* ═══════════════════ ERREUR ═══════════════════ */}
        {error && (
          <div className="bg-odc-error/10 text-odc-error flex items-start gap-2 rounded-xl p-3 text-xs">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ═══════════════════ ACTIONS ═══════════════════ */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => void fetchToken()}
            loading={loading}
            disabled={loading}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Régénérer
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={!token || isExpired || loading}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Télécharger
          </Button>
        </div>
      </div>
    </Card>
  );
}