// src/app/(participant)/participant/presences/scanner/page.tsx
import type { Metadata } from 'next';
import { QrScanner } from '../components/QrScanner';

export const metadata: Metadata = {
  title: 'Scanner un QR code | ODC Formations',
  description:
    'Scannez le QR code affiché par votre formateur pour enregistrer votre présence.',
};

interface PageProps {
  searchParams: { session?: string };
}

export default function ScannerPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Scanner un QR code
        </h1>
        <p className="mt-1 text-sm text-odc-text-muted">
          Scannez le QR code affiché par votre formateur pour enregistrer votre
          présence.
        </p>
      </header>

      {/* Scanner */}
      <QrScanner defaultSessionId={searchParams.session} />
    </div>
  );
}