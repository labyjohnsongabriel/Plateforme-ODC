import type { Metadata } from 'next';
import { SessionsList } from '@/app/(public)/sessions/components/SessionsList';

export const metadata: Metadata = { title: 'Sessions' };

export default function PartenaireSessionsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Planning des sessions
        </h1>
        <p className="text-odc-muted mt-1">
          Toutes les prochaines sessions de formation ODC
        </p>
      </header>

      <SessionsList />
    </div>
  );
}