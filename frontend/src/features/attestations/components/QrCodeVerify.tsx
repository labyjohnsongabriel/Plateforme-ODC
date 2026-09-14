import { useState } from 'react';
import { QrCode, Search, CheckCircle, XCircle, ScanLine } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { AttestationVerify } from './AttestationVerify';
import { AttestationService } from '../services/attestation.service';
import { cn } from '@/utils/cn';

export function QrCodeVerify() {
  const [mode, setMode] = useState<'manual' | 'qr'>('qr');
  const [scannedNumero, setScannedNumero] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useState<HTMLVideoElement | null>(null);
  const canvasRef = useState<HTMLCanvasElement | null>(null);

  // ========================================================================
  // Si on a scanné un numéro, on affiche la vérification
  // ========================================================================
  if (scannedNumero) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setScannedNumero('')}
        >
          ← Retour au scan
        </Button>
        <AttestationVerify />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-odc-primary to-odc-primary-dark items-center justify-center text-white mb-4 shadow-odc-lg">
          <QrCode size={40} />
        </div>
        <h1 className="font-heading text-3xl font-bold text-odc-text-light dark:text-odc-text-dark mb-2">
          Scanner un QR Code
        </h1>
        <p className="text-odc-text-muted-light dark:text-odc-text-muted-dark">
          Scannez le QR Code présent sur une attestation pour la vérifier
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 p-1 rounded-xl bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark max-w-xs mx-auto">
        <button
          onClick={() => setMode('qr')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mode === 'qr'
              ? 'bg-white dark:bg-odc-surface-dark text-odc-primary shadow-sm'
              : 'text-odc-text-muted-light dark:text-odc-text-muted-dark'
          )}
        >
          <ScanLine size={16} />
          Scanner
        </button>
        <button
          onClick={() => setMode('manual')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mode === 'manual'
              ? 'bg-white dark:bg-odc-surface-dark text-odc-primary shadow-sm'
              : 'text-odc-text-muted-light dark:text-odc-text-muted-dark'
          )}
        >
          <Search size={16} />
          Manuel
        </button>
      </div>

      {/* Contenu */}
      {mode === 'manual' ? (
        <AttestationVerify />
      ) : (
        <Card padding="lg">
          <div className="text-center py-12">
            <div className="inline-flex w-24 h-24 rounded-full bg-odc-primary-soft dark:bg-odc-primary-soft/20 items-center justify-center mb-6">
              <ScanLine size={48} className="text-odc-primary" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-2 text-odc-text-light dark:text-odc-text-dark">
              Scanner QR Code
            </h3>
            <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark mb-6 max-w-sm mx-auto">
              Utilisez la caméra de votre appareil pour scanner le QR Code
              présent sur l'attestation
            </p>

            <Button
              variant="primary"
              size="lg"
              icon={<ScanLine size={18} />}
              onClick={() => {
                toast.info('Fonction de scan caméra à activer');
                // TODO: intégrer QrCodeScanner du module presences
              }}
            >
              Activer la caméra
            </Button>
          </div>
        </Card>
      )}

      {/* Info */}
      <Card padding="md" className="bg-odc-info-bg dark:bg-odc-info-bg/10 border-odc-info/20">
        <div className="flex items-start gap-3">
          <QrCode size={20} className="text-odc-info flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-odc-info mb-1">
              Où trouver le QR Code ?
            </h4>
            <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
              Le QR Code se trouve généralement en bas à droite de chaque attestation.
              Il permet une vérification instantanée et sécurisée.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}