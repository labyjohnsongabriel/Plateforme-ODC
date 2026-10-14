'use client';

import * as React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, RefreshCw, Download, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QrGeneratorProps {
  sessionId: string;
  sessionCode: string;
  token?: string;
  expiresIn?: number; // secondes
}

export function QrGenerator({
  sessionId,
  sessionCode,
  token: initialToken,
  expiresIn = 300,
}: QrGeneratorProps) {
  const [token, setToken] = React.useState(
    initialToken ?? generateToken(),
  );
  const [timeLeft, setTimeLeft] = React.useState(expiresIn);

  function generateToken(): string {
    return `${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;
  }

  // ⭐ QR code data : contient sessionId + token
  const qrData = JSON.stringify({
    sessionId,
    qrToken: token,
  });

  // Timer de renouvellement
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const newToken = generateToken();
          setToken(newToken);
          return expiresIn;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresIn]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${sessionCode}-${token}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-odc-primary" />
          QR Code de présence
          <Badge variant="outline" className="ml-auto font-mono text-xs">
            {sessionCode}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* QR Code */}
        <div className="flex justify-center rounded-lg bg-white p-6">
          <QRCodeSVG
            id="qr-code-svg"
            value={qrData}
            size={280}
            level="H"
            bgColor="#FFFFFF"
            fgColor="#111827"
          />
        </div>

        {/* Token */}
        <div className="rounded-lg border border-odc-border bg-odc-surface-alt p-3 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-odc-text-muted">
            Code manuel
          </p>
          <p className="mt-1 font-mono text-lg font-bold tracking-wider text-odc-primary">
            {token}
          </p>
          <p className="mt-1 text-xs text-odc-text-muted">
            Les participants peuvent aussi saisir ce code manuellement
          </p>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-between rounded-lg bg-odc-info-soft/50 p-3">
          <span className="flex items-center gap-2 text-xs font-medium text-odc-info-dark">
            <Clock className="h-3.5 w-3.5" />
            Renouvellement dans
          </span>
          <span className="font-mono text-sm font-bold text-odc-info-dark">
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setToken(generateToken());
              setTimeLeft(expiresIn);
            }}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Régénérer
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownload}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Télécharger
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}