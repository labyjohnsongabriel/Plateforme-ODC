'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Save, User, Briefcase, MapPin, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

export function ProfileForm() {
  const qc = useQueryClient();

  const { data: me, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data.data;
    },
  });

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    bio: '',
    ville: '',
    entreprise: '',
    poste: '',
    linkedin: '',
    siteWeb: '',
    competences: '',
  });

  useEffect(() => {
    if (me) {
      setForm({
        nom: me.nom ?? '',
        prenom: me.prenom ?? '',
        telephone: me.telephone ?? '',
        bio: me.bio ?? '',
        ville: me.ville ?? '',
        entreprise: me.entreprise ?? '',
        poste: me.poste ?? '',
        linkedin: me.linkedin ?? '',
        siteWeb: me.siteWeb ?? '',
        competences: (me.competences ?? []).join(', '),
      });
    }
  }, [me]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        competences: form.competences
          ? form.competences.split(',').map((c) => c.trim()).filter(Boolean)
          : undefined,
      };
      await api.put('/auth/me', payload);
    },
    onSuccess: () => {
      toast.success('Profil mis à jour');
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading) return <div className="h-96 bg-odc-surface-alt rounded-lg animate-pulse" />;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-odc-primary" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nom">Nom</Label>
              <Input id="nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="prenom">Prénom</Label>
              <Input id="prenom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} className="mt-1.5" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="ville">Ville</Label>
              <Input id="ville" value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} className="mt-1.5" />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} className="mt-1.5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-odc-primary" />
            Professionnel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entreprise">Entreprise</Label>
              <Input id="entreprise" value={form.entreprise} onChange={(e) => setForm({ ...form, entreprise: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="poste">Poste</Label>
              <Input id="poste" value={form.poste} onChange={(e) => setForm({ ...form, poste: e.target.value })} className="mt-1.5" />
            </div>
          </div>

          <div>
            <Label htmlFor="competences">Compétences (séparées par des virgules)</Label>
            <Input
              id="competences"
              value={form.competences}
              onChange={(e) => setForm({ ...form, competences: e.target.value })}
              placeholder="React, Node.js, Python…"
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-odc-primary" />
            Liens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input id="linkedin" type="url" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="siteWeb">Site web</Label>
              <Input id="siteWeb" type="url" value={form.siteWeb} onChange={(e) => setForm({ ...form, siteWeb: e.target.value })} placeholder="https://..." className="mt-1.5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="odc" type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" /> Enregistrer
        </Button>
      </div>
    </form>
  );
}