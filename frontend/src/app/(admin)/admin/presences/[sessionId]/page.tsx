import type { Metadata } from 'next';
import { PresenceSession } from '@/app/(staff)/staff/presences/[sessionId]/components/PresenceSession';

interface Props {
  params: { sessionId: string };
}

export const metadata: Metadata = { title: 'Feuille de présence | Administration' };

export default function AdminPresenceSessionPage({ params }: Props) {
  return <PresenceSession sessionId={params.sessionId} />;
}
