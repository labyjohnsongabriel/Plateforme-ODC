// src/components/qr/QrCodeScanner.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, X, Zap, ZapOff, RefreshCw, AlertCircle, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface QrCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  autoStart?: boolean;
  continuous?: boolean;
  className?: string;
}

type TorchCapabilities = MediaTrackCapabilities & { torch?: boolean };

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function QrCodeScanner({
  onScanSuccess,
  onScanError,
  autoStart = false,
  continuous = false,
  className,
}: QrCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const isScanningRef = useRef(false);
  const lastScanRef = useRef<string | null>(null);
  const jsQRRef = useRef<((data: Uint8ClampedArray, w: number, h: number, opts?: unknown) => { data: string } | null) | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  /* ==========================================================================
     ARRÊTER LA CAMÉRA
     ========================================================================== */
  const stopCamera = useCallback(() => {
    isScanningRef.current = false;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
    setTorchOn(false);
    setTorchSupported(false);
  }, []);

  /* ==========================================================================
     BOUCLE DE SCAN — stable via useCallback
     ========================================================================== */
  const scanFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isScanningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState < video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animationRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // ⭐ Charger jsQR UNE SEULE FOIS
      if (!jsQRRef.current) {
        const mod = await import('jsqr');
        jsQRRef.current = mod.default as typeof jsQRRef.current;
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQRRef.current?.(
        imageData.data,
        imageData.width,
        imageData.height,
        { inversionAttempts: 'dontInvert' },
      );

      if (code?.data && code.data !== lastScanRef.current) {
        lastScanRef.current = code.data;
        onScanSuccess(code.data);

        if (navigator.vibrate) navigator.vibrate(100);

        if (!continuous) {
          stopCamera();
          return;
        }

        // Reset après 2s en mode continu
        setTimeout(() => {
          lastScanRef.current = null;
        }, 2000);
      }
    } catch (err) {
      console.error('[QR Scanner] Erreur scan:', err);
    }

    if (isScanningRef.current) {
      animationRef.current = requestAnimationFrame(scanFrame);
    }
  }, [onScanSuccess, continuous, stopCamera]);

  /* ==========================================================================
     DÉMARRER LA CAMÉRA
     ========================================================================== */
  const startCamera = useCallback(async () => {
    if (isStarting || isScanningRef.current) return;
    setIsStarting(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (!videoRef.current) return;

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      // Détection du flash
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as TorchCapabilities | undefined;
      setTorchSupported(!!capabilities?.torch);

      isScanningRef.current = true;
      setIsScanning(true);
      // ⭐ Démarrer la boucle
      animationRef.current = requestAnimationFrame(scanFrame);
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name;
      const message =
        name === 'NotAllowedError'
          ? 'Accès à la caméra refusé'
          : name === 'NotFoundError'
            ? 'Aucune caméra détectée'
            : "Erreur d'accès à la caméra";

      setError(message);
      onScanError?.(message);
      isScanningRef.current = false;
      setIsScanning(false);
    } finally {
      setIsStarting(false);
    }
  }, [isStarting, scanFrame, onScanError]);

  /* ==========================================================================
     TOGGLE FLASH
     ========================================================================== */
  const toggleTorch = useCallback(async () => {
    if (!streamRef.current || !torchSupported) return;

    try {
      const track = streamRef.current.getVideoTracks()[0];
      await track.applyConstraints({
        advanced: [{ torch: !torchOn }],
      } as MediaTrackConstraints);
      setTorchOn((v) => !v);
    } catch {
      toast.error("Impossible d'activer le flash");
    }
  }, [torchOn, torchSupported]);

  /* ==========================================================================
     AUTO-START + CLEANUP
     ========================================================================== */
  useEffect(() => {
    if (autoStart) void startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ==========================================================================
     RENDU
     ========================================================================== */
  return (
    <div className={cn('w-full', className)}>
      <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-2xl bg-black shadow-odc-lg">
        {/* Vidéo */}
        <video
          ref={videoRef}
          className={cn('h-full w-full object-cover', !isScanning && 'hidden')}
          playsInline
          muted
          aria-label="Flux caméra pour scanner un QR code"
        />

        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay de scan */}
        {isScanning && (
          <>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-64 w-64">
                <div className="border-odc-primary absolute left-0 top-0 h-12 w-12 rounded-tl-lg border-l-4 border-t-4" />
                <div className="border-odc-primary absolute right-0 top-0 h-12 w-12 rounded-tr-lg border-r-4 border-t-4" />
                <div className="border-odc-primary absolute bottom-0 left-0 h-12 w-12 rounded-bl-lg border-b-4 border-l-4" />
                <div className="border-odc-primary absolute bottom-0 right-0 h-12 w-12 rounded-br-lg border-b-4 border-r-4" />
                <div className="bg-odc-primary absolute left-0 right-0 h-0.5 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_10px_#FF7900]" />
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-8 text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                <ScanLine className="h-4 w-4" />
                Pointez vers un QR Code
              </p>
            </div>

            {torchSupported && (
              <button
                type="button"
                onClick={toggleTorch}
                className={cn(
                  'absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full',
                  'bg-black/50 text-white backdrop-blur-md transition-all',
                  'hover:bg-black/70 active:scale-95',
                  torchOn && 'bg-odc-primary hover:bg-odc-primary/90',
                )}
                aria-label={torchOn ? 'Désactiver le flash' : 'Activer le flash'}
              >
                {torchOn ? <Zap size={20} /> : <ZapOff size={20} />}
              </button>
            )}

            <button
              type="button"
              onClick={stopCamera}
              className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/70 active:scale-95"
              aria-label="Fermer le scanner"
            >
              <X size={20} />
            </button>
          </>
        )}

        {/* État initial / erreur */}
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
            {error ? (
              <>
                <AlertCircle size={48} className="text-odc-error mb-4" />
                <p className="mb-4 text-sm">{error}</p>
                <Button
                  variant="brand"
                  onClick={startCamera}
                  loading={isStarting}
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                >
                  Réessayer
                </Button>
              </>
            ) : (
              <>
                <div className="bg-odc-primary/20 mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                  <Camera size={40} className="text-odc-primary" />
                </div>
                <h3 className="font-display mb-2 text-lg font-bold">
                  Scanner un QR Code
                </h3>
                <p className="text-odc-muted mb-6 max-w-xs text-sm text-white/70">
                  Autorisez l&apos;accès à la caméra pour scanner
                </p>
                <Button
                  variant="brand"
                  size="lg"
                  onClick={startCamera}
                  loading={isStarting}
                  loadingText="Démarrage…"
                  leftIcon={<Camera className="h-4 w-4" />}
                >
                  Activer la caméra
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}