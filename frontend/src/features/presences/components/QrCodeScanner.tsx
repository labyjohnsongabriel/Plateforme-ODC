import { useEffect, useRef, useState } from 'react';
import {
  Camera,
  X,
  Zap,
  ZapOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ScanLine,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { PresenceService } from '../services/presence.service';
import { cn } from '@/utils/cn';

interface QrCodeScannerProps {
  sessionId: string;
  onScanSuccess?: (data: any) => void;
  onScanError?: (error: string) => void;
  autoStart?: boolean;
}

export function QrCodeScanner({
  sessionId,
  onScanSuccess,
  onScanError,
  autoStart = false,
}: QrCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const [scanning, setScanning] = useState(autoStart);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  // ========================================================================
  // Démarrer caméra
  // ========================================================================
  const startCamera = async () => {
    try {
      setError(null);
      setSuccessData(null);

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

        const track = stream.getVideoTracks()[0];
        const caps = (track.getCapabilities?.() as any) || {};
        setTorchSupported(!!caps.torch);

        setScanning(true);
        scanLoop();
      }
    } catch (err: any) {
      const message =
        err.name === 'NotAllowedError'
          ? 'Accès caméra refusé'
          : err.name === 'NotFoundError'
          ? 'Aucune caméra détectée'
          : 'Erreur caméra';
      setError(message);
      onScanError?.(message);
    }
  };

  // ========================================================================
  // Arrêter caméra
  // ========================================================================
  const stopCamera = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
    setTorchOn(false);
  };

  // ========================================================================
  // Boucle de scan
  // ========================================================================
  const scanLoop = async () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const jsQR = (await import('jsqr')).default;
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code && code.data && code.data !== lastScan && !processing) {
        setLastScan(code.data);
        await handleQrDetected(code.data);

        if (navigator.vibrate) navigator.vibrate(150);
      }
    } catch (err) {
      // jsQR non installé → ignorer
    }

    if (scanning) {
      animationRef.current = requestAnimationFrame(scanLoop);
    }
  };

  // ========================================================================
  // Traiter QR détecté
  // ========================================================================
  const handleQrDetected = async (qrToken: string) => {
    setProcessing(true);
    try {
      const presence = await PresenceService.scannerQr({ sessionId, qrToken });
      setSuccessData(presence);
      toast.success('Présence validée ! 🎉');
      onScanSuccess?.(presence);

      // Stop après 2s
      setTimeout(() => {
        stopCamera();
        setLastScan(null);
        setProcessing(false);
      }, 2000);
    } catch (err: any) {
      const message = err.response?.data?.message || 'QR Code invalide';
      toast.error(message);

      // Reset après 2s pour permettre un nouveau scan
      setTimeout(() => setLastScan(null), 2000);
      setProcessing(false);
    }
  };

  // ========================================================================
  // Toggle flash
  // ========================================================================
  const toggleTorch = async () => {
    if (!streamRef.current || !torchSupported) return;
    try {
      const track = streamRef.current.getVideoTracks()[0];
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] as any });
      setTorchOn(!torchOn);
    } catch {
      toast.error('Flash non supporté');
    }
  };

  // ========================================================================
  // Cleanup
  // ========================================================================
  useEffect(() => {
    if (autoStart) startCamera();
    return () => stopCamera();
  }, []);

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <div className="w-full">
      <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          className={cn('w-full h-full object-cover', !scanning && 'hidden')}
          playsInline
          muted
        />

        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay scan */}
        {scanning && (
          <>
            {/* Cadre */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-64 h-64">
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-odc-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-odc-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-odc-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-odc-primary rounded-br-lg" />

                {/* Ligne scan */}
                <div className="absolute left-0 right-0 h-0.5 bg-odc-primary shadow-[0_0_10px_#FF7900] animate-[scan_2s_ease-in-out_infinite]" />
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <p className="inline-block px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-medium">
                {processing ? 'Vérification...' : 'Pointez vers le QR Code'}
              </p>
            </div>

            {/* Boutons */}
            {torchSupported && (
              <button
                onClick={toggleTorch}
                className={cn(
                  'absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                  torchOn
                    ? 'bg-odc-primary text-white'
                    : 'bg-black/60 text-white hover:bg-black/80'
                )}
              >
                {torchOn ? <Zap size={20} /> : <ZapOff size={20} />}
              </button>
            )}

            <button
              onClick={stopCamera}
              className="absolute top-4 left-4 w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X size={20} />
            </button>
          </>
        )}

        {/* Succès overlay */}
        {successData && (
          <div className="absolute inset-0 bg-odc-success/90 flex flex-col items-center justify-center text-white p-6 text-center animate-fade-in">
            <CheckCircle size={64} className="mb-4" />
            <h3 className="font-heading text-xl font-bold mb-2">Présence validée !</h3>
            <p className="text-sm opacity-90">
              {successData.participant?.prenom} {successData.participant?.nom}
            </p>
            <p className="text-xs opacity-75 mt-1">
              à {new Date().toLocaleTimeString('fr-FR')}
            </p>
          </div>
        )}

        {/* État initial / erreur */}
        {!scanning && !successData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
            {error ? (
              <>
                <AlertCircle size={48} className="text-odc-error mb-4" />
                <p className="text-sm mb-4">{error}</p>
                <Button
                  variant="primary"
                  icon={<RefreshCw size={14} />}
                  onClick={startCamera}
                >
                  Réessayer
                </Button>
              </>
            ) : (
              <>
                <Camera size={64} className="text-odc-primary mb-4" />
                <h3 className="font-heading font-bold text-lg mb-2">Scanner QR</h3>
                <p className="text-xs text-white/70 mb-6">
                  Autorisez la caméra pour scanner
                </p>
                <Button variant="primary" icon={<ScanLine size={16} />} onClick={startCamera}>
                  Démarrer le scan
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}