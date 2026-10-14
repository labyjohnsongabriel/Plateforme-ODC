// src/app/(admin)/admin/sessions/components/SessionForm.tsx
'use client';

import * as React from 'react';
import { Loader2, Save, Info, Calendar, Users, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import {
  useCreateSession,
  useUpdateSession,
  type Session,
  type SessionFormValues,
  type StatutSession,
} from '@/hooks/useSessions';

/* ============================================================================
   TYPES
   ============================================================================ */

interface SessionFormProps {
  mode: 'create' | 'edit';
  id?: string;
  existing?: Session | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const STATUTS: { value: StatutSession; label: string }[] = [
  { value: 'PLANIFIEE', label: 'Planifiée' },
  { value: 'OUVERTE', label: 'Ouverte' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'TERMINEE', label: 'Terminée' },
  { value: 'ANNULEE', label: 'Annulée' },
];

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function SessionForm({
  mode,
  id,
  existing,
  onSuccess,
  onCancel,
}: SessionFormProps) {
  const isEdit = mode === 'edit';

  const [form, setForm] = React.useState<SessionFormValues>({
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
    imageUrl: '',
    estPubliee: true,
    dateOuvertureInscriptions: '',
    dateFermetureInscriptions: '',
  });

  /* -------------------- Chargement en édition -------------------- */
  React.useEffect(() => {
    if (existing && isEdit) {
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
        imageUrl: existing.imageUrl ?? '',
        estPubliee: existing.estPubliee ?? true,
        dateOuvertureInscriptions:
          existing.dateOuvertureInscriptions?.slice(0, 16) ?? '',
        dateFermetureInscriptions:
          existing.dateFermetureInscriptions?.slice(0, 16) ?? '',
      });
    }
  }, [existing, isEdit]);

  /* -------------------- Formations -------------------- */
  const { data: formations = [] } = useQuery({
    queryKey: ['admin', 'formations', 'all'],
    queryFn: async () => {
      const { data } = await api.get('/admin/formations', {
        params: { limit: 200 },
      });
      return data?.data ?? [];
    },
    staleTime: 10 * 60_000,
  });

  /* -------------------- Formateurs -------------------- */
  const { data: formateurs = [] } = useQuery({
    queryKey: ['admin', 'users', 'formateurs'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', {
        params: { role: 'FORMATEUR', limit: 200 },
      });
      return data?.data ?? [];
    },
    staleTime: 10 * 60_000,
  });

  /* -------------------- Mutations -------------------- */
  const createMutation = useCreateSession();
  const updateMutation = useUpdateSession(id ?? '');
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  /* -------------------- Submit -------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: SessionFormValues = {
      ...form,
      formateurId: form.formateurId || undefined,
      codeSession: form.codeSession || undefined,
      lieu: form.lieu || undefined,
      lienVisio: form.lienVisio || undefined,
      notes: form.notes || undefined,
      imageUrl: form.imageUrl || undefined,
      dateOuvertureInscriptions:
        form.dateOuvertureInscriptions || undefined,
      dateFermetureInscriptions:
        form.dateFermetureInscriptions || undefined,
    };

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess?.();
    } catch {
      /* Erreur déjà gérée */
    }
  };

  /* -------------------- Rendu -------------------- */
  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* CARTE 1 — Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-odc-primary" />
            Informations générales
          </CardTitle>
          <CardDescription>Formation, formateur et code</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="formationId">
                Formation <span className="text-odc-error">*</span>
              </Label>
              <Select
                value={form.formationId}
                onValueChange={(v) => setForm({ ...form, formationId: v })}
                disabled={isSubmitting}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Sélectionnez une formation" />
                </SelectTrigger>
                <SelectContent>
                  {formations.map((f: any) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="formateurId">Formateur</Label>
              <Select
                value={form.formateurId ?? ''}
                onValueChange={(v) => setForm({ ...form, formateurId: v })}
                disabled={isSubmitting}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Optionnel" />
                </SelectTrigger>
                <SelectContent>
                  {formateurs.map((u: any) => (
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
              disabled={isSubmitting}
              className="mt-1.5 font-mono"
            />
          </div>
        </CardContent>
      </Card>

      {/* CARTE 2 — Planning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-odc-primary" />
            Planning
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="dateDebut">
                Date de début <span className="text-odc-error">*</span>
              </Label>
              <Input
                id="dateDebut"
                type="date"
                value={form.dateDebut}
                onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
                disabled={isSubmitting}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="dateFin">
                Date de fin <span className="text-odc-error">*</span>
              </Label>
              <Input
                id="dateFin"
                type="date"
                value={form.dateFin}
                onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
                disabled={isSubmitting}
                required
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="lieu">Lieu</Label>
              <Input
                id="lieu"
                value={form.lieu}
                onChange={(e) => setForm({ ...form, lieu: e.target.value })}
                placeholder="Ex : ODC Antananarivo"
                disabled={isSubmitting}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="lienVisio">Lien visio</Label>
              <Input
                id="lienVisio"
                value={form.lienVisio}
                onChange={(e) => setForm({ ...form, lienVisio: e.target.value })}
                placeholder="https://meet..."
                disabled={isSubmitting}
                className="mt-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARTE 3 — Capacité & statut */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-odc-primary" />
            Capacité & statut
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="capacite">
                Capacité <span className="text-odc-error">*</span>
              </Label>
              <Input
                id="capacite"
                type="number"
                min={1}
                max={1000}
                value={form.capacite}
                onChange={(e) =>
                  setForm({ ...form, capacite: Number(e.target.value) })
                }
                disabled={isSubmitting}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="statut">Statut</Label>
              <Select
                value={form.statut}
                onValueChange={(v) =>
                  setForm({ ...form, statut: v as StatutSession })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARTE 4 — Inscriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-odc-primary" />
            Inscriptions
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="dateOuverture">Ouverture des inscriptions</Label>
              <Input
                id="dateOuverture"
                type="datetime-local"
                value={form.dateOuvertureInscriptions}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dateOuvertureInscriptions: e.target.value,
                  })
                }
                disabled={isSubmitting}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="dateFermeture">Fermeture des inscriptions</Label>
              <Input
                id="dateFermeture"
                type="datetime-local"
                value={form.dateFermetureInscriptions}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dateFermetureInscriptions: e.target.value,
                  })
                }
                disabled={isSubmitting}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-odc-border p-4">
            <div>
              <Label htmlFor="estPubliee" className="cursor-pointer">
                Publier la session
              </Label>
              <p className="text-xs text-odc-muted mt-0.5">
                Visible sur le planning public
              </p>
            </div>
            <Switch
              id="estPubliee"
              checked={form.estPubliee}
              onCheckedChange={(v) => setForm({ ...form, estPubliee: v })}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes internes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              disabled={isSubmitting}
              className="mt-1.5 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* ACTIONS */}
      <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-odc-border bg-odc-surface pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="odc"
          disabled={isSubmitting || !form.formationId || !form.dateDebut || !form.dateFin}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEdit ? 'Enregistrement…' : 'Création…'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Enregistrer' : 'Créer la session'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}