import type { Metadata } from 'next';
import { MySessionsList } from './components/MySessionsList';

export const metadata: Metadata = { title: 'Mes sessions' };

export default function FormateurSessionsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Mes sessions</h1>
        <p className="text-odc-muted mt-1">
          Consultez et gérez vos sessions de formation
        </p>
      </header>
      <MySessionsList />
    </div>
  );
}