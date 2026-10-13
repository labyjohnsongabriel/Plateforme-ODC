// src/app/(admin)/admin/utilisateurs/components/UserForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Save,
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Shield,
  MapPin,
  Briefcase,
  Building2,
  Globe,
  Linkedin,
  Camera,
  UserPlus,
  UserCog,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { RoleSelector } from './RoleSelector';

import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { getInitials, cn } from '@/lib/utils';
import type { User } from '@/types/user.types';

/* ============================================================================
   SCHÉMA DE VALIDATION
   ============================================================================ */

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const baseUserSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(2, 'Minimum 2 caractères')
    .max(50, 'Maximum 50 caractères'),

  prenom: z
    .string()
    .trim()
    .min(2, 'Minimum 2 caractères')
    .max(50, 'Maximum 50 caractères'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Adresse email invalide'),

  telephone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s().-]{6,20}$/, 'Numéro invalide')
    .optional()
    .or(z.literal('')),

  roleNom: z.enum(
    ['ADMINISTRATEUR', 'STAFF_ODC', 'FORMATEUR', 'PARTICIPANT', 'PARTENAIRE'],
    { required_error: 'Le rôle est requis' },
  ),

  bio: z.string().max(500, 'Maximum 500 caractères').optional(),

  ville: z.string().max(100).optional(),

  entreprise: z.string().max(200).optional(),

  poste: z.string().max(200).optional(),

  siteWeb: z
    .string()
    .trim()
    .url('URL invalide')
    .optional()
    .or(z.literal('')),

  linkedin: z
    .string()
    .trim()
    .url('URL invalide')
    .optional()
    .or(z.literal('')),

  actif: z.boolean().default(true),

  emailVerifie: z.boolean().default(false),
});

/* -------------------- Schéma CREATE (avec mot de passe) -------------------- */

const createSchema = baseUserSchema
  .extend({
    motDePasse: z
      .string()
      .min(8, 'Minimum 8 caractères')
      .regex(/[A-Z]/, 'Au moins une majuscule')
      .regex(/[a-z]/, 'Au moins une minuscule')
      .regex(/\d/, 'Au moins un chiffre'),
    confirmation: z.string(),
  })
  .refine((d) => d.motDePasse === d.confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmation'],
  });

/* -------------------- Schéma EDIT (sans mot de passe) -------------------- */

const editSchema = baseUserSchema;

type CreateFormData = z.infer<typeof createSchema>;
type EditFormData = z.infer<typeof editSchema>;
type FormData = CreateFormData | EditFormData;

/* ============================================================================
   TYPES
   ============================================================================ */

interface UserFormProps {
  mode?: 'create' | 'edit';
  userId?: string;
  /** Callback après succès */
  onSuccess?: () => void;
  /** Callback après annulation */
  onCancel?: () => void;
}

interface UserResponse {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
  ville?: string | null;
  entreprise?: string | null;
  poste?: string | null;
  siteWeb?: string | null;
  linkedin?: string | null;
  actif: boolean;
  emailVerifie: boolean;
  role?: { nom: string; libelle?: string };
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function UserForm({
  mode = 'create',
  userId,
  onSuccess,
  onCancel,
}: UserFormProps) {
  const router = useRouter();
  const qc = useQueryClient();

  const isEdit = mode === 'edit';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  /* -------------------- Récupérer l'utilisateur (edit) -------------------- */
  const { data: user, isLoading } = useQuery<UserResponse>({
    queryKey: ['admin', 'user', userId],
    queryFn: async () => {
      const { data } = await api.get(`/admin/users/${userId}`);
      return data.data;
    },
    enabled: isEdit && !!userId,
  });

  /* -------------------- Formulaire -------------------- */
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      roleNom: 'PARTICIPANT',
      bio: '',
      ville: '',
      entreprise: '',
      poste: '',
      siteWeb: '',
      linkedin: '',
      actif: true,
      emailVerifie: false,
      ...(isEdit ? {} : { motDePasse: '', confirmation: '' }),
    },
  });

  /* -------------------- Charger les données en édition -------------------- */
  useEffect(() => {
    if (user && isEdit) {
      reset({
        nom: user.nom ?? '',
        prenom: user.prenom ?? '',
        email: user.email ?? '',
        telephone: user.telephone ?? '',
        roleNom: (user.role?.nom ?? 'PARTICIPANT') as any,
        bio: user.bio ?? '',
        ville: user.ville ?? '',
        entreprise: user.entreprise ?? '',
        poste: user.poste ?? '',
        siteWeb: user.siteWeb ?? '',
        linkedin: user.linkedin ?? '',
        actif: user.actif ?? true,
        emailVerifie: user.emailVerifie ?? false,
      });
    }
  }, [user, isEdit, reset]);

  /* -------------------- Mutation Create/Update -------------------- */
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEdit && userId) {
        const { motDePasse, confirmation, ...updateData } =
          data as CreateFormData;
        const { data: res } = await api.put(
          `/admin/users/${userId}`,
          updateData,
        );
        return res.data;
      }

      const { data: res } = await api.post('/admin/users', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success(
        isEdit ? 'Utilisateur mis à jour' : 'Utilisateur créé avec succès',
      );
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      if (onSuccess) onSuccess();
      else router.push('/admin/utilisateurs');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* -------------------- Upload avatar -------------------- */
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('photo', file);
      const { data } = await api.post(`/admin/users/${userId}/avatar`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data.photoUrl;
    },
    onSuccess: () => {
      toast.success('Photo mise à jour');
      qc.invalidateQueries({ queryKey: ['admin', 'user', userId] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* -------------------- Handlers -------------------- */
  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else router.back();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Le fichier doit être une image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop lourde (max 5 Mo)');
      return;
    }

    setUploadingAvatar(true);
    try {
      await uploadAvatarMutation.mutateAsync(file);
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  /* -------------------- Loading (edit) -------------------- */
  if (isEdit && isLoading) {
    return <UserFormSkeleton />;
  }

  /* -------------------- Valeurs watch -------------------- */
  const watchedPrenom = watch('prenom');
  const watchedNom = watch('nom');

  /* -------------------- Rendu -------------------- */
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-4xl"
      noValidate
    >
      {/* ================================================================
          HEADER
          ================================================================ */}
      <header className="flex items-center gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shadow-odc-md',
            isEdit
              ? 'bg-gradient-to-br from-blue-500 to-blue-700'
              : 'bg-gradient-to-br from-odc-500 to-odc-700',
          )}
        >
          {isEdit ? (
            <UserCog className="h-6 w-6 text-white" />
          ) : (
            <UserPlus className="h-6 w-6 text-white" />
          )}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">
            {isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </h1>
          <p className="text-sm text-odc-muted">
            {isEdit
              ? 'Mettez à jour les informations du compte'
              : 'Créez un nouveau compte utilisateur'}
          </p>
        </div>
      </header>

      {/* ================================================================
          AVATAR (edit seulement)
          ================================================================ */}
      {isEdit && user && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Photo de profil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-odc-border">
                  <AvatarImage src={user.photoUrl ?? undefined} />
                  <AvatarFallback className="bg-odc-primary-soft text-odc-primary text-2xl font-bold">
                    {getInitials(user.nom, user.prenom)}
                  </AvatarFallback>
                </Avatar>

                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  id="avatar-input"
                  hidden
                  onChange={handleAvatarChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById('avatar-input')?.click()
                  }
                  disabled={uploadingAvatar}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Changer la photo
                </Button>
                <p className="text-xs text-odc-muted">
                  JPG, PNG ou WEBP · Max 5 Mo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ================================================================
          CARTE 1 — INFORMATIONS PERSONNELLES
          ================================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-odc-primary" />
            Informations personnelles
          </CardTitle>
          <CardDescription>
            Nom, prénom, email et coordonnées
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Nom + Prénom */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prenom">
                Prénom <span className="text-odc-error">*</span>
              </Label>
              <Input
                id="prenom"
                autoComplete="given-name"
                disabled={isSubmitting}
                {...register('prenom')}
                className="mt-1.5"
                aria-invalid={!!errors.prenom}
              />
              {errors.prenom && (
                <p className="text-odc-error text-xs mt-1.5" role="alert">
                  {errors.prenom.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nom">
                Nom <span className="text-odc-error">*</span>
              </Label>
              <Input
                id="nom"
                autoComplete="family-name"
                disabled={isSubmitting}
                {...register('nom')}
                className="mt-1.5"
                aria-invalid={!!errors.nom}
              />
              {errors.nom && (
                <p className="text-odc-error text-xs mt-1.5" role="alert">
                  {errors.nom.message}
                </p>
              )}
            </div>
          </div>

          {/* Email + Téléphone */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Email <span className="text-odc-error">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting || isEdit}
                {...register('email')}
                className="mt-1.5"
                aria-invalid={!!errors.email}
              />
              {isEdit && (
                <p className="text-xs text-odc-muted mt-1.5">
                  L&apos;email ne peut pas être modifié
                </p>
              )}
              {errors.email && (
                <p className="text-odc-error text-xs mt-1.5" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="telephone" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Téléphone
              </Label>
              <Input
                id="telephone"
                type="tel"
                placeholder="+261 34 12 345 67"
                autoComplete="tel"
                disabled={isSubmitting}
                {...register('telephone')}
                className="mt-1.5"
                aria-invalid={!!errors.telephone}
              />
              {errors.telephone && (
                <p className="text-odc-error text-xs mt-1.5" role="alert">
                  {errors.telephone.message}
                </p>
              )}
            </div>
          </div>

          {/* Ville */}
          <div>
            <Label htmlFor="ville" className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Ville
            </Label>
            <Input
              id="ville"
              placeholder="Antananarivo"
              disabled={isSubmitting}
              {...register('ville')}
              className="mt-1.5"
            />
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Biographie</Label>
            <Textarea
              id="bio"
              rows={3}
              placeholder="Quelques mots sur l'utilisateur…"
              disabled={isSubmitting}
              {...register('bio')}
              className="mt-1.5 resize-none"
            />
            {errors.bio && (
              <p className="text-odc-error text-xs mt-1.5" role="alert">
                {errors.bio.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ================================================================
          CARTE 2 — RÔLE
          ================================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-odc-primary" />
            Rôle et permissions
          </CardTitle>
          <CardDescription>
            Sélectionnez le rôle qui définit les accès de l&apos;utilisateur
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Controller
            name="roleNom"
            control={control}
            render={({ field }) => (
              <RoleSelector
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
                layout="grid"
              />
            )}
          />
          {errors.roleNom && (
            <p className="text-odc-error text-xs mt-1.5" role="alert">
              {errors.roleNom.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ================================================================
          CARTE 3 — MOT DE PASSE (create seulement)
          ================================================================ */}
      {!isEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-odc-primary" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Définissez un mot de passe sécurisé pour ce compte
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Mot de passe */}
            <div>
              <Label htmlFor="motDePasse">
                Mot de passe <span className="text-odc-error">*</span>
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="motDePasse"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...register('motDePasse' as any)}
                  className="pr-10"
                  aria-invalid={!!(errors as any).motDePasse}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-odc-muted hover:text-odc-primary transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {(errors as any).motDePasse && (
                <p className="text-odc-error text-xs mt-1.5" role="alert">
                  {(errors as any).motDePasse.message}
                </p>
              )}
            </div>

            {/* Confirmation */}
            <div>
              <Label htmlFor="confirmation">
                Confirmer le mot de passe{' '}
                <span className="text-odc-error">*</span>
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="confirmation"
                  type={showConfirmation ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...register('confirmation' as any)}
                  className="pr-10"
                  aria-invalid={!!(errors as any).confirmation}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmation((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-odc-muted hover:text-odc-primary transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirmation ? 'Masquer' : 'Afficher'}
                >
                  {showConfirmation ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {(errors as any).confirmation && (
                <p className="text-odc-error text-xs mt-1.5" role="alert">
                  {(errors as any).confirmation.message}
                </p>
              )}
            </div>

            {/* Règles */}
            <div className="p-3 rounded-lg bg-odc-surface-alt text-xs text-odc-muted">
              <p className="font-medium mb-1">Le mot de passe doit contenir :</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Au moins 8 caractères</li>
                <li>Une majuscule et une minuscule</li>
                <li>Au moins un chiffre</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ================================================================
          CARTE 4 — INFORMATIONS PROFESSIONNELLES
          ================================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-odc-primary" />
            Informations professionnelles
          </CardTitle>
          <CardDescription>
            Facultatif — Entreprise, poste, réseaux
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entreprise" className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Entreprise
              </Label>
              <Input
                id="entreprise"
                placeholder="Orange Madagascar"
                disabled={isSubmitting}
                {...register('entreprise')}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="poste">Poste</Label>
              <Input
                id="poste"
                placeholder="Développeur Full-Stack"
                disabled={isSubmitting}
                {...register('poste')}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteWeb" className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Site web
              </Label>
              <Input
                id="siteWeb"
                type="url"
                placeholder="https://..."
                disabled={isSubmitting}
                {...register('siteWeb')}
                className="mt-1.5"
                aria-invalid={!!errors.siteWeb}
              />
              {errors.siteWeb && (
                <p className="text-odc-error text-xs mt-1.5" role="alert">
                  {errors.siteWeb.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="linkedin" className="flex items-center gap-1.5">
                <Linkedin className="h-3.5 w-3.5" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/..."
                disabled={isSubmitting}
                {...register('linkedin')}
                className="mt-1.5"
                aria-invalid={!!errors.linkedin}
              />
              {errors.linkedin && (
                <p className="text-odc-error text-xs mt-1.5" role="alert">
                  {errors.linkedin.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================
          CARTE 5 — STATUT DU COMPTE
          ================================================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Statut du compte</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Actif */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="actif" className="font-medium cursor-pointer">
                Compte actif
              </Label>
              <p className="text-xs text-odc-muted mt-0.5">
                Un compte inactif ne peut pas se connecter
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

          {/* Email vérifié */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label
                htmlFor="emailVerifie"
                className="font-medium cursor-pointer"
              >
                Email vérifié
              </Label>
              <p className="text-xs text-odc-muted mt-0.5">
                Marquer l&apos;email comme vérifié manuellement
              </p>
            </div>
            <Controller
              name="emailVerifie"
              control={control}
              render={({ field }) => (
                <Switch
                  id="emailVerifie"
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
      <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-odc-surface/95 backdrop-blur-sm p-4 rounded-lg border border-odc-border shadow-odc-md z-10">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Annuler
        </Button>

        <Button
          type="submit"
          variant="odc"
          size="lg"
          disabled={isSubmitting || (isEdit && !isDirty)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEdit ? 'Enregistrement…' : 'Création…'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Enregistrer' : 'Créer l\'utilisateur'}
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

function UserFormSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>

      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
            <Skeleton className="h-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}