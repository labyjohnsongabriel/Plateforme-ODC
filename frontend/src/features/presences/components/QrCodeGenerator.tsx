import { useState, useEffect } from 'react';
import { QrCode, RefreshCw, Clock, Download, CheckCircle, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { PresenceService } from '../services/presence.service';

interface QrCodeGeneratorProps {
  sessionId: string;
  sessionName?: string;
  dureeValidite?: number; // minutes
  autoRefresh?: boolean;
  onGenerated?: (token: string) => void;
}

export function QrCodeGenerator({
  sessionId,
  sessionName,
  dureeValidite = 5,
  autoRefresh = true,
  onGenerated,
}: QrCodeGeneratorProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // ========================================================================
  // Générer le QR Code
  // ========================================================================
  const generate = async () => {
    try {
      setLoading(true);

      const result = await PresenceService.generateQr({
        sessionId,
        dureeValidite,
      });

      setToken(result.token);
      setExpiresAt(new Date(result.expiresAt));
      setQrDataUrl(result.dataUrl);
      onGenerated?.(result.token);

      toast.success('QR Code généré !');
    } catch (err: any) {
      toast.error('Erreur de génération');
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // Compte à rebours
  // ========================================================================
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setTimeLeft(diff);

      if (diff === 0 && autoRefresh) {
        generate();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, autoRefresh]);

  // ========================================================================
  // Générer au démarrage
  // ========================================================================
  useEffect(() => {
    generate();
  }, [sessionId]);

  // ========================================================================
  // Télécharger
  // ========================================================================
  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `qr-session-${sessionId}.png`;
    link.href = qrDataUrl;
    link.click();
    toast.success('QR Code téléchargé');
  };

  // ========================================================================
  // Copier
  // ========================================================================
  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(token);
      toast.success('Token copié');
    } catch {
      toast.error('Impossible de copier');
    }
  };

  // ========================================================================
  // Format temps
  // ========================================================================
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const percentLeft = expiresAt
    ? (timeLeft / (dureeValidite * 60)) * 100
    : 0;

  return (
    <Card padding="lg" className="text-center">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-odc-primary to-odc-primary-dark flex items-center justify-center text-white">
            <QrCode size={22} />
          </div>
          <div className="text-left">
            <h3 className="font-heading font-bold text-lg text-odc-text-light dark:text-odc-text-dark">
              QR Code de présence
            </h3>
            {sessionName && (
              <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
                {sessionName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="relative inline-block mb-6">
        <div className="p-4 bg-white rounded-2xl shadow-odc-md border-2 border-odc-primary/20">
          {loading || !qrDataUrl ? (
            <div className="w-64 h-64 flex items-center justify-center">
              <Loader size="lg" text="Génération..." />
            </div>
          ) : (
            <img
              src={qrDataUrl}
              alt="QR Code de présence"
              className="w-64 h-64 rounded-lg"
            />
          )}
        </div>

        {/* Badge validité */}
        {timeLeft > 0 && (
          <div className="absolute -top-2 -right-2 px-3 py-1.5 rounded-full bg-odc-success text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Live
          </div>
        )}
      </div>

      {/* Timer */}
      {expiresAt && timeLeft > 0 && (
        <div className="mb-6 max-w-xs mx-auto">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center gap-1 text-odc-text-muted-light dark:text-odc-text-muted-dark">
              <Clock size={12} />
              Expire dans
            </span>
            <span className="font-mono font-bold text-odc-primary">
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-odc-primary to-odc-primary-dark rounded-full transition-all duration-1000"
              style={{ width: `${percentLeft}%` }}
            />
          </div>
        </div>
      )}

      {/* Token */}
      {token && (
        <div className="mb-6 p-3 rounded-xl bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark">
          <div className="text-[10px] uppercase tracking-wider text-odc-text-muted-light dark:text-odc-text-muted-dark mb-1">
            Token de session
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs text-odc-text-light dark:text-odc-text-dark truncate">
              {token.substring(0, 40)}...
            </code>
            <button
              onClick={handleCopyToken}
              className="p-1.5 rounded hover:bg-odc-primary-soft transition-colors"
            >
              <Copy size={14} className="text-odc-primary" />
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw size={14} />}
          onClick={generate}
          loading={loading}
        >
          Régénérer
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={<Download size={14} />}
          onClick={handleDownload}
          disabled={!qrDataUrl}
        >
          Télécharger
        </Button>
      </div>

      {/* Instructions */}
      <div className="mt-6 pt-4 border-t border-odc-border-light dark:border-odc-border-dark">
        <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
          📱 Les participants scannent ce QR Code pour valider leur présence.
          Il se renouvelle automatiquement toutes les {dureeValidite} minutes.
        </p>
      </div>
    </Card>
  );
}