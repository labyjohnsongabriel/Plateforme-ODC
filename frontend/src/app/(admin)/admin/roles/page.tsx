// src/app/(admin)/admin/roles/page.tsx
import type { Metadata } from 'next';
import { RolesPageClient } from './components/RolesPageClient';

export const metadata: Metadata = {
  title: 'Rôles & Permissions | ODC Admin',
  description: 'Gérez les rôles et permissions des utilisateurs ODC.',
};

export default function RolesPage() {
  return <RolesPageClient />;
}