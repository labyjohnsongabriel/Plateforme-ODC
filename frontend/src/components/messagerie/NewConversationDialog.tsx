// src/components/messagerie/NewConversationDialog.tsx
'use client';

import { useState } from 'react';
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

export function NewConversationDialog({ onCreated }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'private' | 'group'>('private');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupTitle, setGroupTitle] = useState('');

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

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setSearch('');
      setSelectedIds([]);
      setGroupTitle('');
      setTab('private');
    }, 200);
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  const canCreateGroup =
    groupTitle.trim().length > 0 &&
    selectedIds.length > 0 &&
    !createGroupMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Nouvelle conversation
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b p-4 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
            </div>
            Nouvelle conversation
          </DialogTitle>
          <DialogDescription className="text-xs">
            Choisissez un membre ou créez un groupe.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <div className="px-4 pt-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="private" className="gap-1.5 text-xs">
                <MessageSquare className="h-3.5 w-3.5" />
                Privée
              </TabsTrigger>
              <TabsTrigger value="group" className="gap-1.5 text-xs">
                <Users className="h-3.5 w-3.5" />
                Groupe
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="private" className="mt-0 space-y-2 p-4 pt-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="h-9 pl-9"
              />
            </div>

            <div className="scrollbar-thin -mx-1 max-h-[300px] space-y-1 overflow-y-auto px-1">
              {isLoading ? (
                <div className="space-y-2 py-2">
                  {Array.from({ length: 4 }).map((_, i) => (
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
                  ))}
                </div>
              ) : (users ?? []).length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Aucun membre trouvé
                </div>
              ) : (
                (users ?? []).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => createPrivateMutation.mutate(u.id)}
                    disabled={createPrivateMutation.isPending}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors',
                      'hover:bg-muted/60 disabled:opacity-50',
                    )}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={u.photoUrl ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
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
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                  </button>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="group" className="mt-0 space-y-2 p-4 pt-3">
            <div>
              <Label htmlFor="groupTitle" className="text-xs font-medium">
                Titre du groupe
              </Label>
              <Input
                id="groupTitle"
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                placeholder="Ex : Équipe projet React"
                className="mt-1 h-9"
                maxLength={80}
              />
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher des membres…"
                className="h-9 pl-9"
              />
            </div>

            <div className="scrollbar-thin -mx-1 max-h-[220px] space-y-1 overflow-y-auto px-1">
              {(users ?? []).map((u) => {
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
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
                        {getInitials(u.nom ?? '', u.prenom ?? '')}
                      </AvatarFallback>
                    </Avatar>
                    <p className="min-w-0 flex-1 truncate text-sm text-foreground">
                      {u.prenom} {u.nom}
                    </p>
                  </label>
                );
              })}
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

        <DialogFooter className="border-t bg-muted/30 p-3">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Annuler
          </Button>
          {tab === 'group' && (
            <Button
              size="sm"
              onClick={() => createGroupMutation.mutate()}
              disabled={!canCreateGroup}
            >
              {createGroupMutation.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Users className="mr-1.5 h-3.5 w-3.5" />
              )}
              Créer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}