'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Upload, Loader2, FolderOpen, X } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

const TYPES = [
  { value: 'PDF', label: 'PDF' },
  { value: 'VIDEO', label: 'Vidéo' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'LIEN', label: 'Lien' },
  { value: 'DOCUMENT', label: 'Document' },
  { value: 'PRESENTATION', label: 'Présentation' },
];

export function RessourceUploadDialog() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    sessionId: '',
    titre: '',
    description: '',
    type: 'PDF',
    visibleParticipants: true,
  });

  const { data: sessions } = useQuery({
    queryKey: ['staff', 'sessions', 'all'],
    queryFn: async () => {
      const { data } = await api.get('/staff/sessions', { params: { limit: 100 } });
      return data.data;
    },
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('Fichier requis');
      const fd = new FormData();
      fd.append('fichier', file);
      fd.append('sessionId', form.sessionId);
      fd.append('titre', form.titre);
      fd.append('description', form.description);
      fd.append('type', form.type);
      fd.append('visibleParticipants', String(form.visibleParticipants));

      await api.post('/staff/ressources', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      toast.success('Ressource uploadée');
      qc.invalidateQueries({ queryKey: ['staff', 'ressources'] });
      setOpen(false);
      setFile(null);
      setForm({
        sessionId: '',
        titre: '',
        description: '',
        type: 'PDF',
        visibleParticipants: true,
      });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="odc">
          <Upload className="h-4 w-4 mr-2" /> Uploader
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle ressource</DialogTitle>
          <DialogDescription>
            Uploadez un support pédagogique pour une session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="sessionId">Session *</Label>
            <Select
              value={form.sessionId}
              onValueChange={(v) => setForm({ ...form, sessionId: v })}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Sélectionnez une session" />
              </SelectTrigger>
              <SelectContent>
                {sessions?.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.codeSession} — {s.formation?.titre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titre">Titre *</Label>
              <Input
                id="titre"
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Fichier *</Label>
            <input
              ref={fileRef}
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="mt-1.5 flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileRef.current?.click()}
              >
                <FolderOpen className="h-4 w-4 mr-2" /> Choisir
              </Button>
              {file && (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm truncate">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setFile(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button
            variant="odc"
            onClick={() => mutation.mutate()}
            disabled={!file || !form.sessionId || !form.titre || mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Uploader
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}