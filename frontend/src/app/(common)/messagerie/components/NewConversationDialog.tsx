'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MessageSquare, Users, Loader2, Search } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { getErrorMessage } from '@/lib/error-handler';

export function NewConversationDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'private' | 'group'>('private');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupTitle, setGroupTitle] = useState('');

  const { data: users } = useQuery({
    queryKey: ['messagerie', 'users', search],
    queryFn: async () => {
      const { data } = await api.get('/participant/reseau/annuaire', {
        params: { q: search || undefined, limit: 50 },
      });
      return data.data;
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
    onSuccess: (conv: any) => {
      toast.success('Conversation créée');
      setOpen(false);
      router.push(`/messagerie/${conv.id}`);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const createGroupMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/messagerie/conversations/groupe', {
        titre: groupTitle,
        membreIds: selectedIds,
      });
      return data.data;
    },
    onSuccess: (conv: any) => {
      toast.success('Groupe créé');
      setOpen(false);
      setSelectedIds([]);
      setGroupTitle('');
      router.push(`/messagerie/${conv.id}`);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="odc">
          <MessageSquare className="h-4 w-4 mr-2" /> Nouvelle conversation
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle conversation</DialogTitle>
          <DialogDescription>
            Choisissez un membre ou créez un groupe
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="private">
              <MessageSquare className="h-4 w-4 mr-2" />
              Privée
            </TabsTrigger>
            <TabsTrigger value="group">
              <Users className="h-4 w-4 mr-2" />
              Groupe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="private" className="space-y-3 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-odc-muted pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un membre…"
                className="pl-9"
              />
            </div>
            <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-1">
              {users?.map((u: any) => (
                <button
                  key={u.id}
                  onClick={() => createPrivateMutation.mutate(u.id)}
                  disabled={createPrivateMutation.isPending}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-odc-surface-alt transition-colors text-left"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={u.photoUrl ?? undefined} />
                    <AvatarFallback className="bg-odc-primary-soft text-odc-primary text-xs">
                      {getInitials(u.nom, u.prenom)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {u.prenom} {u.nom}
                    </p>
                    <p className="text-xs text-odc-muted truncate">
                      {u.role?.libelle ?? u.role?.nom}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="group" className="space-y-3 mt-4">
            <div>
              <Label htmlFor="groupTitle">Titre du groupe</Label>
              <Input
                id="groupTitle"
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                placeholder="Ex: Équipe projet React"
                className="mt-1.5"
              />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-odc-muted pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher des membres…"
                className="pl-9"
              />
            </div>

            <div className="max-h-48 overflow-y-auto scrollbar-thin space-y-1">
              {users?.map((u: any) => (
                <label
                  key={u.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-odc-surface-alt transition-colors cursor-pointer"
                >
                  <Checkbox
                    checked={selectedIds.includes(u.id)}
                    onCheckedChange={() => toggleSelect(u.id)}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={u.photoUrl ?? undefined} />
                    <AvatarFallback className="bg-odc-primary-soft text-odc-primary text-[10px]">
                      {getInitials(u.nom, u.prenom)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">
                      {u.prenom} {u.nom}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {selectedIds.length > 0 && (
              <p className="text-xs text-odc-muted">
                {selectedIds.length} membre(s) sélectionné(s)
              </p>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          {tab === 'group' && (
            <Button
              variant="odc"
              onClick={() => createGroupMutation.mutate()}
              disabled={
                !groupTitle.trim() ||
                selectedIds.length === 0 ||
                createGroupMutation.isPending
              }
            >
              {createGroupMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Créer le groupe
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}