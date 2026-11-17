// src/app/(admin)/admin/formations/components/FormationForm.tsx
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2,
  Save,
  BookOpen,
  Target,
  GraduationCap,
  Clock,
  Users,
  DollarSign,
  Info,
  Plus,
  X,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';

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
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';
import { slugify } from '@/lib/slugify';
import { getMediaUrl } from '@/lib/media';

/* ============================================================================
   NORMALISATION — Garantit un tableau de chaînes
   ============================================================================ */

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === 'string')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((v): v is string => typeof v === 'string')
            .map((s) => s.trim())
            .filter(Boolean);
        }
      } catch {
        /* ignore */
      }
    }

    return trimmed
      .split(/[,;\n\r]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
}

/* ============================================================================
   TYPES
   ============================================================================ */

interface Domaine {
  id: string;
  nom: string;
  slug: string;
}

interface FormationFormProps {
  mode: 'create' | 'edit';
  id?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/* ============================================================================
   SCHÉMA ZOD
   ============================================================================ */

const formationSchema = z.object({
  titre: z
    .string()
    .trim()
    .min(5, 'Minimum 5 caractères')
    .max(200, 'Maximum 200 caractères'),

  slug: z.string().trim().optional().or(z.literal('')),

  description: z.string().trim().min(20, 'Minimum 20 caractères'),

  domaineId: z.string().min(1, 'Le domaine est requis'),

  niveau: z.enum(['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE'], {
    required_error: 'Le niveau est requis',
  }),

  dureeHeures: z.coerce
    .number({ required_error: 'La durée est requise' })
    .int('Nombre entier')
    .min(1, 'Minimum 1 heure')
    .max(500, 'Maximum 500 heures'),

  prix: z.coerce.number().min(0).optional(),

  nbParticipantsMax: z.coerce
    .number()
    .int()
    .min(1, 'Minimum 1 place')
    .max(500, 'Maximum 500 places')
    .optional(),

  objectifs: z.array(z.string()).default([]),
  prerequis: z.array(z.string()).default([]),

  programme: z.string().optional().or(z.literal('')),
  imageUrl: z.string().optional().or(z.literal('')),

  estPubliee: z.boolean().default(false),
  actif: z.boolean().default(true),
  miseEnAvant: z.boolean().default(false),
});

type FormationFormData = z.infer<typeof formationSchema>;

/* ============================================================================
   CONSTANTES
   ============================================================================ */

const NIVEAUX = [
  { value: 'DEBUTANT', label: 'Débutant', color: 'text-green-600' },
  { value: 'INTERMEDIAIRE', label: 'Intermédiaire', color: 'text-blue-600' },
  { value: 'AVANCE', label: 'Avancé', color: 'text-red-600' },
] as const;

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function FormationForm({ mode, id, onSuccess, onCancel }: FormationFormProps) {
  const qc = useQueryClient();
  const isEdit = mode === 'edit';

  const [newObjectif, setNewObjectif] = React.useState('');
  const [newPrerequis, setNewPrerequis] = React.useState('');
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string>();
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const lastSlugRef = React.useRef('');

  /* -------------------- Formulaire -------------------- */
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormationFormData>({
    resolver: zodResolver(formationSchema),
    defaultValues: {
      titre: '',
      slug: '',
      description: '',
      domaineId: '',
      niveau: 'DEBUTANT',
      dureeHeures: 10,
      prix: 0,
      nbParticipantsMax: 30,
      objectifs: [],
      prerequis: [],
      programme: '',
      imageUrl: '',
      estPubliee: false,
      actif: true,
      miseEnAvant: false,
    },
  });

  const titreValue = watch('titre');
  const slugValue = watch('slug');
  const imageUrlValue = watch('imageUrl');
  const objectifsValue = toArray(watch('objectifs'));
  const prerequisValue = toArray(watch('prerequis'));

  React.useEffect(() => {
    if (!selectedImage) {
      setImagePreview(undefined);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImage]);

  /* -------------------- Slug auto -------------------- */
  React.useEffect(() => {
    if (isEdit) return;
    if (!titreValue) return;

    const newSlug = slugify(titreValue);
    if (newSlug === lastSlugRef.current) return;

    // Si l'utilisateur a modifié manuellement, ne pas écraser
    if (slugValue && slugValue !== lastSlugRef.current) return;

    lastSlugRef.current = newSlug;
    setValue('slug', newSlug, { shouldValidate: false, shouldDirty: false });
  }, [titreValue, slugValue, isEdit, setValue]);

  /* -------------------- Domaines -------------------- */
  const { data: domaines = [] } = useQuery<Domaine[]>({
    queryKey: ['admin', 'domaines'],
    queryFn: async () => {
      const { data } = await api.get('/admin/domaines');
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      return Array.isArray(list) ? list : [];
    },
    staleTime: 10 * 60_000,
  });

  /* -------------------- Formation (edit) -------------------- */
  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin', 'formation', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/formations/${id}`);
      return data?.data ?? data;
    },
    enabled: isEdit && !!id,
  });

  React.useEffect(() => {
    if (existing && isEdit) {
      reset({
        titre: existing.titre ?? '',
        slug: existing.slug ?? '',
        description: existing.description ?? '',
        domaineId: existing.domaineId ?? '',
        niveau: existing.niveau ?? 'DEBUTANT',
        dureeHeures: existing.dureeHeures ?? 10,
        prix: existing.prix ?? 0,
        nbParticipantsMax: existing.nbParticipantsMax ?? 30,
        objectifs: toArray(existing.objectifs),
        prerequis: toArray(existing.prerequis),
        programme: existing.programme ?? '',
        imageUrl: existing.imageUrl ?? '',
        estPubliee: existing.estPubliee ?? false,
        actif: existing.actif ?? true,
        miseEnAvant: existing.miseEnAvant ?? false,
      });
    }
  }, [existing, isEdit, reset]);

  /* -------------------- Mutation -------------------- */
  const mutation = useMutation({
    mutationFn: async ({
      data,
      image,
    }: {
      data: FormationFormData;
      image: File | null;
    }) => {
      const payload = {
        ...data,
        slug: data.slug || slugify(data.titre),
        prix: data.prix ?? 0,
        nbParticipantsMax: data.nbParticipantsMax ?? undefined,
        imageUrl: data.imageUrl || undefined,
        programme: data.programme || undefined,
        objectifs: toArray(data.objectifs),
        prerequis: toArray(data.prerequis),
      };

      let formationId = isEdit ? id : undefined;
      if (isEdit && id) {
        const { data: res } = await api.put(`/admin/formations/${id}`, payload);
      } else {
        const { data: res } = await api.post('/admin/formations', payload);
        formationId = (res?.data ?? res)?.id;
      }

      if (image) {
        if (!formationId) {
          return {
            id: formationId,
            imageError:
              "La formation est enregistrée, mais son identifiant manque pour téléverser l'image.",
          };
        }
        const formData = new FormData();
        formData.append('image', image);
        try {
          await api.post(`/admin/formations/${formationId}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch (error) {
          return {
            id: formationId,
            imageError: `La formation est enregistrée, mais l’image n’a pas pu être téléversée : ${getErrorMessage(error)}`,
          };
        }
      }
      return { id: formationId, imageError: null };
    },
    onSuccess: (result) => {
      if (result.imageError) {
        toast.error(result.imageError);
      } else {
        toast.success(isEdit ? 'Formation mise à jour' : 'Formation créée');
      }
      qc.invalidateQueries({ queryKey: ['admin', 'formations'] });
      qc.invalidateQueries({ queryKey: ['formations', 'public'] });
      onSuccess?.();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* -------------------- Objectifs -------------------- */
  const addObjectif = () => {
    const val = newObjectif.trim();
    if (!val) return;
    setValue('objectifs', [...objectifsValue, val], { shouldDirty: true });
    setNewObjectif('');
  };

  const removeObjectif = (index: number) => {
    setValue(
      'objectifs',
      objectifsValue.filter((_, i) => i !== index),
      { shouldDirty: true },
    );
  };

  /* -------------------- Prérequis -------------------- */
  const addPrerequis = () => {
    const val = newPrerequis.trim();
    if (!val) return;
    setValue('prerequis', [...prerequisValue, val], { shouldDirty: true });
    setNewPrerequis('');
  };

  const removePrerequis = (index: number) => {
    setValue(
      'prerequis',
      prerequisValue.filter((_, i) => i !== index),
      { shouldDirty: true },
    );
  };

  /* -------------------- Loading (edit) -------------------- */
  if (isEdit && isLoading) {
    return <FormationFormSkeleton />;
  }

  /* -------------------- Submit -------------------- */
  const onSubmit = (data: FormationFormData) => {
    mutation.mutate({ data, image: selectedImage });
  };

  /* -------------------- Rendu -------------------- */
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* ================================================================
          CARTE 1 — INFORMATIONS GÉNÉRALES
          ================================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-odc-primary" />
            Informations générales
          </CardTitle>
          <CardDescription>Titre, description, domaine et niveau</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="titre">
              Titre de la formation <span className="text-odc-error">*</span>
            </Label>
            <Input
              id="titre"
              placeholder="Ex: Développement Web Full-Stack"
              disabled={isSubmitting}
              {...register('titre')}
              className="mt-1.5"
              aria-invalid={!!errors.titre}
            />
            {errors.titre && (
              <p className="mt-1.5 text-xs text-odc-error" role="alert">
                {errors.titre.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              placeholder="developpement-web-full-stack"
              disabled={isSubmitting}
              {...register('slug')}
              className="mt-1.5 font-mono text-sm"
            />
            <p className="text-odc-muted mt-1.5 text-xs">
              Auto-généré depuis le titre si laissé vide
            </p>
          </div>

          <div>
            <Label htmlFor="description">
              Description <span className="text-odc-error">*</span>
            </Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="Description détaillée…"
              disabled={isSubmitting}
              {...register('description')}
              className="mt-1.5"
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-odc-error" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>
                Domaine <span className="text-odc-error">*</span>
              </Label>
              <Controller
                name="domaineId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="mt-1.5" aria-invalid={!!errors.domaineId}>
                      <SelectValue placeholder="Sélectionner un domaine" />
                    </SelectTrigger>
                    <SelectContent>
                      {domaines.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.domaineId && (
                <p className="mt-1.5 text-xs text-odc-error">
                  {errors.domaineId.message}
                </p>
              )}
            </div>

            <div>
              <Label>
                Niveau <span className="text-odc-error">*</span>
              </Label>
              <Controller
                name="niveau"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NIVEAUX.map((n) => (
                        <SelectItem key={n.value} value={n.value}>
                          <span className={cn('mr-2', n.color)}>●</span>
                          {n.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================
          CARTE 2 — DÉTAILS
          ================================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-odc-primary" />
            Détails
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="dureeHeures" className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Durée (h) <span className="text-odc-error">*</span>
              </Label>
              <Input
                id="dureeHeures"
                type="number"
                min={1}
                max={500}
                disabled={isSubmitting}
                {...register('dureeHeures')}
                className="mt-1.5"
              />
              {errors.dureeHeures && (
                <p className="mt-1.5 text-xs text-odc-error">
                  {errors.dureeHeures.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nbParticipantsMax" className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Places max
              </Label>
              <Input
                id="nbParticipantsMax"
                type="number"
                min={1}
                max={500}
                disabled={isSubmitting}
                {...register('nbParticipantsMax')}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="prix" className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                Prix (Ar)
              </Label>
              <Input
                id="prix"
                type="number"
                min={0}
                step={1000}
                placeholder="0 = gratuit"
                disabled={isSubmitting}
                {...register('prix')}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            {imagePreview || imageUrlValue ? (
              <img
                src={getMediaUrl(imagePreview || imageUrlValue)}
                alt="Aperçu de l’image de la formation"
                className="mb-3 aspect-video max-h-56 w-full rounded-lg object-cover"
              />
            ) : null}
            <Label htmlFor="imageUrl" className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              Image de la formation
            </Label>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (!file.type.startsWith('image/')) {
                    toast.error('Le fichier doit être une image.');
                    event.target.value = '';
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error('La taille maximale de l’image est de 5 Mo.');
                    event.target.value = '';
                    return;
                  }
                  setSelectedImage(file);
                  event.target.value = '';
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => imageInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {selectedImage ? 'Changer l’image' : 'Téléverser une image'}
              </Button>
              {selectedImage && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting}
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
              )}
            </div>
            <Input
              id="imageUrl"
              type="url"
              placeholder="Ou collez une URL d’image"
              disabled={isSubmitting || !!selectedImage}
              {...register('imageUrl')}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* ================================================================
          CARTE 3 — OBJECTIFS
          ================================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-odc-primary" />
            Objectifs pédagogiques
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newObjectif}
              onChange={(e) => setNewObjectif(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addObjectif();
                }
              }}
              placeholder="Ex: Créer une application React complète"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addObjectif}
              disabled={!newObjectif.trim() || isSubmitting}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Ajouter
            </Button>
          </div>

          {objectifsValue.length > 0 ? (
            <ul className="space-y-2">
              {objectifsValue.map((o, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 rounded-md bg-odc-primary-soft/30 px-3 py-2 text-sm"
                >
                  <span className="flex-1">{o}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-odc-muted h-7 w-7 hover:text-odc-error"
                    onClick={() => removeObjectif(i)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-odc-muted text-sm italic">Aucun objectif</p>
          )}
        </CardContent>
      </Card>

      {/* ================================================================
          CARTE 4 — PRÉREQUIS
          ================================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-odc-primary" />
            Prérequis
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newPrerequis}
              onChange={(e) => setNewPrerequis(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addPrerequis();
                }
              }}
              placeholder="Ex: Connaissance de base en HTML"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addPrerequis}
              disabled={!newPrerequis.trim() || isSubmitting}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Ajouter
            </Button>
          </div>

          {prerequisValue.length > 0 ? (
            <ul className="space-y-2">
              {prerequisValue.map((p, i) => (
                <li
                  key={i}
                  className="bg-odc-surface-alt flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm"
                >
                  <span className="flex-1">{p}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-odc-muted h-7 w-7 hover:text-odc-error"
                    onClick={() => removePrerequis(i)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-odc-muted text-sm italic">Aucun prérequis</p>
          )}
        </CardContent>
      </Card>

      {/* ================================================================
          CARTE 5 — PROGRAMME
          ================================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-odc-primary" />
            Programme détaillé
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Textarea
            id="programme"
            rows={8}
            placeholder="Détaillez le programme…"
            disabled={isSubmitting}
            {...register('programme')}
            className="resize-y"
          />
        </CardContent>
      </Card>

      {/* ================================================================
          CARTE 6 — PUBLICATION
          ================================================================ */}
      <Card>
        <CardHeader>
          <CardTitle>Publication</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="actif" className="cursor-pointer font-medium">
                Compte actif
              </Label>
              <p className="text-odc-muted mt-0.5 text-xs">
                La formation peut être modifiée
              </p>
            </div>
            <Controller
              name="actif"
              control={control}
              render={({ field }) => (
                <Switch
                  id="actif"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              )}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="estPubliee" className="cursor-pointer font-medium">
                Publier la formation
              </Label>
              <p className="text-odc-muted mt-0.5 text-xs">
                Visible dans le catalogue public
              </p>
            </div>
            <Controller
              name="estPubliee"
              control={control}
              render={({ field }) => (
                <Switch
                  id="estPubliee"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              )}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="miseEnAvant" className="cursor-pointer font-medium">
                Mettre en avant
              </Label>
              <p className="text-odc-muted mt-0.5 text-xs">
                Affichée en tête du catalogue
              </p>
            </div>
            <Controller
              name="miseEnAvant"
              control={control}
              render={({ field }) => (
                <Switch
                  id="miseEnAvant"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* ================================================================
          ACTIONS
          ================================================================ */}
      <div className="border-odc-border bg-odc-surface sticky bottom-0 flex items-center justify-end gap-3 border-t pt-4">
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
          disabled={isSubmitting || (isEdit && !isDirty)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? 'Enregistrement…' : 'Création…'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEdit ? 'Enregistrer' : 'Créer la formation'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

/* ============================================================================
   SKELETON
   ============================================================================ */

function FormationFormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="bg-odc-surface-alt h-5 w-40 animate-pulse rounded" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-odc-surface-alt h-16 animate-pulse rounded" />
            <div className="bg-odc-surface-alt h-16 animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
