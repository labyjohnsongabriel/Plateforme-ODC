import { useEffect, useRef, useState } from 'react';
import { Camera, X, Zap, ZapOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { toast } from '@/components/common/Toast';
import { cn } from '@/utils/cn';

export interface QrCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  autoStart?: boolean;
  continuous?: boolean;
  className?: string;
}

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

  const [isScanning, setIsScanning] = useState(autoStart);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);

  // ========================================================================
  // Démarrer la caméra
  // ========================================================================
  const startCamera = async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Vérifier si le flash est supporté
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.() as any;
        setTorchSupported(!!capabilities?.torch);

        setIsScanning(true);
        scanFrame();
      }
    } catch (err: any) {
      const message =
        err.name === 'NotAllowedError'
          ? 'Accès à la caméra refusé'
          : err.name === 'NotFoundError'
          ? 'Aucune caméra détectée'
          : 'Erreur d\'accès à la caméra';

      setError(message);
      onScanError?.(message);
    }
  };

  // ========================================================================
  // Arrêter la caméra
  // ========================================================================
  const stopCamera = () => {
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
  };

  // ========================================================================
  // Analyser les frames
  // ========================================================================
  const scanFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    try {
      // Utiliser jsQR si disponible (import dynamique)
      const jsQR = (await import('jsqr')).default;
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data && code.data !== lastScan) {
        setLastScan(code.data);
        onScanSuccess(code.data);

        // Vibration
        if (navigator.vibrate) navigator.vibrate(100);

        if (!continuous) {
          stopCamera();
          return;
        }

        // Reset après 2s en mode continu
        setTimeout(() => setLastScan(null), 2000);
      }
    } catch (err) {
      // jsQR non installé, continuer
    }

    if (isScanning) {
      animationRef.current = requestAnimationFrame(scanFrame);
    }
  };

  // ========================================================================
  // Toggle flash
  // ========================================================================
  const toggleTorch = async () => {
    if (!streamRef.current || !torchSupported) return;

    try {
      const track = streamRef.current.getVideoTracks()[0];
      await track.applyConstraints({
        advanced: [{ torch: !torchOn }],
      } as any);
      setTorchOn(!torchOn);
    } catch {
      toast.error('Impossible d\'activer le flash');
    }
  };

  // ========================================================================
  // Cleanup
  // ========================================================================
  useEffect(() => {
    if (autoStart) startCamera();

    return () => {
      stopCamera();
    };
  }, [autoStart]);

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <div className={cn('w-full', className)}>
      <div className="relative aspect-square max-w-lg mx-auto bg-black rounded-2xl overflow-hidden">
        {/* Vidéo */}
        <video
          ref={videoRef}
          className={cn('w-full h-full object-cover', !isScanning && 'hidden')}
          playsInline
          muted
        />

        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay de scan */}
        {isScanning && (
          <>
            {/* Coin supérieur gauche */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-64 h-64">
                {/* Coins */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-odc-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-odc-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-odc-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-odc-primary rounded-br-lg" />

                {/* Ligne de scan animée */}
                <div className="absolute left-0 right-0 h-0.5 bg-odc-primary shadow-[0_0_10px_#FF7900] animate-scan" />
              </div>
            </div>

            {/* Texte d'instruction */}
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="text-white text-sm font-medium bg-black/50 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
                Pointez vers un QR Code
              </p>
            </div>

            {/* Bouton flash */}
            {torchSupported && (
              <button
                onClick={toggleTorch}
                className={cn(
                  'absolute top-4 right-4 w-12 h-12 rounded-full',
                  'flex items-center justify-center',
                  'bg-black/50 backdrop-blur-sm text-white',
                  'hover:bg-black/70 transition-all',
                  torchOn && 'bg-odc-primary hover:bg-odc-primary-dark'
                )}
              >
                {torchOn ? <Zap size={20} /> : <ZapOff size={20} />}
              </button>
            )}

            {/* Bouton fermer */}
            <button
              onClick={stopCamera}
              className="absolute top-4 left-4 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-all"
            >
              <X size={20} />
            </button>
          </>
        )}

        {/* État initial / erreur */}
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
            {error ? (
              <>
                <AlertCircle size={48} className="text-odc-error mb-4" />
                <p className="text-sm mb-4">{error}</p>
                <Button
                  variant="primary"
                  icon={<RefreshCw size={16} />}
                  onClick={startCamera}
                >
                  Réessayer
                </Button>
              </>
            ) : (
              <>
                <Camera size={64} className="text-odc-primary mb-4" />
                <h3 className="font-heading font-bold text-lg mb-2">Scanner un QR Code</h3>
                <p className="text-sm text-white/70 mb-6">
                  Autorisez l'accès à la caméra pour scanner
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Camera size={18} />}
                  onClick={startCamera}
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