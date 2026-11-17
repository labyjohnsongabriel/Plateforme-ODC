'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  RefreshCw,
  Clock,
  Power,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { copyToClipboard } from '@/lib/utils';
import { cn } from '@/lib/utils';

/* ============================================================================
   TYPES
   ============================================================================ */

interface Props {
  sessionId: string;
  session?: {
    presenceOuverte?: boolean;
    codeSession?: string;
    [key: string]: unknown;
  };
}

interface QrData {
  sessionId: string;
  qrToken: string;
  expiresAt: string;
  expiresIn?: number;
  url: string;
}

/* ============================================================================
   HELPERS
   ============================================================================ */

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function QrGenerator({ sessionId, session }: Props) {
  const qc = useQueryClient();
  const [qrData, setQrData] = useState<QrData | null>(null);
  const [copied, setCopied] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  /* ─── Timer de décompte ─── */
  useEffect(() => {
    if (!qrData) {
      setRemainingSeconds(0);
      return;
    }

    const update = () => {
      setRemainingSeconds(
        Math.max(
          0,
          Math.ceil((new Date(qrData.expiresAt).getTime() - Date.now()) / 1000),
        ),
      );
    };

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [qrData]);

  /* ─── Mutation génération ─── */
  const generateMutation = useMutation({
    mutationFn: async () => {
      // ⭐ URL CORRIGÉE
      const { data } = await api.post<{ data: QrData }>(
        '/presences/qr/generate',
        { sessionId, dureeMinutes: 5 },
      );
      return data.data;
    },
    onSuccess: (data) => {
      setQrData(data);
      toast.success('QR code généré (valide 5 minutes)');
      qc.invalidateQueries({ queryKey: ['formateur', 'session', sessionId] });
    },
    onError: (e) => {
      console.error('[QrGenerator] Erreur génération:', e);
      toast.error(getErrorMessage(e));
    },
  });

  /* ─── Mutation ouverture/fermeture ─── */
  const togglePresenceMutation = useMutation({
    mutationFn: async (ouverte: boolean) => {
      // ⭐ URL CORRIGÉE
      const endpoint = ouverte
        ? `/presences/session/${sessionId}/ouvrir`
        : `/presences/session/${sessionId}/fermer`;
      await api.put(endpoint);
    },
    onSuccess: (_, ouverte) => {
      toast.success(ouverte ? 'Présences ouvertes' : 'Présences fermées');
      if (!ouverte) setQrData(null);
      qc.invalidateQueries({ queryKey: ['formateur', 'session', sessionId] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ─── Copie du token ─── */
  const copyToken = async () => {
    if (!qrData || remainingSeconds <= 0) return;
    const ok = await copyToClipboard(qrData.qrToken);
    if (ok) {
      setCopied(true);
      toast.success('Token copié');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /* ─── Dérivés ─── */
  const expireTime = qrData
    ? new Date(qrData.expiresAt).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const isExpired = Boolean(qrData && remainingSeconds <= 0);
  const isOpen = session?.presenceOuverte === true;
  const isUrgent = remainingSeconds > 0 && remainingSeconds <= 30;

  /* ==========================================================================
     RENDU
     ========================================================================== */
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
              Token signé HMAC
            </p>
          </div>
        </div>

        {isOpen ? (
          <Badge className="bg-odc-success/10 text-odc-success ring-1 ring-odc-success/20">
            <span className="bg-odc-success mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full" />
            Ouverte
          </Badge>
        ) : (
          <Badge className="bg-odc-surface-alt text-odc-muted ring-1 ring-odc-border">
            Fermée
          </Badge>
        )}
      </div>

      {/* ═══════════════════ ID SESSION ═══════════════════ */}
      <div className="bg-odc-surface-alt/50 ring-1 ring-odc-border/40 mb-4 rounded-xl p-3">
        <p className="text-odc-muted mb-1 text-[10px] font-semibold uppercase tracking-wider">
          ID session (saisie manuelle)
        </p>
        <code className="text-odc-text-primary select-all break-all font-mono text-xs">
          {sessionId}
        </code>
      </div>

      {/* ═══════════════════ CONTENU ═══════════════════ */}
      {qrData ? (
        <>
          {/* QR Code / Expiré */}
          {isExpired ? (
            <div
              role="status"
              className="bg-odc-warning/5 ring-1 ring-odc-warning/30 flex h-[280px] flex-col items-center justify-center rounded-2xl p-6 text-center"
            >
              <div className="bg-odc-warning/10 text-odc-warning mb-3 flex h-14 w-14 items-center justify-center rounded-full">
                <Clock className="h-7 w-7" />
              </div>
              <p className="text-odc-warning text-sm font-semibold">
                QR code expiré
              </p>
              <p className="text-odc-muted mt-1 max-w-[240px] text-xs">
                Générez un nouveau code pour continuer les saisies
              </p>
            </div>
          ) : (
            <div className="flex justify-center rounded-2xl bg-white p-6 shadow-inner">
              <QRCodeSVG
                value={qrData.url}
                size={256}
                level="H"
                bgColor="#FFFFFF"
                fgColor="#111827"
                includeMargin={false}
              />
            </div>
          )}

          {/* Timer */}
          <div
            className={cn(
              'mt-4 flex items-center justify-between rounded-xl p-3 transition-colors',
              isExpired
                ? 'bg-odc-error/5 ring-1 ring-odc-error/20'
                : isUrgent
                  ? 'bg-odc-warning/10 ring-1 ring-odc-warning/30'
                  : 'bg-odc-info/5 ring-1 ring-odc-info/20',
            )}
          >
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
              {isExpired ? 'Code expiré' : 'Expire dans'}
            </span>
            {!isExpired && (
              <span
                className={cn(
                  'font-mono text-sm font-bold tabular-nums',
                  isUrgent ? 'text-odc-warning' : 'text-odc-info',
                )}
              >
                {formatCountdown(remainingSeconds)}
                <span className="text-odc-muted ml-2 text-[10px] font-normal">
                  ({expireTime})
                </span>
              </span>
            )}
          </div>

          {/* Token copiable */}
          {!isExpired && (
            <div className="bg-odc-surface-alt/50 ring-1 ring-odc-border/40 mt-3 flex items-center gap-2 rounded-xl p-2">
              <code className="text-odc-text-primary flex-1 truncate px-2 text-left font-mono text-[11px]">
                {qrData.qrToken}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToken}
                className="h-8 w-8 shrink-0"
                aria-label="Copier le token"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              loading={generateMutation.isPending}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              {isExpired ? 'Nouveau QR' : 'Régénérer'}
            </Button>
            <Button
              variant={isOpen ? 'destructive' : 'brand'}
              onClick={() => togglePresenceMutation.mutate(!isOpen)}
              disabled={togglePresenceMutation.isPending}
              loading={togglePresenceMutation.isPending}
              leftIcon={<Power className="h-4 w-4" />}
            >
              {isOpen ? 'Fermer' : 'Ouvrir'}
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Aucun QR */}
          <div className="border-odc-border/60 flex h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed">
            <div className="bg-odc-primary/5 mb-3 flex h-16 w-16 items-center justify-center rounded-full">
              <QrCode className="text-odc-primary/40 h-8 w-8" />
            </div>
            <p className="text-odc-text-primary text-sm font-medium">
              Aucun QR actif
            </p>
            <p className="text-odc-muted mt-1 max-w-[200px] text-center text-xs">
              {!isOpen
                ? 'Ouvrez d\'abord les présences'
                : 'Cliquez sur « Générer le QR » ci-dessous'}
            </p>
          </div>

          {/* Actions initiales */}
          <div className="mt-4 space-y-2">
            {!isOpen && (
              <Button
                variant="brand"
                fullWidth
                onClick={() => togglePresenceMutation.mutate(true)}
                disabled={togglePresenceMutation.isPending}
                loading={togglePresenceMutation.isPending}
                leftIcon={<Power className="h-4 w-4" />}
              >
                Ouvrir les présences
              </Button>
            )}
            <Button
              variant="outline"
              fullWidth
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending || !isOpen}
              loading={generateMutation.isPending}
              leftIcon={<QrCode className="h-4 w-4" />}
            >
              Générer le QR
            </Button>
          </div>
        </>
      )}

      {/* Footer info */}
      {!isOpen && (
        <div className="bg-odc-info/5 ring-1 ring-odc-info/20 mt-4 flex items-start gap-2 rounded-xl p-3">
          <AlertCircle className="text-odc-info mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p className="text-odc-info text-xs">
            Les présences doivent être ouvertes pour générer un QR code
          </p>
        </div>
      )}
    </Card>
  );
}