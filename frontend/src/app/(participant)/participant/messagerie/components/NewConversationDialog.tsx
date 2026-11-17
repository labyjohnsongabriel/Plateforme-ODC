// src/app/(participant)/participant/messagerie/components/NewConversationDialog.tsx
'use client';

import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  MessageSquare,
  Users,
  Loader2,
  Search,
  Plus,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { getInitials, cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/error-handler';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Props {
  onCreated: (conversationId: string) => void;
}

interface UserRow {
  id: string;
  nom?: string | null;
  prenom?: string | null;
  photoUrl?: string | null;
  role?: { nom?: string; libelle?: string } | null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function NewConversationDialog({ onCreated }: Props) {
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'private' | 'group'>('private');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupTitle, setGroupTitle] = useState('');

  /* ═══════════════════════════════════════════════════════════════════════
     QUERY — utilisateurs
     ═══════════════════════════════════════════════════════════════════════ */
  const { data: users, isLoading } = useQuery<UserRow[]>({
    queryKey: ['messagerie', 'users', search],
    queryFn: async () => {
      const { data } = await api.get('/messagerie/utilisateurs', {
        params: { q: search || undefined, limit: 50 },
      });
      return data.data ?? [];
    },
    enabled: open,
  });

  /* ═══════════════════════════════════════════════════════════════════════
     MUTATIONS
     ═══════════════════════════════════════════════════════════════════════ */
  const createPrivateMutation = useMutation({
    mutationFn: async (destinataireId: string) => {
      const { data } = await api.post('/messagerie/conversations/privee', {
        destinataireId,
      });
      return data.data;
    },
    onSuccess: (conv) => {
      toast.success('Conversation créée');
      qc.invalidateQueries({ queryKey: ['messagerie', 'conversations'] });
      handleClose();
      onCreated(conv.id);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const createGroupMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/messagerie/conversations/groupe', {
        titre: groupTitle.trim(),
        membreIds: selectedIds,
      });
      return data.data;
    },
    onSuccess: (conv) => {
      toast.success('Groupe créé');
      qc.invalidateQueries({ queryKey: ['messagerie', 'conversations'] });
      handleClose();
      onCreated(conv.id);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ═══════════════════════════════════════════════════════════════════════
     HELPERS
     ═══════════════════════════════════════════════════════════════════════ */
  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setSearch('');
      setSelectedIds([]);
      setGroupTitle('');
      setTab('private');
    }, 200);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  };

  const filteredUsers = useMemo(() => users ?? [], [users]);

  const canCreateGroup =
    groupTitle.trim().length > 0 &&
    selectedIds.length > 0 &&
    !createGroupMutation.isPending;

  /* ═══════════════════════════════════════════════════════════════════════
     RENDU
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Nouvelle conversation
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b p-5 pb-3">
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-4 w-4 text-primary" aria-hidden />
            </div>
            Nouvelle conversation
          </DialogTitle>
          <DialogDescription>
            Choisissez un membre ou créez un groupe pour démarrer.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as 'private' | 'group')}
          className="flex-1"
        >
          <div className="px-5 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="private" className="gap-2">
                <MessageSquare className="h-4 w-4" aria-hidden />
                Privée
              </TabsTrigger>
              <TabsTrigger value="group" className="gap-2">
                <Users className="h-4 w-4" aria-hidden />
                Groupe
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ═══ PRIVÉE ═══ */}
          <TabsContent value="private" className="mt-0 space-y-3 p-5 pt-4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un membre…"
                className="pl-9"
              />
            </div>

            <div className="scrollbar-thin -mx-1 max-h-[320px] space-y-1 overflow-y-auto px-1">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex animate-pulse items-center gap-3 rounded-lg p-2"
                  >
                    <div className="h-9 w-9 rounded-full bg-muted" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-32 rounded bg-muted" />
                      <div className="h-2 w-20 rounded bg-muted" />
                    </div>
                  </div>
                ))
              ) : filteredUsers.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  Aucun membre trouvé
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => createPrivateMutation.mutate(u.id)}
                    disabled={createPrivateMutation.isPending}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors',
                      'hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50',
                      createPrivateMutation.isPending &&
                        createPrivateMutation.variables === u.id &&
                        'bg-primary/5',
                    )}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={u.photoUrl ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                        {getInitials(u.nom ?? '', u.prenom ?? '')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {u.prenom} {u.nom}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {u.role?.libelle ?? u.role?.nom ?? 'Membre'}
                      </p>
                    </div>

                    {createPrivateMutation.isPending &&
                      createPrivateMutation.variables === u.id && (
                        <Loader2
                          className="h-4 w-4 shrink-0 animate-spin text-primary"
                          aria-hidden
                        />
                      )}
                  </button>
                ))
              )}
            </div>
          </TabsContent>

          {/* ═══ GROUPE ═══ */}
          <TabsContent value="group" className="mt-0 space-y-3 p-5 pt-4">
            <div>
              <Label htmlFor="groupTitle" className="text-xs font-medium">
                Titre du groupe
              </Label>
              <Input
                id="groupTitle"
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                placeholder="Ex : Équipe projet React"
                className="mt-1.5"
                maxLength={80}
              />
            </div>

            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher des membres…"
                className="pl-9"
              />
            </div>

            <div className="scrollbar-thin -mx-1 max-h-[240px] space-y-1 overflow-y-auto px-1">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex animate-pulse items-center gap-3 rounded-lg p-2"
                  >
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div className="h-3 w-32 flex-1 rounded bg-muted" />
                  </div>
                ))
              ) : filteredUsers.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Aucun membre trouvé
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const selected = selectedIds.includes(u.id);
                  return (
                    <label
                      key={u.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors',
                        selected
                          ? 'bg-primary/5 ring-1 ring-primary/20'
                          : 'hover:bg-muted/60',
                      )}
                    >
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => toggleSelect(u.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.photoUrl ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">
                          {getInitials(u.nom ?? '', u.prenom ?? '')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-foreground">
                          {u.prenom} {u.nom}
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            {selectedIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {selectedIds.length}
                </span>{' '}
                membre{selectedIds.length > 1 ? 's' : ''} sélectionné
                {selectedIds.length > 1 ? 's' : ''}
              </p>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t bg-muted/30 p-4">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          {tab === 'group' && (
            <Button
              onClick={() => createGroupMutation.mutate()}
              disabled={!canCreateGroup}
            >
              {createGroupMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Users className="mr-2 h-4 w-4" aria-hidden />
              )}
              Créer le groupe
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}