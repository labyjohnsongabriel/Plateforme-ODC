import { useState } from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { NewConversationModal } from '@/features/messagerie/components/NewConversationModal';
import { messagerieApi } from '@/services/messagerie.api';

export function MessageriePage() {
  const [showModal, setShowModal] = useState(false);

  const handleCreatePrivate = async (userId: string) => {
    try {
      await messagerieApi.createConversation({
        participantIds: [userId],
      });
      toast.success('Conversation créée');
      setShowModal(false);
    } catch (err: any) {
      toast.error(err?.message || 'Erreur');
    }
  };

  const handleCreateGroup = async (titre: string, membreIds: string[]) => {
    try {
      await messagerieApi.createConversation({
        participantIds: membreIds,
        titre,
      });
      toast.success('Groupe créé');
      setShowModal(false);
    } catch (err: any) {
      toast.error(err?.message || 'Erreur');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-1">
            Messagerie
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
            Échangez avec les formateurs, participants et partenaires
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setShowModal(true)}
        >
          Nouvelle conversation
        </Button>
      </div>

      <Card>
        <EmptyState
          icon={<MessageSquare size={48} />}
          title="Aucune conversation"
          description="Commencez une nouvelle conversation pour échanger avec la communauté ODC"
          action={
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setShowModal(true)}
            >
              Nouvelle conversation
            </Button>
          }
        />
      </Card>

      <NewConversationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreatePrivate={handleCreatePrivate}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
}

export default MessageriePage;