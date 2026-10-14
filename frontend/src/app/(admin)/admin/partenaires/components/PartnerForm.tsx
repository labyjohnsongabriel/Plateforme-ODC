// src/app/(admin)/admin/partenaires/components/PartnerForm.tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Upload, Building2, Wand2, X } from 'lucide-react';
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
import {
  useUploadLogoPartenaire,
  type Partenaire,
  type PartenaireFormValues,
} from '@/hooks/usePartenaires';

/* ============================================================================
   SCHÉMA ZOD
   ============================================================================ */

const partenaireSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(2, 'Minimum 2 caractères')
    .max(120, 'Maximum 120 caractères'),
  slug: z.string().trim().optional().or(z.literal('')),
  secteur: z.string().trim().max(80).optional().or(z.literal('')),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  contactEmail: z
    .string()
    .trim()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  contactTel: z.string().trim().max(30).optional().or(z.literal('')),
  siteWeb: z
    .string()
    .trim()
    .url('URL invalide')
    .optional()
    .or(z.literal('')),
  logoUrl: z.string().trim().optional().or(z.literal('')),
  actif: z.boolean().default(true),
  estPubliee: z.boolean().default(true),
  ordreAffichage: z.coerce.number().int().min(0).max(9999).default(0),
});

/* ============================================================================
   TYPES
   ============================================================================ */

interface PartnerFormProps {
  mode: 'create' | 'edit';
  id?: string;
  defaultValues?: Partial<Partenaire>;
  onSubmit: (values: PartenaireFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  showActions?: boolean;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function PartnerForm({
  mode,
  id,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  showActions = true,
}: PartnerFormProps) {
  const isEdit = mode === 'edit';
  const fileRef = React.useRef<HTMLInputElement>(null);
  const lastSlugRef = React.useRef('');
  const uploadLogo = useUploadLogoPartenaire(id ?? '');

  const form = useForm<PartenaireFormValues>({
    resolver: zodResolver(partenaireSchema),
    defaultValues: {
      nom: defaultValues?.nom ?? '',
      slug: defaultValues?.slug ?? '',
      secteur: defaultValues?.secteur ?? '',
      description: defaultValues?.description ?? '',
      contactEmail: defaultValues?.contactEmail ?? '',
      contactTel: defaultValues?.contactTel ?? '',
      siteWeb: defaultValues?.siteWeb ?? '',
      logoUrl: defaultValues?.logoUrl ?? '',
      actif: defaultValues?.actif ?? true,
      estPubliee: defaultValues?.estPubliee ?? true,
      ordreAffichage: defaultValues?.ordreAffichage ?? 0,
    },
    mode: 'onBlur',
  });

  /* -------------------- Auto-slug -------------------- */
  const nomValue = form.watch('nom');
  const slugValue = form.watch('slug');
  const logoUrl = form.watch('logoUrl');

  React.useEffect(() => {
    if (isEdit) return;
    if (!nomValue) return;

    const newSlug = slugify(nomValue);
    if (newSlug === lastSlugRef.current) return;
    if (slugValue && slugValue !== lastSlugRef.current) return;

    lastSlugRef.current = newSlug;
    form.setValue('slug', newSlug, { shouldValidate: false, shouldDirty: false });
  }, [nomValue, slugValue, isEdit, form]);

  /* -------------------- Upload logo -------------------- */
  const handleLogoUpload = async (file: File) => {
    if (!isEdit || !id) return;
    try {
      const url = await uploadLogo.mutateAsync(file);
      if (url) form.setValue('logoUrl', url, { shouldDirty: true });
    } catch {
      /* Erreur déjà gérée */
    }
  };

  /* -------------------- Submit -------------------- */
  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  /* -------------------- Rendu -------------------- */
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* ================================================================
            Section — Identité
            ================================================================ */}
        <fieldset disabled={isSubmitting} className="space-y-5">
          <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-odc-text-muted">
            Identité du partenaire
          </legend>

          {/* Logo */}
          <div>
            <FormLabel>Logo</FormLabel>
            <div className="mt-1.5 flex items-center gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-odc-surface-alt ring-1 ring-odc-border">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Building2 className="h-10 w-10 text-odc-text-muted" />
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
                    if (f) handleLogoUpload(f);
                    e.target.value = '';
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={!isEdit || uploadLogo.isPending}
                  loading={uploadLogo.isPending}
                  leftIcon={<Upload className="h-4 w-4" />}
                >
                  {logoUrl ? 'Changer le logo' : 'Ajouter un logo'}
                </Button>
                {!isEdit && (
                  <p className="mt-1.5 text-xs text-odc-text-muted">
                    Enregistrez le partenaire d'abord, puis téléversez le logo.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Nom */}
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nom <span className="text-odc-error">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex : Telma Madagascar" autoFocus />
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
                      placeholder="telma-madagascar"
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const n = form.getValues('nom');
                      if (n) form.setValue('slug', slugify(n));
                    }}
                    title="Régénérer depuis le nom"
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Secteur */}
          <FormField
            control={form.control}
            name="secteur"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secteur d'activité</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex : Télécommunications" />
                </FormControl>
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
                    placeholder="Présentation rapide du partenaire…"
                    className="resize-none"
                  />
                </FormControl>
                <FormDescription>
                  {field.value?.length ?? 0}/1000 caractères
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        {/* ================================================================
            Section — Contact
            ================================================================ */}
        <fieldset disabled={isSubmitting} className="space-y-5">
          <legend className="mb-3 text-sm font-semibold uppercase tracking-wider text-odc-text-muted">
            Coordonnées
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de contact</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="contact@exemple.mg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactTel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="+261 34 12 345 67" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="siteWeb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site web</FormLabel>
                <FormControl>
                  <Input {...field} type="url" placeholder="https://exemple.mg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    Le partenaire est disponible dans la plateforme
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

          <FormField
            control={form.control}
            name="ordreAffichage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ordre d'affichage</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    max={9999}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Plus le chiffre est petit, plus le partenaire apparaît en premier.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-col-reverse gap-3 border-t border-odc-border pt-5 sm:flex-row sm:justify-end">
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
              {isEdit ? 'Mettre à jour' : 'Créer le partenaire'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}