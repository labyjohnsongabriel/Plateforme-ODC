// src/components/messagerie/NewConversationModal.tsx
'use client';

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
    [debouncedSearch, isOpen],
  );

  const users = data?.data || [];

  const toggleSelect = (userId: string) => {
    if (mode === 'private') {
      setSelected([userId]);
    } else {
      setSelected((prev) =>
        prev.includes(userId) ? prev.filter((i) => i !== userId) : [...prev, userId],
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
        {/* Onglets mode */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => {
              setMode('private');
              setSelected([]);
            }}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              mode === 'private'
                ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-950 dark:text-orange-400'
                : 'text-slate-500 dark:text-slate-400',
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
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              mode === 'group'
                ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-950 dark:text-orange-400'
                : 'text-slate-500 dark:text-slate-400',
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

        {/* Recherche */}
        <Input
          placeholder="Rechercher un membre..."
          icon={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Chips sélection */}
        {selected.length > 0 && mode === 'group' && (
          <div className="flex flex-wrap gap-2 rounded-lg bg-orange-50 p-2 dark:bg-orange-500/10">
            {selected.map((id) => {
              const user = users.find((u: any) => u.id === id);
              if (!user) return null;
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 rounded-full bg-white px-2 py-1 dark:bg-slate-950"
                >
                  <span className="text-xs font-medium text-slate-900 dark:text-slate-50">
                    {user.prenom} {user.nom}
                  </span>
                  <button
                    onClick={() => toggleSelect(id)}
                    className="rounded-full p-0.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Liste utilisateurs */}
        <div className="-mx-2 max-h-80 overflow-y-auto">
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
                    'mx-2 flex w-full items-center gap-3 rounded-lg p-3 transition-colors',
                    isSelected
                      ? 'bg-orange-50 dark:bg-orange-500/10'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900',
                  )}
                >
                  <Avatar
                    src={user.photoUrl}
                    name={`${user.prenom} ${user.nom}`}
                    size="md"
                  />
                  <div className="min-w-0 flex-1 text-left">
                    <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">
                      {user.prenom} {user.nom}
                    </div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user.role?.nom}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-500">
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