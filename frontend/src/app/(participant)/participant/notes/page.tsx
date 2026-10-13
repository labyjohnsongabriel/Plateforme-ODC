import type { Metadata } from 'next';
import { MyNotesList } from './components/MyNotesList';

export const metadata: Metadata = { title: 'Mes notes' };

export default function NotesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Mes notes</h1>
        <p className="text-odc-muted mt-1">
          Consultez vos notes et moyennes
        </p>
      </header>
      <MyNotesList />
    </div>
  );
}