import type { Metadata } from 'next';
import { SessionsSelector } from '@/app/(staff)/staff/presences/components/SessionsSelector';

export const metadata: Metadata = { title: 'Présences | Administration' };

export default function AdminPresencesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl font-bold md:text-3xl">
          Gestion des présences
        </h1>
        <p className="mt-1 text-odc-muted">
          Consultez les feuilles de présence, gérez le pointage et ouvrez les sessions.
        </p>
      </header>
      <SessionsSelector routeBase="/admin/presences" />
    </div>
  );
}
