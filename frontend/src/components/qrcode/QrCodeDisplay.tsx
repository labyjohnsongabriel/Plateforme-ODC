import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, RefreshCw } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { toast } from '@/components/common/Toast';
import { cn } from '@/utils/cn';

export interface QrCodeDisplayProps {
  value: string;
  size?: number;
  title?: string;
  description?: string;
  downloadable?: boolean;
  copyable?: boolean;
  color?: string;
  backgroundColor?: string;
  onRefresh?: () => void;
  className?: string;
}

export function QrCodeDisplay({
  value,
  size = 300,
  title,
  description,
  downloadable = true,
  copyable = true,
  color = '#FF7900',
  backgroundColor = '#FFFFFF',
  onRefresh,
  className,
}: QrCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================================================
  // Générer le QR Code
  // ========================================================================
  useEffect(() => {
    const generateQr = async () => {
      if (!canvasRef.current || !value) return;

      try {
        setLoading(true);
        setError(null);

        await QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: color,
            light: backgroundColor,
          },
        });
      } catch (err: any) {
        setError('Erreur de génération du QR Code');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    generateQr();
  }, [value, size, color, backgroundColor]);

  // ========================================================================
  // Télécharger
  // ========================================================================
  const handleDownload = () => {
    if (!canvasRef.current) return;

    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = url;
    link.click();

    toast.success('QR Code téléchargé');
  };

  // ========================================================================
  // Copier la valeur
  // ========================================================================
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copié dans le presse-papiers');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Impossible de copier');
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <Card className={cn('text-center', className)}>
      {title && (
        <h3 className="font-heading font-bold text-lg mb-1 text-odc-text-light dark:text-odc-text-dark">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark mb-4">
          {description}
        </p>
      )}

      {/* QR Code */}
      <div
        className={cn(
          'relative inline-flex items-center justify-center mx-auto rounded-2xl p-4',
          'bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark',
          'border-2 border-dashed border-odc-border-light dark:border-odc-border-dark'
        )}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-odc-surface-dark/80 rounded-2xl z-10">
            <Loader size="md" />
          </div>
        )}

        {error ? (
          <div className="w-[300px] h-[300px] flex items-center justify-center text-odc-error text-sm">
            {error}
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="rounded-lg shadow-odc-sm"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="absolute top-2 right-2 p-2 rounded-lg bg-white dark:bg-odc-surface-dark shadow-odc-sm hover:shadow-odc-md transition-all"
            title="Rafraîchir"
          >
            <RefreshCw size={14} className="text-odc-primary" />
          </button>
        )}
      </div>

      {/* Valeur encodée */}
      <div className="mt-4 p-3 bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded-lg">
        <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mb-1">
          Valeur encodée :
        </p>
        <p className="text-xs font-mono break-all text-odc-text-light dark:text-odc-text-dark">
          {value.length > 100 ? `${value.substring(0, 100)}...` : value}
        </p>
      </div>

      {/* Actions */}
      {(downloadable || copyable) && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {downloadable && (
            <Button
              variant="primary"
              size="sm"
              icon={<Download size={14} />}
              onClick={handleDownload}
              disabled={loading || !!error}
            >
              Télécharger
            </Button>
          )}
          {copyable && (
            <Button
              variant="secondary"
              size="sm"
              icon={copied ? <Check size={14} /> : <Copy size={14} />}
              onClick={handleCopy}
              disabled={loading || !!error}
            >
              {copied ? 'Copié !' : 'Copier'}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}