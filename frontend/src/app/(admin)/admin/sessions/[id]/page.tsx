import type { Metadata } from 'next';
import { SessionForm } from '../components/SessionForm';

interface Props {
  params: { id: string };
}

export const metadata: Metadata = { title: 'Modifier session' };

export default function EditSessionPage({ params }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl md:text-3xl font-bold">
        Modifier la session
      </h1>
      <SessionForm mode="edit" id={params.id} />
    </div>
  );
}