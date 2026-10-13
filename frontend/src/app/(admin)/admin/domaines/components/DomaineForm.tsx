'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

interface Props {
  mode: 'create' | 'edit';
  id?: string;
}

export function DomaineForm({ mode, id }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    nom: '',
    description: '',
    couleur: '#FF7900',
    icone: '',
    actif: true,
    estPubliee: false,
    ordreAffichage: 0,
  });

  // Chargement en édition
  const { data: existing } = useQuery({
    queryKey: ['admin', 'domaine', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/domaines/${id}`);
      return data.data;
    },
    enabled: isEdit && !!id,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        nom: existing.nom ?? '',
        description: existing.description ?? '',
        couleur: existing.couleur ?? '#FF7900',
        icone: existing.icone ?? '',
        actif: existing.actif ?? true,
        estPubliee: existing.estPubliee ?? false,
        ordreAffichage: existing.ordreAffichage ?? 0,
      });
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        await api.put(`/admin/domaines/${id}`, form);
      } else {
        await api.post('/admin/domaines', form);
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Domaine mis à jour' : 'Domaine créé');
      qc.invalidateQueries({ queryKey: ['admin', 'domaines'] });
      router.push('/admin/domaines');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="space-y-6"
    >
      <Button type="button" variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nom">Nom du domaine *</Label>
            <Input
              id="nom"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              placeholder="Ex: Développement Web"
              required
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="mt-1.5"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="couleur">Couleur</Label>
              <Input
                id="couleur"
                type="color"
                value={form.couleur}
                onChange={(e) => setForm({ ...form, couleur: e.target.value })}
                className="mt-1.5 h-10"
              />
            </div>
            <div>
              <Label htmlFor="icone">Icône (emoji ou nom)</Label>
              <Input
                id="icone"
                value={form.icone}
                onChange={(e) => setForm({ ...form, icone: e.target.value })}
                placeholder="code, palette..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="ordre">Ordre d&apos;affichage</Label>
              <Input
                id="ordre"
                type="number"
                value={form.ordreAffichage}
                onChange={(e) =>
                  setForm({ ...form, ordreAffichage: Number(e.target.value) })
                }
                min={0}
                className="mt-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="actif">Actif</Label>
              <p className="text-xs text-odc-muted mt-0.5">
                Disponible dans la plateforme
              </p>
            </div>
            <Switch
              id="actif"
              checked={form.actif}
              onCheckedChange={(v) => setForm({ ...form, actif: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="publiee">Publié</Label>
              <p className="text-xs text-odc-muted mt-0.5">
                Visible sur le site public
              </p>
            </div>
            <Switch
              id="publiee"
              checked={form.estPubliee}
              onCheckedChange={(v) => setForm({ ...form, estPubliee: v })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" variant="odc" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          {isEdit ? 'Mettre à jour' : 'Créer le domaine'}
        </Button>
      </div>
    </form>
  );
}