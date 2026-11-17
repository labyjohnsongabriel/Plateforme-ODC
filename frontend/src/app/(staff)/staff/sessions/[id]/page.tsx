// src/app/(staff)/staff/sessions/[id]/page.tsx
import type { Metadata } from 'next';
import { SessionDetail } from './components/SessionDetail';

interface Props {
  params: { id: string };
}

export const metadata: Metadata = { title: 'Détail de la session' };

export default function SessionDetailPage({ params }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <SessionDetail sessionId={params.id} />
    </div>
  );
}