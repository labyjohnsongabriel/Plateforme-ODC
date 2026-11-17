// src/app/(staff)/staff/formations/components/FormationForm.tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Switch } from '@/components/ui/switch';

/* ═══════════════════════════════════════════════════════════════════════════
   SCHÉMA ZOD
   ═══════════════════════════════════════════════════════════════════════════ */

const formationSchema = z.object({
  titre: z.string().min(3, 'Le titre doit faire au moins 3 caractères').max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Uniquement minuscules, chiffres et tirets'),
  resume: z.string().max(500).optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  domaineId: z.string().min(1, 'Sélectionnez un domaine'),
  niveau: z.enum(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE']),
  dureeHeures: z.coerce.number().min(1, 'Minimum 1 heure').max(500),
  imageUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  estPubliee: z.boolean().default(false),
});

export type FormationFormValues = z.infer<typeof formationSchema>;

/* ═══════════════════════════════════════════════════════════════════════════
   PROPS
   ═══════════════════════════════════════════════════════════════════════════ */

interface Domaine {
  id: string;
  nom: string;
}

interface FormationFormProps {
  defaultValues?: Partial<FormationFormValues>;
  domaines: Domaine[];
  onSubmit: (values: FormationFormValues) => void | Promise<void>;
  onCancel: () => void;
  isPending?: boolean;
  mode: 'create' | 'edit';
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function FormationForm({
  defaultValues,
  domaines,
  onSubmit,
  onCancel,
  isPending,
  mode,
}: FormationFormProps) {
  const form = useForm<FormationFormValues>({
    resolver: zodResolver(formationSchema),
    defaultValues: {
      titre: '',
      slug: '',
      resume: '',
      description: '',
      domaineId: '',
      niveau: 'DEBUTANT',
      dureeHeures: 1,
      imageUrl: '',
      estPubliee: false,
      ...defaultValues,
    },
  });

  /* Auto-génération du slug depuis le titre (create uniquement) */
  const titre = form.watch('titre');
  useEffect(() => {
    if (mode === 'create' && titre) {
      const slug = titre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      form.setValue('slug', slug, { shouldValidate: false });
    }
  }, [titre, mode, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Titre */}
        <FormField
          control={form.control}
          name="titre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre *</FormLabel>
              <FormControl>
                <Input placeholder="Ex. Introduction à React" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug *</FormLabel>
              <FormControl>
                <Input
                  placeholder="introduction-a-react"
                  {...field}
                  className="font-mono text-sm"
                />
              </FormControl>
              <FormDescription>
                Identifiant unique dans l&apos;URL (auto-généré depuis le titre).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Domaine + Niveau */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="domaineId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domaine *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner…" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {domaines.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nom}
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
            name="niveau"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Niveau *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DEBUTANT">Débutant</SelectItem>
                    <SelectItem value="INTERMEDIAIRE">Intermédiaire</SelectItem>
                    <SelectItem value="AVANCE">Avancé</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Durée */}
        <FormField
          control={form.control}
          name="dureeHeures"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Durée (heures) *</FormLabel>
              <FormControl>
                <Input type="number" min={1} max={500} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Résumé */}
        <FormField
          control={form.control}
          name="resume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Résumé</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Court résumé affiché dans le catalogue"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormDescription>500 caractères max.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description complète de la formation"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image URL */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image (URL)</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Publiée */}
        <FormField
          control={form.control}
          name="estPubliee"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <FormLabel className="cursor-pointer">Publier immédiatement</FormLabel>
                <FormDescription>
                  Si désactivé, la formation sera en brouillon.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
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
            {mode === 'create' ? 'Créer la formation' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}