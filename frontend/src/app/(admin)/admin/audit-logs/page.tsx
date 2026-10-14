// src/app/(admin)/admin/audit-logs/page.tsx
import type { Metadata } from 'next';
import { AuditLogsPageClient } from './components/AuditLogsPageClient';

export const metadata: Metadata = {
  title: 'Journal d\'audit | ODC Admin',
  description:
    'Consultez l\'historique complet des actions effectuées sur la plateforme ODC.',
};

export default function AuditLogsPage() {
  return <AuditLogsPageClient />;
}