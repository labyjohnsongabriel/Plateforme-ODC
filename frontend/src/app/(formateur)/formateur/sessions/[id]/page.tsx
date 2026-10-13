import type { Metadata } from 'next';
import { SessionDetail } from '../components/SessionDetail';

interface Props { params: { id: string } }

export const metadata: Metadata = { title: 'Détail de la session' };

export default function SessionDetailPage({ params }: Props) {
  return <SessionDetail sessionId={params.id} />;
}