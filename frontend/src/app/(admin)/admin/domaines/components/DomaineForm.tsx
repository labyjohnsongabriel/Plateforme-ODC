'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Wand2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { slugify } from '@/lib/slugify';
import type { Domaine, DomaineFormValues } from '../hooks/useDomaines';

/* ============================================================================
   SCHÉMA DE VALIDATION LOCAL
   ============================================================================ */

const domaineSchema = z.object({
  nom: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(80, 'Le nom ne peut dépasser 80 caractères')
    .trim(),
  slug: z
    .string()
    .max(80)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug invalide (ex: developpement-web)',
    )
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(500, 'Maximum 500 caractères')
    .optional()
    .or(z.literal('')),
  couleur: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6})$/, 'Couleur hexadécimale invalide (ex: #FF7900)')
    .default('#FF7900'),
  icone: z.string().max(50).optional().or(z.literal('')),
  actif: z.boolean().default(true),
  estPubliee: z.boolean().default(false),
  ordreAffichage: z.number().int().min(0).max(9999).default(0),
});

/* ============================================================================
   TYPES
   ============================================================================ */

interface DomaineFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<Domaine>;
  onSubmit: (values: DomaineFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  showActions?: boolean;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function DomaineForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  showActions = true,
}: DomaineFormProps) {
  const isEdit = mode === 'edit';

  /* -------------------- Formulaire -------------------- */
  const form = useForm<DomaineFormValues>({
    resolver: zodResolver(domaineSchema),
    defaultValues: {
      nom: defaultValues?.nom ?? '',
      slug: defaultValues?.slug ?? '',
      description: defaultValues?.description ?? '',
      couleur: defaultValues?.couleur ?? '#FF7900',
      icone: defaultValues?.icone ?? '',
      actif: defaultValues?.actif ?? true,
      estPubliee: defaultValues?.estPubliee ?? false,
      ordreAffichage: defaultValues?.ordreAffichage ?? 0,
    },
    mode: 'onBlur',
  });

  /* -------------------- Auto-slug -------------------- */
  const nomValue = form.watch('nom');
  React.useEffect(() => {
    if (!isEdit && nomValue && !form.getFieldState('slug').isDirty) {
      form.setValue('slug', slugify(nomValue), { shouldValidate: false });
    }
  }, [nomValue, isEdit, form]);

  /* -------------------- Submit -------------------- */
  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  /* -------------------- Rendu -------------------- */
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ================================================================
            Section — Informations générales
            ================================================================ */}
        <fieldset disabled={isSubmitting} className="space-y-5">
          <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-odc-text-muted">
            Informations générales
          </legend>

          {/* Nom */}
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nom du domaine <span className="text-odc-error">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ex : Développement Web"
                    autoFocus
                  />
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
                <FormLabel>Slug URL</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="developpement-web"
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const nom = form.getValues('nom');
                      if (nom) form.setValue('slug', slugify(nom));
                    }}
                    title="Générer depuis le nom"
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
                <FormDescription>
                  Utilisé dans l'URL publique. Laissez vide pour un slug
                  automatique.
                </FormDescription>
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
                    {...field}
                    rows={4}
                    placeholder="Décrivez brièvement ce domaine de formation…"
                    className="resize-none"
                  />
                </FormControl>
                <FormDescription>
                  {field.value?.length ?? 0}/500 caractères
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Couleur + Icône + Ordre */}
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="couleur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Couleur</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={field.value}
                        onChange={field.onChange}
                        className="h-10 w-14 cursor-pointer rounded-md border border-odc-border bg-odc-surface"
                        aria-label="Sélectionner une couleur"
                      />
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="#FF7900"
                        className="font-mono text-xs"
                        maxLength={7}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icône (emoji)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="📚"
                      className="text-lg"
                      maxLength={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ordreAffichage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordre d'affichage</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={9999}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>

        {/* ================================================================
            Section — Publication
            ================================================================ */}
        <fieldset disabled={isSubmitting} className="space-y-4">
          <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-odc-text-muted">
            Publication
          </legend>

          <FormField
            control={form.control}
            name="actif"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-odc-border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Actif</FormLabel>
                  <FormDescription>
                    Disponible dans la plateforme (admin et public)
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

          <FormField
            control={form.control}
            name="estPubliee"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-odc-border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Publié</FormLabel>
                  <FormDescription>
                    Visible sur le site public ODC
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
        </fieldset>

        {/* ================================================================
            Actions
            ================================================================ */}
        {showActions && (
          <div
            className={cn(
              'flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end',
              'border-t border-odc-border pt-5',
            )}
          >
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
            )}
            <Button
              type="submit"
              variant="odc"
              loading={isSubmitting}
              loadingText={isEdit ? 'Mise à jour…' : 'Création…'}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {isEdit ? 'Mettre à jour' : 'Créer le domaine'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}