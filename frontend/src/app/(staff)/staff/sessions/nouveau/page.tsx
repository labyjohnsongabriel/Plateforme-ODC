// nouveau/page.tsx
import type { Metadata } from 'next';
import { SessionForm } from '../components/SessionForm';

export const metadata: Metadata = { title: 'Nouvelle session' };

export default function NewSessionPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl md:text-3xl font-bold">Nouvelle session</h1>
      <SessionForm mode="create" />
    </div>
  );
}