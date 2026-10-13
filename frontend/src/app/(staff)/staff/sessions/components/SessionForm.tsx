'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
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

const STATUTS = ['PLANIFIEE', 'OUVERTE', 'EN_COURS', 'TERMINEE', 'ANNULEE'];

export function SessionForm({ mode, id }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const isEdit = mode === 'edit';

  const [form, setForm] = useState({
    formationId: '',
    formateurId: '',
    codeSession: '',
    dateDebut: '',
    dateFin: '',
    lieu: '',
    lienVisio: '',
    capacite: 30,
    statut: 'PLANIFIEE',
    notes: '',
    estPubliee: true,
    dateOuvertureInscriptions: '',
    dateFermetureInscriptions: '',
  });

  const { data: formations } = useQuery({
    queryKey: ['staff', 'formations', 'all'],
    queryFn: async () => {
      const { data } = await api.get('/staff/formations', { params: { limit: 100 } });
      return data.data;
    },
  });

  const { data: formateurs } = useQuery({
    queryKey: ['staff', 'formateurs'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', {
        params: { role: 'FORMATEUR', limit: 100 },
      });
      return data.data;
    },
  });

  const { data: existing } = useQuery({
    queryKey: ['staff', 'session', id],
    queryFn: async () => {
      const { data } = await api.get(`/staff/sessions/${id}`);
      return data.data;
    },
    enabled: isEdit && !!id,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        formationId: existing.formationId ?? '',
        formateurId: existing.formateurId ?? '',
        codeSession: existing.codeSession ?? '',
        dateDebut: existing.dateDebut?.slice(0, 10) ?? '',
        dateFin: existing.dateFin?.slice(0, 10) ?? '',
        lieu: existing.lieu ?? '',
        lienVisio: existing.lienVisio ?? '',
        capacite: existing.capacite ?? 30,
        statut: existing.statut ?? 'PLANIFIEE',
        notes: existing.notes ?? '',
        estPubliee: existing.estPubliee ?? true,
        dateOuvertureInscriptions: existing.dateOuvertureInscriptions?.slice(0, 16) ?? '',
        dateFermetureInscriptions: existing.dateFermetureInscriptions?.slice(0, 16) ?? '',
      });
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        formateurId: form.formateurId || undefined,
        codeSession: form.codeSession || undefined,
        dateOuvertureInscriptions: form.dateOuvertureInscriptions || undefined,
        dateFermetureInscriptions: form.dateFermetureInscriptions || undefined,
      };
      if (isEdit) {
        await api.put(`/staff/sessions/${id}`, payload);
      } else {
        await api.post('/staff/sessions', payload);
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Session mise à jour' : 'Session créée');
      qc.invalidateQueries({ queryKey: ['staff', 'sessions'] });
      router.push('/staff/sessions');
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
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="formationId">Formation *</Label>
              <Select
                value={form.formationId}
                onValueChange={(v) => setForm({ ...form, formationId: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  {formations?.map((f: any) => (
                    <SelectItem key={f.id} value={f.id}>{f.titre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="formateurId">Formateur</Label>
              <Select
                value={form.formateurId}
                onValueChange={(v) => setForm({ ...form, formateurId: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Optionnel" />
                </SelectTrigger>
                <SelectContent>
                  {formateurs?.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.prenom} {u.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="codeSession">Code session</Label>
            <Input
              id="codeSession"
              value={form.codeSession}
              onChange={(e) => setForm({ ...form, codeSession: e.target.value })}
              placeholder="Auto-généré si vide"
              className="mt-1.5 font-mono"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateDebut">Date de début *</Label>
              <Input
                id="dateDebut"
                type="date"
                value={form.dateDebut}
                onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="dateFin">Date de fin *</Label>
              <Input
                id="dateFin"
                type="date"
                value={form.dateFin}
                onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
                required
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lieu">Lieu</Label>
              <Input
                id="lieu"
                value={form.lieu}
                onChange={(e) => setForm({ ...form, lieu: e.target.value })}
                placeholder="Ex: ODC Antananarivo"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="lienVisio">Lien visio</Label>
              <Input
                id="lienVisio"
                value={form.lienVisio}
                onChange={(e) => setForm({ ...form, lienVisio: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="capacite">Capacité *</Label>
              <Input
                id="capacite"
                type="number"
                value={form.capacite}
                onChange={(e) => setForm({ ...form, capacite: Number(e.target.value) })}
                min={1}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="statut">Statut</Label>
              <Select
                value={form.statut}
                onValueChange={(v) => setForm({ ...form, statut: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUTS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes internes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="mt-1.5"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inscriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateOuverture">Ouverture</Label>
              <Input
                id="dateOuverture"
                type="datetime-local"
                value={form.dateOuvertureInscriptions}
                onChange={(e) => setForm({ ...form, dateOuvertureInscriptions: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="dateFermeture">Fermeture</Label>
              <Input
                id="dateFermeture"
                type="datetime-local"
                value={form.dateFermetureInscriptions}
                onChange={(e) => setForm({ ...form, dateFermetureInscriptions: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="publiee">Publier la session</Label>
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
          {isEdit ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}