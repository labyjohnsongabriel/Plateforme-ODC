import type { Metadata } from 'next';
import { DomaineDetailsClient } from './DomaineDetailsClient';

interface Props {
  params: { id: string };
}

export const metadata: Metadata = {
  title: 'Détails du domaine',
  description: 'Consulter les informations d’un domaine de formation ODC',
};

export default function DomaineDetailPage({ params }: Props) {
  return <DomaineDetailsClient id={params.id} />;
}