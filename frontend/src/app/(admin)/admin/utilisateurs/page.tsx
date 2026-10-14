// src/app/(admin)/admin/utilisateurs/page.tsx
import type { Metadata } from 'next';
import { UtilisateursPageClient } from './components/UtilisateursPageClient';

export const metadata: Metadata = {
  title: 'Utilisateurs | ODC Admin',
  description: 'Gérez les comptes utilisateurs et leurs rôles.',
};

export default function UtilisateursPage() {
  return <UtilisateursPageClient />;
}