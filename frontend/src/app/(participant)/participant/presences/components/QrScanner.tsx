'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Camera,
  CheckCircle2,
  Loader2,
  Keyboard,
  AlertCircle,
  RotateCcw,
  RefreshCw,
  ShieldCheck,
  Lock,
  Unlock,
} from 'lucide-react';
import type { Html5Qrcode } from 'html5-qrcode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

type ScanMode = 'camera' | 'manual' | 'processing' | 'success';

interface QrScannerProps {
  defaultSessionId?: string;
  defaultQrToken?: string;
}

interface ParsedQr {
  sessionId: string;
  qrToken: string;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MIN_TOKEN_LENGTH = 100;
const SCAN_COOLDOWN_MS = 10000;

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER — Détecter le sessionId depuis l'URL
   ═══════════════════════════════════════════════════════════════════════════ */

function detectSessionIdFromUrl(
  pathname: string,
  searchParams: URLSearchParams,
): string | null {
  /* 1. ?session=<uuid> ou ?sessionId=<uuid> */
  const fromQuery =
    searchParams.get('session') ?? searchParams.get('sessionId');
  if (fromQuery && UUID_REGEX.test(fromQuery)) {
    return fromQuery;
  }

  /* 2. /participant/presences/<uuid> */
  const match = pathname.match(
    /\/presences\/([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})(?:\/|$)/i,
  );
  if (match) {
    return match[1];
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PARSER QR
   ═══════════════════════════════════════════════════════════════════════════ */

function parseQrPayload(
  decodedText: string,
  fallbackSessionId: string,
): ParsedQr | null {
  const text = decodedText.trim();
  if (!text) return null;

  let sessionId = fallbackSessionId;
  let qrToken = '';

  try {
    if (text.startsWith('{')) {
      const parsed: unknown = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object') return null;
      const payload = parsed as Record<string, unknown>;
      sessionId =
        typeof payload.sessionId === 'string'
          ? payload.sessionId
          : fallbackSessionId;
      qrToken =
        typeof payload.qrToken === 'string'
          ? payload.qrToken
          : typeof payload.token === 'string'
            ? payload.token
            : '';
    } else if (/^https?:\/\//i.test(text)) {
      const url = new URL(text);
      sessionId =
        url.searchParams.get('session') ??
        url.searchParams.get('sessionId') ??
        fallbackSessionId;
      qrToken =
        url.searchParams.get('token') ??
        url.searchParams.get('qrToken') ??
        '';
    } else {
      const match = text.match(
        /^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}):/i,
      );
      if (match) {
        sessionId = match[1];
        qrToken = text;
      } else {
        qrToken = text;
      }
    }
  } catch {
    return null;
  }

  if (!UUID_REGEX.test(sessionId)) return null;

  const cleanToken = qrToken.trim();
  if (cleanToken.length < MIN_TOKEN_LENGTH) return null;
  if (cleanToken.split('.').length !== 3) return null;

  return { sessionId, qrToken: cleanToken };
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function QrScanner({
  defaultSessionId,
  defaultQrToken,
}: QrScannerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* ⭐ Détecter le sessionId depuis l'URL */
  const urlSessionId = React.useMemo(
    () => detectSessionIdFromUrl(pathname, searchParams),
    [pathname, searchParams],
  );

  /* ⭐ Session ID effectif (prop > URL > vide) */
  const effectiveSessionId = defaultSessionId ?? urlSessionId ?? '';

  /* ⭐ Verrouillé si détecté automatiquement */
  const sessionIdLocked =
    !!defaultSessionId || !!urlSessionId;

  const [mode, setMode] = React.useState<ScanMode>(
    defaultQrToken ? 'processing' : 'camera',
  );
  const [manualToken, setManualToken] = React.useState('');
  const [sessionId, setSessionId] = React.useState(effectiveSessionId);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [cameraAttempt, setCameraAttempt] = React.useState(0);

  const scanLockedRef = React.useRef(false);
  const lastScannedRef = React.useRef<{ text: string; at: number } | null>(null);
  const autoScanStartedRef = React.useRef(false);
  const sessionIdRef = React.useRef(sessionId);

  const reactId = React.useId();
  const containerId = React.useMemo(
    () => `qr-scanner-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`,
    [reactId],
  );

  /* ⭐ Sync sessionId si URL change */
  React.useEffect(() => {
    if (effectiveSessionId && !sessionId) {
      setSessionId(effectiveSessionId);
    }
  }, [effectiveSessionId, sessionId]);

  /* ⭐ Mutation */
  const scanMutation = useMutation({
    mutationFn: async (payload: ParsedQr) => {
      const { data } = await api.post('/participant/presences/scanner', {
        sessionId: payload.sessionId,
        qrToken: payload.qrToken,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success('Présence enregistrée avec succès !');
      setMode('success');
      scanLockedRef.current = true;
      qc.invalidateQueries({ queryKey: ['participant', 'presences'] });
      qc.invalidateQueries({
        queryKey: ['formateur', 'presences', variables.sessionId],
      });
    },
    onError: (e: any) => {
      const status = e?.response?.status;
      const serverMessage =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        'Erreur inconnue';

      console.error('[QR Scanner] ❌ Erreur serveur:', {
        status,
        message: serverMessage,
        code: e?.response?.data?.code,
      });

      if (status === 403) {
        toast.error(
          serverMessage ||
            "Vous n'êtes pas inscrit à cette session. Contactez votre formateur.",
          { duration: 6000 },
        );
      } else if (status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        setTimeout(() => router.push('/connexion'), 1500);
      } else if (status === 400) {
        toast.error(serverMessage || 'QR code invalide ou expiré');
      } else if (status === 409) {
        toast.error(serverMessage || 'Présence déjà enregistrée aujourd’hui');
      } else {
        toast.error(getErrorMessage(e));
      }

      setTimeout(() => {
        scanLockedRef.current = false;
        lastScannedRef.current = null;
      }, SCAN_COOLDOWN_MS);

      if (defaultQrToken) setMode('manual');
    },
  });

  const qc = useQueryClient();
  const scanMutationRef = React.useRef(scanMutation);
  scanMutationRef.current = scanMutation;
  sessionIdRef.current = sessionId;

  const handleQrDetected = React.useCallback((decodedText: string) => {
    const now = Date.now();

    if (
      lastScannedRef.current &&
      lastScannedRef.current.text === decodedText &&
      now - lastScannedRef.current.at < SCAN_COOLDOWN_MS
    ) {
      return;
    }

    if (scanLockedRef.current) return;

    const parsed = parseQrPayload(decodedText, sessionIdRef.current);
    if (!parsed) {
      toast.error('QR code non reconnu ou incomplet');
      lastScannedRef.current = { text: decodedText, at: now };
      return;
    }

    scanLockedRef.current = true;
    lastScannedRef.current = { text: decodedText, at: now };
    setSessionId(parsed.sessionId);
    scanMutationRef.current.mutate(parsed);
  }, []);

  React.useEffect(() => {
    if (defaultSessionId && defaultQrToken && !autoScanStartedRef.current) {
      autoScanStartedRef.current = true;
      handleQrDetected(
        JSON.stringify({
          sessionId: defaultSessionId,
          qrToken: defaultQrToken,
        }),
      );
    }
  }, [defaultQrToken, defaultSessionId, handleQrDetected]);

  /* Caméra */
  React.useEffect(() => {
    if (mode !== 'camera') return;

    let mounted = true;
    let scanner: Html5Qrcode | null = null;
    let startPromise: Promise<void> | null = null;

    const stopScanner = async () => {
      if (!scanner) return;
      try {
        if (startPromise) await startPromise.catch(() => {});
        if (scanner.isScanning) await scanner.stop();
        scanner.clear();
      } catch (err) {
        console.warn('[QR Scanner] stop error:', err);
      }
    };

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!mounted) return;

        if (!document.getElementById(containerId)) {
          console.warn('[QR Scanner] Container pas monté');
          return;
        }

        scanner = new Html5Qrcode(containerId);

        startPromise = scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
          (decodedText: string) => {
            if (!mounted) return;
            handleQrDetected(decodedText);
          },
          () => {
            /* Erreur silencieuse */
          },
        );

        await startPromise;
        if (!mounted) {
          await stopScanner();
          return;
        }

        setIsScanning(true);
        setCameraError(null);
      } catch (err: unknown) {
        if (!mounted) return;
        const message =
          err instanceof Error
            ? err.message
            : 'Caméra non accessible. Vérifiez les permissions.';
        setCameraError(message);
        setIsScanning(false);
      }
    };

    void startScanner();

    return () => {
      mounted = false;
      void stopScanner();
    };
  }, [mode, containerId, cameraAttempt, handleQrDetected]);

  /* ⭐ Saisie manuelle — sessionId verrouillé si détecté */
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalSessionId = sessionId.trim() || effectiveSessionId;

    if (!finalSessionId || !manualToken.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    if (!UUID_REGEX.test(finalSessionId)) {
      toast.error("Format de l'ID session invalide");
      return;
    }
    if (manualToken.trim().length < MIN_TOKEN_LENGTH) {
      toast.error('Token trop court — vérifiez le code');
      return;
    }
    if (manualToken.trim().split('.').length !== 3) {
      toast.error('Token mal formé — il doit contenir 3 parties');
      return;
    }
    if (scanLockedRef.current || scanMutation.isPending) return;

    scanLockedRef.current = true;
    scanMutation.mutate({
      sessionId: finalSessionId,
      qrToken: manualToken.trim(),
    });
  };

  const handleReset = React.useCallback(() => {
    scanLockedRef.current = false;
    lastScannedRef.current = null;
    autoScanStartedRef.current = false;
    setManualToken('');
    setCameraError(null);
    setIsScanning(false);
    setMode('camera');
    setCameraAttempt((a) => a + 1);
  }, []);

  /* ══════════════════════════════════════════════════════════════════════════
     RENDU
     ══════════════════════════════════════════════════════════════════════════ */
  if (mode === 'success') {
    return <SuccessConfirmation onReset={handleReset} />;
  }

  if (mode === 'processing') {
    return (
      <Card variant="elevated" padding="lg">
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <div className="bg-odc-primary/10 relative flex h-16 w-16 items-center justify-center rounded-full">
            <Loader2 className="text-odc-primary h-8 w-8 animate-spin" />
          </div>
          <p className="text-odc-text-primary font-semibold">
            Vérification de votre présence…
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ⭐ Bannière session détectée */}
      {effectiveSessionId && (
        <div className="border-odc-success/30 bg-odc-success/5 ring-1 ring-odc-success/20 flex items-start gap-3 rounded-xl p-4">
          <div className="bg-odc-success/10 text-odc-success flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
            <Lock className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-odc-success text-sm font-semibold">
              Session détectée automatiquement
            </p>
            <p className="text-odc-muted mt-0.5 text-xs">
              Vous êtes sur la session{' '}
              <code className="text-odc-text-primary font-mono">
                {effectiveSessionId.slice(0, 8)}…
              </code>
            </p>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="bg-odc-surface-alt inline-flex w-full gap-1 rounded-xl p-1">
        {(
          [
            { value: 'camera' as const, label: 'Scanner caméra', icon: Camera },
            {
              value: 'manual' as const,
              label: 'Saisie manuelle',
              icon: Keyboard,
            },
          ] as const
        ).map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
              mode === value
                ? 'bg-odc-surface text-odc-primary shadow-odc-sm'
                : 'text-odc-muted hover:text-odc-text',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* MODE CAMÉRA */}
      {mode === 'camera' && (
        <Card variant="elevated" padding="none" className="overflow-hidden">
          <div className="border-odc-border flex items-center justify-between border-b px-5 py-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Camera className="text-odc-primary h-4 w-4" />
              Scan du QR code
            </h3>
            {isScanning && (
              <Badge className="bg-odc-success/10 text-odc-success-dark ring-1 ring-odc-success/20">
                <span className="bg-odc-success mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full" />
                Caméra active
              </Badge>
            )}
          </div>

          <div className="p-5">
            {cameraError ? (
              <CameraErrorState
                message={cameraError}
                onRetry={() => {
                  setCameraError(null);
                  setCameraAttempt((a) => a + 1);
                }}
                onSwitchToManual={() => setMode('manual')}
              />
            ) : (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl bg-black">
                  <div id={containerId} className="aspect-square w-full" />

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="relative h-[60%] max-h-64 w-[60%] max-w-64">
                      <span className="border-odc-primary absolute left-0 top-0 h-8 w-8 rounded-tl-lg border-l-4 border-t-4" />
                      <span className="border-odc-primary absolute right-0 top-0 h-8 w-8 rounded-tr-lg border-r-4 border-t-4" />
                      <span className="border-odc-primary absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-4 border-l-4" />
                      <span className="border-odc-primary absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-4 border-r-4" />
                    </div>
                  </div>

                  <div className="pointer-events-none absolute inset-x-0 bottom-4 text-center">
                    <p className="text-sm font-medium text-white drop-shadow-lg">
                      Placez le QR code dans le cadre
                    </p>
                  </div>
                </div>

                <div className="bg-odc-info/5 ring-1 ring-odc-info/20 rounded-xl p-3">
                  <p className="text-odc-info flex items-start gap-2 text-xs">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Le token est signé cryptographiquement — impossible à
                      forger manuellement.
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* MODE MANUEL */}
      {mode === 'manual' && (
        <Card variant="elevated" padding="lg">
          <div className="mb-5 flex items-start gap-3">
            <div className="bg-odc-primary/10 text-odc-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-odc-primary/20">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Saisie manuelle</h3>
              <p className="text-odc-muted mt-0.5 text-xs">
                Utilisez le code fourni par votre formateur
              </p>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-5">
            {/* ⭐ Session ID — verrouillé si détecté */}
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <Label htmlFor="sessionId">
                  ID de la session <span className="text-odc-error">*</span>
                </Label>
                {sessionIdLocked && (
                  <Badge className="bg-odc-success/10 text-odc-success ring-1 ring-odc-success/20 text-[10px]">
                    <Lock className="mr-1 h-2.5 w-2.5" />
                    Auto-détecté
                  </Badge>
                )}
                {!sessionIdLocked && (
                  <Badge className="bg-odc-warning/10 text-odc-warning ring-1 ring-odc-warning/20 text-[10px]">
                    <Unlock className="mr-1 h-2.5 w-2.5" />
                    À saisir
                  </Badge>
                )}
              </div>
              <Input
                id="sessionId"
                value={sessionId}
                onChange={(e) => {
                  if (sessionIdLocked) return;
                  setSessionId(e.target.value);
                }}
                placeholder="Ex : b2e8211d-8f2a-48d6-8d02-1728c226aa5a"
                className={cn(
                  'mt-0 font-mono text-sm',
                  sessionIdLocked &&
                    'bg-odc-surface-alt/50 text-odc-text-secondary cursor-not-allowed',
                )}
                disabled={scanMutation.isPending || sessionIdLocked}
                readOnly={sessionIdLocked}
                aria-invalid={!!sessionId && !UUID_REGEX.test(sessionId)}
                aria-readonly={sessionIdLocked}
              />
              <p className="text-odc-muted mt-1 text-xs">
                {sessionIdLocked
                  ? 'Détecté depuis l\'URL — aucune saisie requise'
                  : 'Fourni par votre formateur'}
              </p>
            </div>

            {/* Token */}
            <div>
              <Label htmlFor="token">
                Code / Token QR <span className="text-odc-error">*</span>
              </Label>
              <Input
                id="token"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Collez le token fourni par votre formateur"
                className="mt-1.5 font-mono text-sm"
                disabled={scanMutation.isPending}
              />
              <p className="text-odc-muted mt-1 text-xs">
                Affiché sous le QR code
              </p>
            </div>

            {/* Info */}
            <div className="bg-odc-warning/5 ring-1 ring-odc-warning/20 rounded-xl p-3">
              <p className="text-odc-warning flex items-start gap-2 text-xs">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  {sessionIdLocked
                    ? 'Le token est le seul champ à saisir. Il est affiché sous le QR code.'
                    : 'Vérifiez l\'ID de session ET le token avant de valider.'}
                </span>
              </p>
            </div>

            <Button
              type="submit"
              variant="brand"
              size="lg"
              fullWidth
              disabled={
                !(sessionId.trim() || effectiveSessionId) ||
                !manualToken.trim() ||
                scanMutation.isPending
              }
              loading={scanMutation.isPending}
              loadingText="Enregistrement…"
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              Enregistrer ma présence
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ÉTAT D'ERREUR CAMÉRA
   ═══════════════════════════════════════════════════════════════════════════ */

function CameraErrorState({
  message,
  onRetry,
  onSwitchToManual,
}: {
  message: string;
  onRetry: () => void;
  onSwitchToManual: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="border-odc-error/30 bg-odc-error/5 rounded-xl border-2 border-dashed p-8 text-center">
        <Camera className="text-odc-error mx-auto mb-4 h-12 w-12" />
        <h3 className="font-display text-odc-text-primary mb-2 text-lg font-semibold">
          Caméra indisponible
        </h3>
        <p className="text-odc-text-secondary mb-4 text-sm">{message}</p>
        <div className="text-odc-muted space-y-2 text-left text-xs">
          <p>💡 Vérifiez :</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Les permissions de la caméra dans votre navigateur</li>
            <li>Que votre appareil possède une caméra</li>
            <li>Que le site utilise HTTPS (obligatoire pour la caméra)</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          variant="outline"
          onClick={onRetry}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Réessayer
        </Button>
        <Button
          variant="brand"
          onClick={onSwitchToManual}
          leftIcon={<Keyboard className="h-4 w-4" />}
        >
          Saisie manuelle
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUCCÈS
   ═══════════════════════════════════════════════════════════════════════════ */

function SuccessConfirmation({ onReset }: { onReset: () => void }) {
  const router = useRouter();
  return (
    <Card variant="elevated" padding="lg" className="overflow-hidden">
      <div className="py-8 text-center">
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <div className="bg-odc-success/20 absolute inset-0 animate-ping rounded-full" />
          <div className="bg-odc-success/10 relative flex h-20 w-20 items-center justify-center rounded-full">
            <CheckCircle2 className="text-odc-success h-10 w-10" />
          </div>
        </div>

        <h2 className="font-display mb-3 text-2xl font-bold">
          Présence enregistrée !
        </h2>
        <p className="text-odc-muted mx-auto mb-6 max-w-md text-sm">
          Votre présence a bien été enregistrée et est désormais visible par
          votre formateur.
        </p>

        <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="brand"
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
      </div>
    </Card>
  );
}