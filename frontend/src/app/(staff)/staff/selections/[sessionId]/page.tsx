import type { Metadata } from 'next';
import { SelectionWorkspace } from './components/SelectionWorkspace';

interface Props { params: { sessionId: string } }

export const metadata: Metadata = { title: 'Sélection des candidats' };

export default function SelectionPage({ params }: Props) {
  return <SelectionWorkspace sessionId={params.sessionId} />;
}