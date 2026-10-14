// src/app/(admin)/admin/roles/components/RoleForm.tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Shield, Lock, CheckCircle2, Info } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  usePermissions,
  type Permission,
  type Role,
  type RoleFormValues,
} from '@/hooks/useRoles';

/* ============================================================================
   SCHÉMA ZOD
   ============================================================================ */

const roleSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(2, 'Minimum 2 caractères')
    .max(50, 'Maximum 50 caractères')
    .regex(
      /^[A-Z][A-Z0-9_]*$/,
      'Le nom doit être en MAJUSCULES (ex: SUPERVISEUR)',
    ),
  libelle: z
    .string()
    .trim()
    .min(2, 'Minimum 2 caractères')
    .max(80, 'Maximum 80 caractères'),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  niveauHierarchie: z.coerce.number().int().min(0).max(1000).default(0),
  couleur: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6})$/, 'Couleur invalide')
    .default('#FF7900'),
  permissionCodes: z.array(z.string()).default([]),
});

/* ============================================================================
   TYPES
   ============================================================================ */

interface RoleFormProps {
  mode: 'create' | 'edit';
  id?: string;
  defaultValues?: Partial<Role>;
  onSubmit: (values: RoleFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  showActions?: boolean;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function RoleForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  showActions = true,
}: RoleFormProps) {
  const isEdit = mode === 'edit';
  const isSystem = defaultValues?.estSysteme ?? false;

  const { data: allPermissions = [], isLoading: isLoadingPermissions } =
    usePermissions();

  /* -------------------- Formulaire -------------------- */
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      nom: defaultValues?.nom ?? '',
      libelle: defaultValues?.libelle ?? '',
      description: defaultValues?.description ?? '',
      niveauHierarchie: defaultValues?.niveauHierarchie ?? 0,
      couleur: defaultValues?.couleur ?? '#FF7900',
      permissionCodes:
        defaultValues?.permissions?.map((p) => p.code) ?? [],
    },
    mode: 'onBlur',
  });

  /* -------------------- Groupement des permissions -------------------- */
  const permissionsByCategory = React.useMemo(() => {
    return allPermissions.reduce(
      (acc, p) => {
        const cat = p.categorie || 'Général';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(p);
        return acc;
      },
      {} as Record<string, Permission[]>,
    );
  }, [allPermissions]);

  /* -------------------- Handlers -------------------- */
  const togglePermission = (code: string) => {
    const current = form.getValues('permissionCodes');
    const next = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code];
    form.setValue('permissionCodes', next, { shouldDirty: true });
  };

  const toggleCategory = (category: string) => {
    const catPermissions =
      permissionsByCategory[category]?.map((p) => p.code) ?? [];
    const current = form.getValues('permissionCodes');
    const allSelected = catPermissions.every((c) => current.includes(c));

    if (allSelected) {
      form.setValue(
        'permissionCodes',
        current.filter((c) => !catPermissions.includes(c)),
        { shouldDirty: true },
      );
    } else {
      const merged = Array.from(new Set([...current, ...catPermissions]));
      form.setValue('permissionCodes', merged, { shouldDirty: true });
    }
  };

  const selectAll = () => {
    form.setValue(
      'permissionCodes',
      allPermissions.map((p) => p.code),
      { shouldDirty: true },
    );
  };

  const clearAll = () => {
    form.setValue('permissionCodes', [], { shouldDirty: true });
  };

  const permissionCount = form.watch('permissionCodes').length;

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
            Identité du rôle
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nom technique <span className="text-odc-error">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="SUPERVISEUR"
                      className="font-mono uppercase"
                      disabled={isSystem}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  {isSystem && (
                    <FormDescription className="flex items-center gap-1.5 text-odc-warning-dark">
                      <Lock className="h-3 w-3" />
                      Rôle système — non modifiable
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="libelle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Libellé <span className="text-odc-error">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex : Superviseur"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Décrivez le rôle et ses responsabilités…"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="niveauHierarchie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau hiérarchique</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={1000}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Plus le chiffre est élevé, plus le rôle est haut placé.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        aria-label="Couleur du rôle"
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
          </div>
        </fieldset>

        {/* ================================================================
            Section — Permissions
            ================================================================ */}
        <fieldset disabled={isSubmitting} className="space-y-4">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-semibold uppercase tracking-wider text-odc-text-muted">
              Permissions
            </legend>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {permissionCount} sélectionnée{permissionCount > 1 ? 's' : ''}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={selectAll}
                className="h-7 text-xs"
              >
                Tout
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-7 text-xs"
              >
                Aucun
              </Button>
            </div>
          </div>

          {isLoadingPermissions ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : allPermissions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-odc-border p-6 text-center">
              <Info className="mx-auto mb-2 h-5 w-5 text-odc-text-muted" />
              <p className="text-sm text-odc-text-muted">
                Aucune permission disponible
              </p>
            </div>
          ) : (
            <div className="max-h-96 space-y-4 overflow-y-auto scrollbar-thin rounded-lg border border-odc-border p-4">
              {Object.entries(permissionsByCategory).map(
                ([category, perms]) => {
                  const allSelected = perms.every((p) =>
                    form.watch('permissionCodes').includes(p.code),
                  );

                  return (
                    <div key={category}>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-odc-text-muted">
                          {category}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategory(category)}
                          className="h-6 text-[10px]"
                        >
                          {allSelected ? 'Désélectionner' : 'Tout sélectionner'}
                        </Button>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {perms.map((p) => {
                          const isSelected = form
                            .watch('permissionCodes')
                            .includes(p.code);

                          return (
                            <label
                              key={p.id}
                              className={cn(
                                'flex cursor-pointer items-start gap-2 rounded-md border p-2.5 transition-colors',
                                isSelected
                                  ? 'border-odc-primary-light bg-odc-primary-softer'
                                  : 'border-odc-border hover:bg-odc-surface-hover',
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => togglePermission(p.code)}
                                className="mt-0.5 accent-odc-primary"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-mono text-xs font-semibold text-odc-text-primary">
                                  {p.code}
                                </p>
                                <p className="text-[10px] text-odc-text-muted">
                                  {p.libelle}
                                </p>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-odc-primary" />
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
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
              {isEdit ? 'Mettre à jour' : 'Créer le rôle'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}