// src/app/(admin)/admin/sessions/page.tsx
import type { Metadata } from 'next';
import { SessionsPageClient } from './components/SessionsPageClient';

export const metadata: Metadata = {
  title: 'Sessions | ODC Admin',
  description: 'Gérez les sessions de formation ODC.',
};

export default function SessionsPage() {
  return <SessionsPageClient />;
}