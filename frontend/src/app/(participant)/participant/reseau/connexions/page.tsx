import type { Metadata } from 'next';
import { MyConnectionsGrid } from '../components/MyConnectionsGrid';

export const metadata: Metadata = { title: 'Mes connexions' };

export default function ConnexionsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Mes connexions
        </h1>
        <p className="text-odc-muted mt-1">
          Les membres de votre réseau ODC
        </p>
      </header>
      <MyConnectionsGrid />
    </div>
  );
}