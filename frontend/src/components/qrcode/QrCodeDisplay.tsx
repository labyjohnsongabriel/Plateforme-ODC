// src/components/qr/QrCodeDisplay.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/* ============================================================================
   TYPES
   ============================================================================ */

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrCodeDisplayProps {
  value: string;
  size?: number;
  title?: string;
  description?: string;
  downloadable?: boolean;
  copyable?: boolean;
  color?: string;
  backgroundColor?: string;
  /** ⭐ Nouveau : niveau de correction d'erreur */
  errorCorrectionLevel?: ErrorCorrectionLevel;
  onRefresh?: () => void;
  className?: string;
}

/* ============================================================================
   CONSTANTES
   ============================================================================ */

const MIN_SIZE = 100;
const MAX_SIZE = 1000;

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function QrCodeDisplay({
  value,
  size = 300,
  title,
  description,
  downloadable = true,
  copyable = true,
  color = '#FF7900',
  backgroundColor = '#FFFFFF',
  errorCorrectionLevel = 'H',
  onRefresh,
  className,
}: QrCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ⭐ Normaliser la taille
  const safeSize = Math.min(MAX_SIZE, Math.max(MIN_SIZE, Number(size) || 300));

  /* ==========================================================================
     GÉNÉRATION DU QR CODE
     ========================================================================== */
  useEffect(() => {
    let cancelled = false;

    const generateQr = async () => {
      if (!canvasRef.current || !value || value === 'placeholder') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        await QRCode.toCanvas(canvasRef.current, value, {
          width: safeSize,
          margin: 2,
          errorCorrectionLevel,
          color: {
            dark: color,
            light: backgroundColor,
          },
        });

        if (cancelled) return;
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(`Erreur de génération : ${msg}`);
        console.error('[QR Display]', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void generateQr();

    return () => {
      cancelled = true;
    };
  }, [value, safeSize, color, backgroundColor, errorCorrectionLevel]);

  /* ==========================================================================
     TÉLÉCHARGEMENT
     ========================================================================== */
  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;

    try {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qrcode-${Date.now()}.png`;
      link.href = url;
      link.click();
      toast.success('QR Code téléchargé');
    } catch {
      toast.error('Erreur lors du téléchargement');
    }
  }, []);

  /* ==========================================================================
     COPIE
     ========================================================================== */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copié dans le presse-papiers');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Impossible de copier');
    }
  }, [value]);

  /* ==========================================================================
     RENDU
     ========================================================================== */
  return (
    <Card variant="elevated" padding="lg" className={cn('text-center', className)}>
      <CardContent className="p-0">
        {title && (
          <h3 className="font-display mb-1 text-lg font-bold tracking-tight">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-odc-muted mb-4 text-sm">{description}</p>
        )}

        {/* QR Code */}
        <div
          className={cn(
            'relative mx-auto inline-flex items-center justify-center rounded-2xl p-4',
            'bg-odc-surface-alt/50',
            'border-odc-border/60 border-2 border-dashed',
          )}
        >
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm dark:bg-odc-surface-dark/80">
              <Skeleton className="h-3/4 w-3/4 rounded-xl" />
            </div>
          )}

          {error ? (
            <div
              className="text-odc-error flex flex-col items-center justify-center gap-2"
              style={{ width: safeSize, height: safeSize }}
            >
              <AlertCircle className="h-8 w-8" />
              <p className="px-4 text-center text-sm">{error}</p>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="rounded-lg shadow-odc-sm"
              style={{ maxWidth: '100%', height: 'auto' }}
              aria-label={`QR code pour : ${value.substring(0, 50)}`}
            />
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="bg-odc-surface hover:bg-odc-surface-alt absolute right-2 top-2 rounded-lg p-2 shadow-odc-sm transition-all hover:shadow-odc-md active:scale-95"
              title="Rafraîchir"
              aria-label="Rafraîchir le QR code"
            >
              <RefreshCw size={14} className="text-odc-primary" />
            </button>
          )}
        </div>

        {/* Valeur encodée */}
        {value && value !== 'placeholder' && (
          <div className="bg-odc-surface-alt/50 mt-4 rounded-lg p-3">
            <p className="text-odc-muted mb-1 text-[10px] font-semibold uppercase tracking-wider">
              Valeur encodée
            </p>
            <p className="text-odc-text-primary break-all font-mono text-xs">
              {value.length > 100 ? `${value.substring(0, 100)}…` : value}
            </p>
          </div>
        )}

        {/* Actions */}
        {(downloadable || copyable) && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {downloadable && (
              <Button
                variant="brand"
                size="sm"
                onClick={handleDownload}
                disabled={loading || !!error || !value || value === 'placeholder'}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Télécharger
              </Button>
            )}
            {copyable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={loading || !!error || !value || value === 'placeholder'}
                leftIcon={
                  copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )
                }
              >
                {copied ? 'Copié !' : 'Copier'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}