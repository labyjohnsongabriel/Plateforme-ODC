import type { Metadata } from 'next';
import { EvaluationsPageClient } from './EvaluationsPageClient';

export const metadata: Metadata = {
  title: 'Mes évaluations',
  description: 'Créez et gérez les évaluations de vos sessions de formation.',
};

export default function EvaluationsPage() {
  return <EvaluationsPageClient />;
}