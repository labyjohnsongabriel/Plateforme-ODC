// src/app/(staff)/staff/sessions/components/SessionForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';

/* ═══════════════════════════════════════════════════════════════════════════
   SCHÉMA ZOD
   ═══════════════════════════════════════════════════════════════════════════ */

const sessionSchema = z
  .object({
    formationId: z.string().min(1, 'Sélectionnez une formation'),
    formateurId: z.string().optional().or(z.literal('')),
    codeSession: z.string().max(50).optional().or(z.literal('')),
    dateDebut: z.string().min(1, 'Date de début requise'),
    dateFin: z.string().min(1, 'Date de fin requise'),
    lieu: z.string().max(200).optional().or(z.literal('')),
    lienVisio: z.string().url('URL invalide').optional().or(z.literal('')),
    capacite: z.coerce.number().min(1, 'Minimum 1').max(500),
    statut: z.enum(['PLANIFIEE', 'OUVERTE', 'EN_COURS', 'TERMINEE', 'ANNULEE']),
    notes: z.string().optional().or(z.literal('')),
    estPubliee: z.boolean().default(true),
    dateOuvertureInscriptions: z.string().optional().or(z.literal('')),
    dateFermetureInscriptions: z.string().optional().or(z.literal('')),
  })
  .refine(
    (d) => !d.dateFin || !d.dateDebut || new Date(d.dateFin) >= new Date(d.dateDebut),
    {
      message: 'La date de fin doit être après la date de début',
      path: ['dateFin'],
    },
  );

export type SessionFormValues = z.infer<typeof sessionSchema>;

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function extractFormations(data: unknown): Array<{ id: string; titre: string }> {
  if (!data) return [];
  if (Array.isArray(data)) return data as Array<{ id: string; titre: string }>;
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['formations', 'data', 'items']) {
      if (Array.isArray(obj[key])) return obj[key] as Array<{ id: string; titre: string }>;
    }
  }
  return [];
}

function extractUsers(data: unknown): Array<{ id: string; prenom: string; nom: string }> {
  if (!data) return [];
  if (Array.isArray(data)) return data as Array<{ id: string; prenom: string; nom: string }>;
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['users', 'data', 'items']) {
      if (Array.isArray(obj[key])) return obj[key] as Array<{ id: string; prenom: string; nom: string }>;
    }
  }
  return [];
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROPS
   ═══════════════════════════════════════════════════════════════════════════ */

interface SessionFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<SessionFormValues>;
  onSubmit: (values: SessionFormValues) => void | Promise<void>;
  onCancel: () => void;
  isPending?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function SessionForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
}: SessionFormProps) {
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
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
      ...defaultValues,
    },
  });

  const { data: formations = [] } = useQuery({
    queryKey: ['staff', 'formations', 'all'],
    queryFn: async () => {
      const response = await api.get('/staff/formations', { params: { limit: 100 } });
      return extractFormations(response.data?.data ?? response.data);
    },
    staleTime: 5 * 60_000,
  });

  const { data: formateurs = [] } = useQuery({
    queryKey: ['staff', 'formateurs'],
    queryFn: async () => {
      const response = await api.get('/admin/users', {
        params: { role: 'FORMATEUR', limit: 100 },
      });
      return extractUsers(response.data?.data ?? response.data);
    },
    staleTime: 5 * 60_000,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Formation + Formateur */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="formationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Formation *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner…" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {formations.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.titre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="formateurId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Formateur</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
                  value={field.value || 'none'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Optionnel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {formateurs.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.prenom} {u.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Code session */}
        <FormField
          control={form.control}
          name="codeSession"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code session</FormLabel>
              <FormControl>
                <Input
                  placeholder="Auto-généré si vide"
                  className="font-mono"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Laisser vide pour auto-génération par le serveur.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="dateDebut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de début *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateFin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de fin *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Lieu + Visio */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="lieu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lieu</FormLabel>
                <FormControl>
                  <Input placeholder="Ex. ODC Antananarivo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lienVisio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lien visio</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Capacité + Statut */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="capacite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacité *</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={500} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="statut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PLANIFIEE">Planifiée</SelectItem>
                    <SelectItem value="OUVERTE">Ouverte</SelectItem>
                    <SelectItem value="EN_COURS">En cours</SelectItem>
                    <SelectItem value="TERMINEE">Terminée</SelectItem>
                    <SelectItem value="ANNULEE">Annulée</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes internes</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Inscriptions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="dateOuvertureInscriptions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ouverture inscriptions</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateFermetureInscriptions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fermeture inscriptions</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Publier */}
        <FormField
          control={form.control}
          name="estPubliee"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <FormLabel className="cursor-pointer">Publier la session</FormLabel>
                <FormDescription>
                  Si désactivé, la session sera en brouillon.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {mode === 'create' ? 'Créer la session' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}