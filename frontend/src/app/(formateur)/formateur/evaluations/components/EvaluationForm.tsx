'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

const TYPES = [
  { value: 'PRE_TEST', label: 'Pré-test' },
  { value: 'POST_TEST', label: 'Post-test' },
  { value: 'QUIZ', label: 'Quiz' },
  { value: 'PROJET', label: 'Projet' },
  { value: 'EXAMEN', label: 'Examen' },
  { value: 'TP', label: 'Travaux pratiques' },
  { value: 'ORAL', label: 'Oral' },
];

interface Props {
  mode: 'create' | 'edit';
  id?: string;
}

export function EvaluationForm({ mode, id }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const isEdit = mode === 'edit';
  const preSelectedSessionId = searchParams.get('sessionId');

  const [form, setForm] = useState({
    sessionId: preSelectedSessionId ?? '',
    titre: '',
    type: 'QUIZ',
    noteMax: 20,
    noteMinPassage: 10,
    coefficient: 1,
    dateEvaluation: '',
    dureeMinutes: 60,
    description: '',
    consignes: '',
    publiee: false,
  });

  const { data: sessions } = useQuery({
    queryKey: ['formateur', 'sessions'],
    queryFn: async () => {
      const { data } = await api.get('/formateur/sessions');
      return data.data;
    },
  });

  const { data: existing } = useQuery({
    queryKey: ['formateur', 'evaluation', id],
    queryFn: async () => {
      const { data } = await api.get(`/formateur/evaluations/${id}`);
      return data.data;
    },
    enabled: isEdit && !!id,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        sessionId: existing.sessionId ?? '',
        titre: existing.titre ?? '',
        type: existing.type ?? 'QUIZ',
        noteMax: existing.noteMax ?? 20,
        noteMinPassage: existing.noteMinPassage ?? 10,
        coefficient: existing.coefficient ?? 1,
        dateEvaluation: existing.dateEvaluation?.slice(0, 10) ?? '',
        dureeMinutes: existing.dureeMinutes ?? 60,
        description: existing.description ?? '',
        consignes: existing.consignes ?? '',
        publiee: existing.publiee ?? false,
      });
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        dateEvaluation: form.dateEvaluation || undefined,
      };
      if (isEdit) {
        await api.put(`/formateur/evaluations/${id}`, payload);
      } else {
        await api.post('/formateur/evaluations', payload);
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Évaluation mise à jour' : 'Évaluation créée');
      qc.invalidateQueries({ queryKey: ['formateur', 'evaluations'] });
      router.push('/formateur/evaluations');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="space-y-6 max-w-3xl"
    >
      <Button type="button" variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="sessionId">Session *</Label>
            <Select
              value={form.sessionId}
              onValueChange={(v) => setForm({ ...form, sessionId: v })}
              disabled={isEdit}
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
                required
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
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="noteMax">Note max</Label>
              <Input
                id="noteMax"
                type="number"
                value={form.noteMax}
                onChange={(e) => setForm({ ...form, noteMax: Number(e.target.value) })}
                min={1}
                max={100}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="noteMin">Note min. passage</Label>
              <Input
                id="noteMin"
                type="number"
                value={form.noteMinPassage}
                onChange={(e) => setForm({ ...form, noteMinPassage: Number(e.target.value) })}
                min={0}
                max={100}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="coefficient">Coefficient</Label>
              <Input
                id="coefficient"
                type="number"
                step="0.5"
                value={form.coefficient}
                onChange={(e) => setForm({ ...form, coefficient: Number(e.target.value) })}
                min={0.5}
                max={10}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateEvaluation">Date</Label>
              <Input
                id="dateEvaluation"
                type="date"
                value={form.dateEvaluation}
                onChange={(e) => setForm({ ...form, dateEvaluation: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="duree">Durée (minutes)</Label>
              <Input
                id="duree"
                type="number"
                value={form.dureeMinutes}
                onChange={(e) => setForm({ ...form, dureeMinutes: Number(e.target.value) })}
                min={5}
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
              rows={3}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="consignes">Consignes</Label>
            <Textarea
              id="consignes"
              value={form.consignes}
              onChange={(e) => setForm({ ...form, consignes: e.target.value })}
              rows={5}
              className="mt-1.5"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <Label htmlFor="publiee">Publier l&apos;évaluation</Label>
              <p className="text-xs text-odc-muted mt-0.5">
                Les participants pourront la voir et la passer
              </p>
            </div>
            <Switch
              id="publiee"
              checked={form.publiee}
              onCheckedChange={(v) => setForm({ ...form, publiee: v })}
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