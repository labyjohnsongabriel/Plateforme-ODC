import type { Metadata } from 'next';
import { QrScanner } from '../components/QrScanner';

export const metadata: Metadata = { title: 'Scanner un QR code' };

export default function ScannerPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Scanner un QR code
        </h1>
        <p className="text-odc-muted mt-1">
          Scannez le QR code affiché par votre formateur pour enregistrer votre présence
        </p>
      </header>
      <QrScanner />
    </div>
  );
}