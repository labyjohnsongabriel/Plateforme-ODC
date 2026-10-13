'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2, Save, ArrowLeft, Upload, BookOpen, X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

interface Props {
  mode: 'create' | 'edit';
  id?: string;
}

export function FormationForm({ mode, id }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const isEdit = mode === 'edit';
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    titre: '',
    slug: '',
    description: '',
    objectifs: '',
    prerequis: '',
    programme: '',
    domaineId: '',
    niveau: 'DEBUTANT',
    dureeHeures: 10,
    imageUrl: '',
    prix: 0,
    nbParticipantsMax: 30,
    estPubliee: false,
    actif: true,
    miseEnAvant: false,
  });

  const { data: domaines } = useQuery({
    queryKey: ['staff', 'domaines'],
    queryFn: async () => {
      const { data } = await api.get('/staff/domaines');
      return data.data;
    },
  });

  const { data: existing } = useQuery({
    queryKey: ['staff', 'formation', id],
    queryFn: async () => {
      const { data } = await api.get(`/staff/formations/${id}`);
      return data.data;
    },
    enabled: isEdit && !!id,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        titre: existing.titre ?? '',
        slug: existing.slug ?? '',
        description: existing.description ?? '',
        objectifs: existing.objectifs ?? '',
        prerequis: existing.prerequis ?? '',
        programme: existing.programme ?? '',
        domaineId: existing.domaineId ?? '',
        niveau: existing.niveau ?? 'DEBUTANT',
        dureeHeures: existing.dureeHeures ?? 10,
        imageUrl: existing.imageUrl ?? '',
        prix: existing.prix ?? 0,
        nbParticipantsMax: existing.nbParticipantsMax ?? 30,
        estPubliee: existing.estPubliee ?? false,
        actif: existing.actif ?? true,
        miseEnAvant: existing.miseEnAvant ?? false,
      });
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        domaineId: form.domaineId || undefined,
        slug: form.slug || undefined,
      };
      if (isEdit) {
        await api.put(`/staff/formations/${id}`, payload);
      } else {
        await api.post('/staff/formations', payload);
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Formation mise à jour' : 'Formation créée');
      qc.invalidateQueries({ queryKey: ['staff', 'formations'] });
      router.push('/staff/formations');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const uploadImage = async (file: File) => {
    if (!isEdit || !id) {
      toast.info('Enregistrez la formation avant d\'uploader une image');
      return;
    }
    const fd = new FormData();
    fd.append('image', file);
    try {
      const { data } = await api.post(`/staff/formations/${id}/image`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm({ ...form, imageUrl: data.data.imageUrl });
      toast.success('Image mise à jour');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

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
          {/* Image */}
          <div>
            <Label>Image de couverture</Label>
            <div className="mt-1.5 flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg bg-odc-surface-alt flex items-center justify-center overflow-hidden shrink-0">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="h-8 w-8 text-odc-muted" />
                )}
              </div>
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImage(f);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={!isEdit}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Changer l&apos;image
                </Button>
                {!isEdit && (
                  <p className="text-xs text-odc-muted mt-1.5">
                    Enregistrez d&apos;abord la formation
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="titre">Titre *</Label>
              <Input
                id="titre"
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                required
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              required
              className="mt-1.5"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="domaineId">Domaine *</Label>
              <Select
                value={form.domaineId}
                onValueChange={(v) => setForm({ ...form, domaineId: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  {domaines?.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="niveau">Niveau *</Label>
              <Select
                value={form.niveau}
                onValueChange={(v) => setForm({ ...form, niveau: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEBUTANT">Débutant</SelectItem>
                  <SelectItem value="INTERMEDIAIRE">Intermédiaire</SelectItem>
                  <SelectItem value="AVANCE">Avancé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="duree">Durée (h) *</Label>
              <Input
                id="duree"
                type="number"
                value={form.dureeHeures}
                onChange={(e) => setForm({ ...form, dureeHeures: Number(e.target.value) })}
                min={1}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="places">Places max</Label>
              <Input
                id="places"
                type="number"
                value={form.nbParticipantsMax}
                onChange={(e) => setForm({ ...form, nbParticipantsMax: Number(e.target.value) })}
                min={0}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="prix">Prix (Ar)</Label>
              <Input
                id="prix"
                type="number"
                value={form.prix}
                onChange={(e) => setForm({ ...form, prix: Number(e.target.value) })}
                min={0}
                className="mt-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contenu pédagogique</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="objectifs">Objectifs</Label>
            <Textarea
              id="objectifs"
              value={form.objectifs}
              onChange={(e) => setForm({ ...form, objectifs: e.target.value })}
              rows={3}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="prerequis">Prérequis</Label>
            <Textarea
              id="prerequis"
              value={form.prerequis}
              onChange={(e) => setForm({ ...form, prerequis: e.target.value })}
              rows={3}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="programme">Programme détaillé</Label>
            <Textarea
              id="programme"
              value={form.programme}
              onChange={(e) => setForm({ ...form, programme: e.target.value })}
              rows={6}
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="actif">Actif</Label>
            <Switch
              id="actif"
              checked={form.actif}
              onCheckedChange={(v) => setForm({ ...form, actif: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="publiee">Publié</Label>
            <Switch
              id="publiee"
              checked={form.estPubliee}
              onCheckedChange={(v) => setForm({ ...form, estPubliee: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="miseEnAvant">Mise en avant</Label>
            <Switch
              id="miseEnAvant"
              checked={form.miseEnAvant}
              onCheckedChange={(v) => setForm({ ...form, miseEnAvant: v })}
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
          {isEdit ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}