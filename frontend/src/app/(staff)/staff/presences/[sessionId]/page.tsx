import type { Metadata } from 'next';
import { PresenceSession } from './components/PresenceSession';

interface Props { params: { sessionId: string } }

export const metadata: Metadata = { title: 'Présences de la session' };

export default function PresencePage({ params }: Props) {
  return <PresenceSession sessionId={params.sessionId} />;
}