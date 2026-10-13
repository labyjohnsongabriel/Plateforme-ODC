import type { Metadata } from 'next';
import { NotesTable } from './components/NotesTable';

export const metadata: Metadata = { title: 'Notes' };

export default function NotesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Notes</h1>
        <p className="text-odc-muted mt-1">Consultez les notes des participants</p>
      </header>
      <NotesTable />
    </div>
  );
}