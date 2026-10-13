'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2, Save, Building2, Upload, Globe, Mail, Phone, Camera,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

export function PartenaireForm() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: fiche, isLoading } = useQuery({
    queryKey: ['partenaire', 'fiche'],
    queryFn: async () => {
      const { data } = await api.get('/partenaire/fiche');
      return data.data;
    },
  });

  const [form, setForm] = useState({
    nom: '',
    secteur: '',
    description: '',
    contactEmail: '',
    contactTel: '',
    siteWeb: '',
    logoUrl: '',
  });

  useEffect(() => {
    if (fiche) {
      setForm({
        nom: fiche.nom ?? '',
        secteur: fiche.secteur ?? '',
        description: fiche.description ?? '',
        contactEmail: fiche.contactEmail ?? '',
        contactTel: fiche.contactTel ?? '',
        siteWeb: fiche.siteWeb ?? '',
        logoUrl: fiche.logoUrl ?? '',
      });
    }
  }, [fiche]);

  const mutation = useMutation({
    mutationFn: async () => {
      await api.put('/partenaire/fiche', form);
    },
    onSuccess: () => {
      toast.success('Fiche mise à jour');
      qc.invalidateQueries({ queryKey: ['partenaire', 'fiche'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const uploadLogo = async (file: File) => {
    const fd = new FormData();
    fd.append('logo', file);
    try {
      const { data } = await api.post('/partenaire/profil/logo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = data.data.photoUrl ?? data.data.logoUrl;
      setForm({ ...form, logoUrl: url });
      toast.success('Logo mis à jour');
      qc.invalidateQueries({ queryKey: ['partenaire', 'fiche'] });
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  if (isLoading) {
    return <div className="h-96 bg-odc-surface-alt rounded-lg animate-pulse" />;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="space-y-6 max-w-3xl"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-odc-primary" />
            Identité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo */}
          <div>
            <Label>Logo de l&apos;organisation</Label>
            <div className="mt-1.5 flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg bg-odc-surface-alt flex items-center justify-center overflow-hidden shrink-0 border border-odc-border">
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-odc-muted" />
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
                    if (f) uploadLogo(f);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" /> Changer le logo
                </Button>
                <p className="text-xs text-odc-muted mt-1.5">
                  Format carré recommandé — PNG, JPG ou SVG
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nom">Nom de l&apos;organisation *</Label>
              <Input
                id="nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="secteur">Secteur d&apos;activité</Label>
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
              rows={5}
              placeholder="Présentez votre organisation et vos domaines d'expertise…"
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
              <Label htmlFor="contactEmail" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="contactTel" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Téléphone
              </Label>
              <Input
                id="contactTel"
                value={form.contactTel}
                onChange={(e) => setForm({ ...form, contactTel: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="siteWeb" className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" /> Site web
            </Label>
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

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant={fiche?.estPubliee ? 'default' : 'outline'}>
            {fiche?.estPubliee ? '📢 Publiée' : '📴 Non publiée'}
          </Badge>
          <span className="text-xs text-odc-muted">
            (publication gérée par l&apos;administrateur)
          </span>
        </div>

        <Button variant="odc" type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" /> Enregistrer
        </Button>
      </div>
    </form>
  );
}