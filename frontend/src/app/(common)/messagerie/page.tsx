import type { Metadata } from 'next';
import { ConversationList } from './components/ConversationList';
import { NewConversationDialog } from './components/NewConversationDialog';

export const metadata: Metadata = { title: 'Messagerie' };

export default function MessageriePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Messagerie</h1>
          <p className="text-odc-muted mt-1">
            Échangez avec les membres de la communauté ODC
          </p>
        </div>
        <NewConversationDialog />
      </header>

      <ConversationList />
    </div>
  );
}