import { useState } from 'react';
import { Search, Users, UserPlus, Check, X } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Avatar } from '@/components/common/Avatar';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { useFetch } from '@/hooks/useFetch';
import { reseautageApi } from '@/services/reseautage.api';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/utils/cn';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePrivate: (userId: string) => Promise<any>;
  onCreateGroup: (titre: string, membreIds: string[]) => Promise<any>;
}

export function NewConversationModal({
  isOpen,
  onClose,
  onCreatePrivate,
  onCreateGroup,
}: NewConversationModalProps) {
  const [mode, setMode] = useState<'private' | 'group'>('private');
  const [search, setSearch] = useState('');
  const [titre, setTitre] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data, loading: loadingUsers } = useFetch(
    () => reseautageApi.annuaire({ search: debouncedSearch, limit: 50 }),
    [debouncedSearch, isOpen]
  );

  const users = data?.data || [];

  // ========================================================================
  // Actions
  // ========================================================================
  const toggleSelect = (userId: string) => {
    if (mode === 'private') {
      setSelected([userId]);
    } else {
      setSelected((prev) =>
        prev.includes(userId) ? prev.filter((i) => i !== userId) : [...prev, userId]
      );
    }
  };

  const handleCreate = async () => {
    if (selected.length === 0) return;
    if (mode === 'group' && !titre.trim()) return;

    setLoading(true);
    try {
      if (mode === 'private') {
        await onCreatePrivate(selected[0]);
      } else {
        await onCreateGroup(titre.trim(), selected);
      }
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearch('');
    setTitre('');
    setSelected([]);
    setMode('private');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nouvelle conversation"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            loading={loading}
            disabled={selected.length === 0 || (mode === 'group' && !titre.trim())}
          >
            {mode === 'private' ? 'Démarrer' : `Créer le groupe (${selected.length})`}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Mode tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark">
          <button
            onClick={() => {
              setMode('private');
              setSelected([]);
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              mode === 'private'
                ? 'bg-white dark:bg-odc-surface-dark text-odc-primary shadow-sm'
                : 'text-odc-text-muted-light dark:text-odc-text-muted-dark'
            )}
          >
            <UserPlus size={16} />
            Conversation privée
          </button>
          <button
            onClick={() => {
              setMode('group');
              setSelected([]);
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              mode === 'group'
                ? 'bg-white dark:bg-odc-surface-dark text-odc-primary shadow-sm'
                : 'text-odc-text-muted-light dark:text-odc-text-muted-dark'
            )}
          >
            <Users size={16} />
            Nouveau groupe
          </button>
        </div>

        {/* Titre groupe */}
        {mode === 'group' && (
          <Input
            label="Nom du groupe"
            placeholder="Ex: Équipe développement"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
          />
        )}

        {/* Search */}
        <Input
          placeholder="Rechercher un membre..."
          icon={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Selection chips */}
        {selected.length > 0 && mode === 'group' && (
          <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-odc-primary-soft/50 dark:bg-odc-primary-soft/10">
            {selected.map((id) => {
              const user = users.find((u: any) => u.id === id);
              if (!user) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 px-2 py-1 rounded-full bg-white dark:bg-odc-surface-dark"
                >
                  <span className="text-xs font-medium">
                    {user.prenom} {user.nom}
                  </span>
                  <button
                    onClick={() => toggleSelect(id)}
                    className="p-0.5 rounded-full hover:bg-odc-error-bg text-odc-error"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Users list */}
        <div className="max-h-80 overflow-y-auto -mx-2">
          {loadingUsers ? (
            <Loader />
          ) : users.length === 0 ? (
            <EmptyState
              icon={<Users size={40} />}
              title="Aucun utilisateur"
              description="Aucun membre trouvé"
            />
          ) : (
            users.map((user: any) => {
              const isSelected = selected.includes(user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => toggleSelect(user.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-colors mx-2',
                    isSelected
                      ? 'bg-odc-primary-soft dark:bg-odc-primary-soft/20'
                      : 'hover:bg-odc-surface-alt-light dark:hover:bg-odc-surface-alt-dark'
                  )}
                >
                  <Avatar
                    src={user.photoUrl}
                    name={`${user.prenom} ${user.nom}`}
                    size="md"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-medium text-sm text-odc-text-light dark:text-odc-text-dark truncate">
                      {user.prenom} {user.nom}
                    </div>
                    <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark truncate">
                      {user.role?.nom}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-odc-primary flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}