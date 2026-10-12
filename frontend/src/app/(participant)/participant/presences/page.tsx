import type { Metadata } from 'next';
import Link from 'next/link';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MyPresencesList } from './components/MyPresencesList';

export const metadata: Metadata = { title: 'Mes présences' };

export default function PresencesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Mes présences
          </h1>
          <p className="text-odc-muted mt-1">
            Historique de vos présences aux sessions
          </p>
        </div>
        <Button variant="odc" asChild>
          <Link href="/participant/presences/scanner">
            <QrCode className="h-4 w-4 mr-2" /> Scanner
          </Link>
        </Button>
      </header>
      <MyPresencesList />
    </div>
  );
}