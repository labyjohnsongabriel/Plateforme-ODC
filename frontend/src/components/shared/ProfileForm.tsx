// src/components/shared/ProfileForm.tsx
'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Loader2,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Camera,
  Building2,
  Briefcase,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { getMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';

/* ============================================================================
   SCHÉMA DE VALIDATION
   ============================================================================ */

const profileSchema = z.object({
  prenom: z
    .string()
    .trim()
    .min(2, 'Minimum 2 caractères')
    .max(50, 'Maximum 50 caractères'),
  nom: z
    .string()
    .trim()
    .min(2, 'Minimum 2 caractères')
    .max(50, 'Maximum 50 caractères'),
  email: z.string().trim().toLowerCase().email('Email invalide'),
  telephone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s().-]{6,20}$/, 'Numéro invalide')
    .optional()
    .or(z.literal('')),
  bio: z.string().max(500, 'Maximum 500 caractères').optional(),
  ville: z.string().max(100).optional(),
  entreprise: z.string().max(200).optional(),
  poste: z.string().max(200).optional(),
  siteWeb: z.string().trim().url('URL invalide').optional().or(z.literal('')),
  linkedin: z.string().trim().url('URL invalide').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

/* ============================================================================
   TYPES
   ============================================================================ */

interface UserProfile {
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
  role?: { nom: string; libelle?: string } | null;
  createdAt?: string;
}

/* ============================================================================
   STYLES RÉUTILISABLES (neutres)
   ============================================================================ */

const CARD_CLASS = cn(
  'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950',
);

const ICON_HEADER_CLASS = 'h-5 w-5 text-slate-500 dark:text-slate-400';

const LABEL_CLASS =
  'flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300';

const ERROR_CLASS = 'mt-1.5 text-xs text-red-600 dark:text-red-400';

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function ProfileForm() {
  const qc = useQueryClient();
  const { user: authUser, refetchUser } = useAuthContext();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  /* -------------------- Récupérer le profil -------------------- */
  const { data: profile, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get<{ data: UserProfile }>('/auth/me');
      return data.data;
    },
    initialData: authUser
      ? {
          ...authUser,
          bio: (authUser as any).bio ?? null,
          ville: (authUser as any).ville ?? null,
          entreprise: (authUser as any).entreprise ?? null,
          poste: (authUser as any).poste ?? null,
          siteWeb: (authUser as any).siteWeb ?? null,
          linkedin: (authUser as any).linkedin ?? null,
        }
      : undefined,
  });

  /* -------------------- Formulaire -------------------- */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      bio: '',
      ville: '',
      entreprise: '',
      poste: '',
      siteWeb: '',
      linkedin: '',
    },
  });

  /* -------------------- Reset quand le profil charge -------------------- */
  React.useEffect(() => {
    if (profile) {
      reset({
        nom: profile.nom ?? '',
        prenom: profile.prenom ?? '',
        email: profile.email ?? '',
        telephone: profile.telephone ?? '',
        bio: profile.bio ?? '',
        ville: profile.ville ?? '',
        entreprise: profile.entreprise ?? '',
        poste: profile.poste ?? '',
        siteWeb: profile.siteWeb ?? '',
        linkedin: profile.linkedin ?? '',
      });
    }
  }, [profile, reset]);

  /* -------------------- Mutation : update profile -------------------- */
  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const { data: res } = await api.put<{ data: UserProfile }>(
        '/users/me',
        {
          ...data,
          telephone: data.telephone || undefined,
          siteWeb: data.siteWeb || undefined,
          linkedin: data.linkedin || undefined,
        },
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success('Profil mis à jour');
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      refetchUser().catch(() => {});
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* -------------------- Mutation : upload avatar -------------------- */
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('photo', file);
      const { data } = await api.post<{ data: { photoUrl: string } }>(
        '/users/me/avatar',
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return data.data;
    },
    onSuccess: () => {
      toast.success('Photo mise à jour');
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      refetchUser().catch(() => {});
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* -------------------- Handlers -------------------- */
  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    uploadAvatarMutation.mutate(file);
    e.target.value = '';
  };

  const getInitials = () => {
    const p = profile?.prenom?.charAt(0) ?? '';
    const n = profile?.nom?.charAt(0) ?? '';
    return `${p}${n}`.toUpperCase() || '?';
  };

  const avatarSrc =
    profile?.photoUrl ? getMediaUrl(profile.photoUrl) : undefined;

  /* -------------------- Loading -------------------- */
  if (isLoading || !profile) {
    return <ProfileFormSkeleton />;
  }

  /* -------------------- Rendu -------------------- */
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-3xl space-y-6"
      noValidate
    >
      {/* ================================================================
          CARTE AVATAR
          ================================================================ */}
      <Card className={CARD_CLASS}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-50">
            <User className={ICON_HEADER_CLASS} aria-hidden />
            Photo de profil
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Une photo aide la communauté à vous reconnaître
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-5">
            <div className="group relative">
              <Avatar className="h-24 w-24 border-2 border-slate-200 dark:border-slate-800">
                <AvatarImage src={avatarSrc} alt="Photo de profil" />
                <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-2xl font-bold text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              {uploadAvatarMutation.isPending && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/50">
                  <Loader2 className="h-6 w-6 animate-spin text-white" aria-hidden />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadAvatarMutation.isPending}
                className={cn(
                  'h-9 rounded-lg border-slate-200 font-medium',
                  'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                  'dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
                )}
              >
                <Camera className="mr-2 h-4 w-4" aria-hidden />
                Changer la photo
              </Button>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                JPG, PNG ou WEBP · Max 5 Mo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================
          CARTE IDENTITÉ
          ================================================================ */}
      <Card className={CARD_CLASS}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-50">
            <User className={ICON_HEADER_CLASS} aria-hidden />
            Informations personnelles
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Nom / Prénom */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="prenom" className={LABEL_CLASS}>
                Prénom *
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
                <p className={ERROR_CLASS} role="alert">
                  {errors.prenom.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nom" className={LABEL_CLASS}>
                Nom *
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
                <p className={ERROR_CLASS} role="alert">
                  {errors.nom.message}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio" className={LABEL_CLASS}>
              Bio
            </Label>
            <Textarea
              id="bio"
              rows={3}
              placeholder="Quelques mots sur vous…"
              disabled={isSubmitting}
              {...register('bio')}
              className="mt-1.5 resize-none"
            />
            {errors.bio && (
              <p className={ERROR_CLASS} role="alert">
                {errors.bio.message}
              </p>
            )}
          </div>

          {/* Ville */}
          <div>
            <Label htmlFor="ville" className={LABEL_CLASS}>
              <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" aria-hidden />
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
        </CardContent>
      </Card>

      {/* ================================================================
          CARTE CONTACT
          ================================================================ */}
      <Card className={CARD_CLASS}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-50">
            <Mail className={ICON_HEADER_CLASS} aria-hidden />
            Contact
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email" className={LABEL_CLASS}>
                <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" aria-hidden />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                disabled
                {...register('email')}
                className="mt-1.5"
              />
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                L&apos;email ne peut pas être modifié
              </p>
            </div>

            <div>
              <Label htmlFor="telephone" className={LABEL_CLASS}>
                <Phone className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" aria-hidden />
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
                <p className={ERROR_CLASS} role="alert">
                  {errors.telephone.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================
          CARTE PROFESSIONNEL
          ================================================================ */}
      <Card className={CARD_CLASS}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-50">
            <Briefcase className={ICON_HEADER_CLASS} aria-hidden />
            Informations professionnelles
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="entreprise" className={LABEL_CLASS}>
                <Building2 className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" aria-hidden />
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
              <Label htmlFor="poste" className={LABEL_CLASS}>
                Poste
              </Label>
              <Input
                id="poste"
                placeholder="Développeur Full-Stack"
                disabled={isSubmitting}
                {...register('poste')}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="siteWeb" className={LABEL_CLASS}>
              <Globe className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" aria-hidden />
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
              <p className={ERROR_CLASS} role="alert">
                {errors.siteWeb.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="linkedin" className={LABEL_CLASS}>
              <Linkedin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" aria-hidden />
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
              <p className={ERROR_CLASS} role="alert">
                {errors.linkedin.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ================================================================
          BOUTON SAUVEGARDER
          ================================================================ */}
      <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || !isDirty}
          className={cn(
            'h-10 rounded-lg px-5 font-medium',
            'bg-slate-900 text-white shadow-sm',
            'hover:bg-slate-800',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:ring-slate-600',
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Enregistrement…
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" aria-hidden />
              Enregistrer les modifications
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

function ProfileFormSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Avatar */}
      <Card className={CARD_CLASS}>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-5">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Identité */}
      <Card className={CARD_CLASS}>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <Skeleton className="h-24" />
          <Skeleton className="h-16" />
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className={CARD_CLASS}>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>

      {/* Bouton */}
      <div className="flex justify-end">
        <Skeleton className="h-11 w-56" />
      </div>
    </div>
  );
}