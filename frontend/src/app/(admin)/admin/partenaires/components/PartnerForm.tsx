'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2, Save, ArrowLeft, Upload, Building2, X,
} from 'lucide-react';
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

export function PartnerForm({ mode, id }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const isEdit = mode === 'edit';
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nom: '',
    secteur: '',
    description: '',
    contactEmail: '',
    contactTel: '',
    siteWeb: '',
    logoUrl: '',
    actif: true,
    estPubliee: true,
    ordreAffichage: 0,
  });

  const { data: existing } = useQuery({
    queryKey: ['admin', 'partenaire', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/partenaires/${id}`);
      return data.data;
    },
    enabled: isEdit && !!id,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        nom: existing.nom ?? '',
        secteur: existing.secteur ?? '',
        description: existing.description ?? '',
        contactEmail: existing.contactEmail ?? '',
        contactTel: existing.contactTel ?? '',
        siteWeb: existing.siteWeb ?? '',
        logoUrl: existing.logoUrl ?? '',
        actif: existing.actif ?? true,
        estPubliee: existing.estPubliee ?? true,
        ordreAffichage: existing.ordreAffichage ?? 0,
      });
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        await api.put(`/admin/partenaires/${id}`, form);
      } else {
        await api.post('/admin/partenaires', form);
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Partenaire mis à jour' : 'Partenaire créé');
      qc.invalidateQueries({ queryKey: ['admin', 'partenaires'] });
      router.push('/admin/partenaires');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const uploadLogo = async (file: File) => {
    if (!isEdit || !id) {
      toast.info('Enregistrez d\'abord, puis téléversez le logo');
      return;
    }
    const fd = new FormData();
    fd.append('logo', file);
    try {
      const { data } = await api.post(`/admin/partenaires/${id}/logo`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm({ ...form, logoUrl: data.data.logoUrl });
      toast.success('Logo mis à jour');
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
          <CardTitle>Informations du partenaire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo */}
          <div>
            <Label>Logo</Label>
            <div className="mt-1.5 flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg bg-odc-surface-alt flex items-center justify-center overflow-hidden shrink-0">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="" className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="h-8 w-8 text-odc-muted" />
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadLogo(f);
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
                  Changer le logo
                </Button>
                {!isEdit && (
                  <p className="text-xs text-odc-muted mt-1.5">
                    Enregistrez le partenaire d&apos;abord
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="secteur">Secteur</Label>
              <Input
                id="secteur"
                value={form.secteur}
                onChange={(e) => setForm({ ...form, secteur: e.target.value })}
                placeholder="Ex: Télécommunications"
                className="mt-1.5"
              />
            </div>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="contactTel">Téléphone</Label>
              <Input
                id="contactTel"
                value={form.contactTel}
                onChange={(e) => setForm({ ...form, contactTel: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="siteWeb">Site web</Label>
            <Input
              id="siteWeb"
              type="url"
              value={form.siteWeb}
              onChange={(e) => setForm({ ...form, siteWeb: e.target.value })}
              placeholder="https://..."
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
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" variant="odc" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          {isEdit ? 'Mettre à jour' : 'Créer le partenaire'}
        </Button>
      </div>
    </form>
  );
}