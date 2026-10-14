// src/app/(participant)/participant/presences/components/QrScanner.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Camera,
  QrCode,
  CheckCircle2,
  Loader2,
  Keyboard,
  AlertCircle,
  RotateCcw,
  FlashlightOff,
  Flashlight,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

/* ============================================================================
   TYPES
   ============================================================================ */

type ScanMode = 'camera' | 'manual' | 'success';

interface QrScannerProps {
  defaultSessionId?: string;
}

/* ============================================================================
   COMPOSANT PRINCIPAL
   ============================================================================ */

export function QrScanner({ defaultSessionId }: QrScannerProps) {
  const router = useRouter();
  const qc = useQueryClient();

  const [mode, setMode] = React.useState<ScanMode>('camera');
  const [scannedToken, setScannedToken] = React.useState('');
  const [manualToken, setManualToken] = React.useState('');
  const [sessionId, setSessionId] = React.useState(defaultSessionId ?? '');
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);

  const scannerRef = React.useRef<any>(null);
  const containerId = React.useId();

  /* -------------------- Mutation -------------------- */
  const scanMutation = useMutation({
    mutationFn: async ({
      sessionId: sid,
      qrToken,
    }: {
      sessionId: string;
      qrToken: string;
    }) => {
      const { data } = await api.post('/participant/presences/scanner', {
        sessionId: sid,
        qrToken,
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Présence enregistrée avec succès !');
      setMode('success');
      qc.invalidateQueries({ queryKey: ['participant', 'presences'] });
    },
    onError: (e) => {
      const msg = getErrorMessage(e);
      toast.error(msg);
      setScannedToken('');
      setIsScanning(false);
    },
  });

  /* ==========================================================================
     CAMÉRA — Scan en temps réel
     ========================================================================== */
  React.useEffect(() => {
    if (mode !== 'camera') return;

    let mounted = true;
    let scanner: any = null;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');

        if (!mounted) return;

        scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText: string) => {
            if (!mounted) return;

            // ⭐ QR détecté → parser le token
            handleQrDetected(decodedText);
          },
          () => {
            /* Erreur de scan silencieuse (normal) */
          },
        );

        setIsScanning(true);
        setCameraError(null);
      } catch (err: any) {
        if (!mounted) return;

        const message =
          err?.message ??
          'Caméra non accessible. Vérifiez les permissions.';
        setCameraError(message);
        setIsScanning(false);
      }
    };

    startScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [mode, containerId]);

  /* -------------------- Parser le QR détecté -------------------- */
  const handleQrDetected = (decodedText: string) => {
    try {
      // Format supporté :
      // 1. URL : https://odc.mg/presence/scan?token=XXX&session=YYY
      // 2. JSON : { "sessionId": "...", "qrToken": "..." }
      // 3. Texte simple : "SESSION_ID:TOKEN"

      let token = '';
      let sid = sessionId;

      if (decodedText.startsWith('{')) {
        const parsed = JSON.parse(decodedText);
        token = parsed.qrToken ?? parsed.token ?? '';
        sid = parsed.sessionId ?? sid;
      } else if (decodedText.startsWith('http')) {
        const url = new URL(decodedText);
        token = url.searchParams.get('token') ?? '';
        sid = url.searchParams.get('session') ?? sid;
      } else if (decodedText.includes(':')) {
        const [s, t] = decodedText.split(':');
        sid = s;
        token = t;
      } else {
        token = decodedText;
      }

      if (!token) {
        toast.error('QR code invalide');
        return;
      }

      if (!sid) {
        toast.error('Session introuvable dans le QR code');
        return;
      }

      setScannedToken(token);
      setSessionId(sid);

      // ⭐ Enregistrer automatiquement
      scanMutation.mutate({ sessionId: sid, qrToken: token });
    } catch {
      toast.error('Impossible de lire le QR code');
    }
  };

  /* -------------------- Saisie manuelle -------------------- */
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !manualToken.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    scanMutation.mutate({
      sessionId,
      qrToken: manualToken.trim(),
    });
  };

  /* -------------------- Reset -------------------- */
  const handleReset = () => {
    setMode('camera');
    setScannedToken('');
    setManualToken('');
    setCameraError(null);
    setIsScanning(false);
  };

  /* ==========================================================================
     RENDU — Succès
     ========================================================================== */
  if (mode === 'success') {
    return <SuccessConfirmation onReset={handleReset} />;
  }

  /* ==========================================================================
     RENDU PRINCIPAL
     ========================================================================== */
  return (
    <div className="space-y-6">
      {/* Onglets */}
      <div className="flex gap-2 rounded-lg bg-odc-surface-alt p-1">
        <button
          type="button"
          onClick={() => setMode('camera')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
            mode === 'camera'
              ? 'bg-odc-surface text-odc-primary shadow-odc-sm'
              : 'text-odc-text-muted hover:text-odc-text-primary',
          )}
        >
          <Camera className="h-4 w-4" />
          Scanner caméra
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
            mode === 'manual'
              ? 'bg-odc-surface text-odc-primary shadow-odc-sm'
              : 'text-odc-text-muted hover:text-odc-text-primary',
          )}
        >
          <Keyboard className="h-4 w-4" />
          Saisie manuelle
        </button>
      </div>

      {/* ================================================================
          MODE CAMÉRA
          ================================================================ */}
      {mode === 'camera' && (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-odc-primary" />
              Scan du QR code
              {isScanning && (
                <Badge className="bg-odc-success-soft text-odc-success-dark">
                  <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-odc-success" />
                  Caméra active
                </Badge>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {cameraError ? (
              <CameraErrorState
                message={cameraError}
                onSwitchToManual={() => setMode('manual')}
              />
            ) : (
              <div className="space-y-4">
                {/* Zone de scan */}
                <div className="relative overflow-hidden rounded-lg bg-black">
                  <div
                    id={containerId}
                    className="aspect-square w-full"
                  />

                  {/* Overlay avec cadre de scan */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="relative h-[60%] w-[60%] max-h-64 max-w-64">
                      {/* Coins du cadre */}
                      <span className="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-odc-primary rounded-tl-lg" />
                      <span className="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-odc-primary rounded-tr-lg" />
                      <span className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-odc-primary rounded-bl-lg" />
                      <span className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-odc-primary rounded-br-lg" />
                    </div>
                  </div>

                  {/* Instruction */}
                  <div className="pointer-events-none absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-sm font-medium text-white drop-shadow-lg">
                      Placez le QR code dans le cadre
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="rounded-lg bg-odc-info-soft/50 p-3">
                  <p className="flex items-start gap-2 text-xs text-odc-info-dark">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Le scan est automatique. La présence sera enregistrée
                      dès que le QR code sera reconnu.
                    </span>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================================================================
          MODE MANUEL
          ================================================================ */}
      {mode === 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-odc-primary" />
              Saisie manuelle
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-5">
              <div>
                <Label htmlFor="sessionId">
                  ID de la session <span className="text-odc-error">*</span>
                </Label>
                <Input
                  id="sessionId"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Ex : b2e8211d-8f2a-48d6-8d02-1728c226aa5a"
                  className="mt-1.5 font-mono text-sm"
                  disabled={scanMutation.isPending}
                />
                <p className="mt-1 text-xs text-odc-text-muted">
                  Fourni par votre formateur
                </p>
              </div>

              <div>
                <Label htmlFor="token">
                  Code / Token QR <span className="text-odc-error">*</span>
                </Label>
                <Input
                  id="token"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Ex : ABC123-XYZ789"
                  className="mt-1.5 font-mono text-sm"
                  disabled={scanMutation.isPending}
                />
                <p className="mt-1 text-xs text-odc-text-muted">
                  Affiché sous le QR code
                </p>
              </div>

              <div className="rounded-lg bg-odc-warning-soft/50 p-3">
                <p className="flex items-start gap-2 text-xs text-odc-warning-dark">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Assurez-vous d&apos;avoir l&apos;ID de session exact et
                    le token valide. Demandez-les à votre formateur.
                  </span>
                </p>
              </div>

              <Button
                type="submit"
                variant="odc"
                size="lg"
                className="w-full"
                disabled={
                  !sessionId.trim() ||
                  !manualToken.trim() ||
                  scanMutation.isPending
                }
                loading={scanMutation.isPending}
                loadingText="Enregistrement…"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Enregistrer ma présence
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ============================================================================
   ÉTAT D'ERREUR CAMÉRA
   ============================================================================ */

function CameraErrorState({
  message,
  onSwitchToManual,
}: {
  message: string;
  onSwitchToManual: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-dashed border-odc-error/30 bg-odc-error-soft/30 p-8 text-center">
        <Camera className="mx-auto mb-4 h-12 w-12 text-odc-error" />
        <h3 className="mb-2 font-display text-lg font-semibold text-odc-text-primary">
          Caméra indisponible
        </h3>
        <p className="mb-4 text-sm text-odc-text-secondary">{message}</p>
        <div className="space-y-2 text-xs text-odc-text-muted">
          <p>💡 Vérifiez :</p>
          <ul className="list-inside list-disc space-y-1 text-left">
            <li>Les permissions de la caméra dans votre navigateur</li>
            <li>Que votre appareil possède une caméra</li>
            <li>Que le site utilise HTTPS (obligatoire pour la caméra)</li>
          </ul>
        </div>
      </div>

      <Button
        variant="odc"
        className="w-full"
        onClick={onSwitchToManual}
        leftIcon={<Keyboard className="h-4 w-4" />}
      >
        Utiliser la saisie manuelle
      </Button>
    </div>
  );
}

/* ============================================================================
   ÉCRAN DE SUCCÈS
   ============================================================================ */

function SuccessConfirmation({ onReset }: { onReset: () => void }) {
  const router = useRouter();

  return (
    <Card className="overflow-hidden">
      <CardContent className="py-12 text-center">
        {/* Animation ping */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-odc-success/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-odc-success-soft">
            <CheckCircle2 className="h-10 w-10 text-odc-success" />
          </div>
        </div>

        <h2 className="mb-3 font-display text-2xl font-bold text-odc-text-primary">
          Présence enregistrée !
        </h2>

        <p className="mx-auto mb-6 max-w-md text-sm text-odc-text-secondary">
          Votre présence a bien été prise en compte. Elle sera confirmée par
          votre formateur.
        </p>

        <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="odc"
            onClick={() => router.push('/participant/presences')}
          >
            Voir mes présences
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            leftIcon={<RotateCcw className="h-4 w-4" />}
          >
            Scanner à nouveau
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}