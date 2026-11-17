// src/app/(admin)/admin/attestations/page.tsx
import type { Metadata } from 'next';
import { AttestationsPageClient } from './components/AttestationsPageClient';

export const metadata: Metadata = {
  title: 'Attestations | ODC Admin',
  description: 'Générez et gérez les attestations de formation ODC.',
};

export default function AttestationsPage() {
  return <AttestationsPageClient />;
}