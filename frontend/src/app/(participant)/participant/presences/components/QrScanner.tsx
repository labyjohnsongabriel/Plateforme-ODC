'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Camera, QrCode, CheckCircle2, Loader2, Upload, Keyboard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

export function QrScanner() {
  const router = useRouter();
  const qc = useQueryClient();
  const [token, setToken] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [success, setSuccess] = useState(false);

  const scanMutation = useMutation({
    mutationFn: async () => {
      await api.post('/participant/presences/scanner', {
        sessionId,
        qrToken: token,
      });
    },
    onSuccess: () => {
      toast.success('Présence enregistrée !');
      setSuccess(true);
      qc.invalidateQueries({ queryKey: ['participant', 'presences'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (success) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">
            Présence enregistrée !
          </h2>
          <p className="text-odc-muted mb-6">
            Votre présence a bien été prise en compte.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="odc" onClick={() => router.push('/participant/presences')}>
              Voir mes présences
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(false);
                setToken('');
                setSessionId('');
              }}
            >
              Scanner à nouveau
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Caméra */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-odc-primary" />
            Scan caméra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square rounded-lg bg-odc-surface-alt flex flex-col items-center justify-center border-2 border-dashed border-odc-border">
            <QrCode className="h-16 w-16 text-odc-muted mb-3" />
            <p className="text-sm text-odc-muted">Caméra non disponible</p>
            <p className="text-xs text-odc-muted mt-1">
              Utilisez la saisie manuelle →
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Saisie manuelle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-odc-primary" />
            Saisie manuelle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (sessionId && token) scanMutation.mutate();
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="sessionId">ID de la session</Label>
              <Input
                id="sessionId"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="UUID de la session"
                className="mt-1.5 font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="token">Token QR</Label>
              <Input
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Token affiché par le formateur"
                className="mt-1.5 font-mono text-sm"
              />
            </div>

            <div className="p-3 rounded-lg bg-odc-info-bg text-xs text-odc-info">
              <p className="flex items-start gap-2">
                <Upload className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                Demandez à votre formateur de vous fournir l&apos;ID de session
                et le token affichés à l&apos;écran.
              </p>
            </div>

            <Button
              type="submit"
              variant="odc"
              className="w-full"
              disabled={!sessionId || !token || scanMutation.isPending}
            >
              {scanMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer ma présence
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}