// src/app/(admin)/admin/sessions/[id]/page.tsx
import type { Metadata } from 'next';
import { SessionDetailClient } from './components/SessionDetailClient';

interface PageProps {
  params: { id: string };
}

export const metadata: Metadata = {
  title: 'Détail session | ODC Admin',
  description: 'Consultez et gérez les informations de la session.',
};

export default function SessionDetailPage({ params }: PageProps) {
  return <SessionDetailClient sessionId={params.id} />;
}